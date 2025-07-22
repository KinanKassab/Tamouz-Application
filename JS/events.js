/* 
===========================================
SCOUTPLUSE - UNIFIED EVENTS MANAGEMENT SYSTEM
===========================================

This file contains the complete events management system, combining:
1. Original events functionality (events.js)
2. New events system with PHP API integration (events-new.js)
3. Integration layer (events-integration.js)

Features:
- Event creation, viewing, and joining
- PHP API integration with fallback to demo data
- Image upload functionality
- Category filtering and search
- Role-based permissions
- Mobile-responsive design
*/

/**
 * API Configuration for PHP Backend
 * Update these URLs to match your 000webhost hosting setup
 */
const API_CONFIG = {
    baseUrl: '', // نفس النطاق - لا حاجة لـ baseUrl
    securityToken: 'ScoutPlus(WebApp)',
    endpoints: {
        read: '/read.php',
        write: '/write.php'
    }
};

/**
 * Unified Events Service Class
 * 
 * Handles all event-related functionality including:
 * - Loading events from PHP API or demo data
 * - Creating, viewing, and joining events
 * - Image upload and management
 * - Search and filtering
 * - Role-based permissions
 */
class EventsService {
    constructor() {
        this.events = [];
        this.currentUser = null;
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.selectedImages = [];
        this.coverImageIndex = 0;
        this.isLoading = false;
        
        // Enhanced category system
        this.categories = [
            { id: 'ramita', name: 'Ramita', color: 'var(--primary-600)' },
            { id: 'ma3lola', name: 'Ma3lola', color: 'var(--blue-600)' },
            { id: 'Sergila', name: 'Sergila', color: 'var(--amber-600)' },
            { id: 'Bousra', name: 'Bousra', color: 'var(--red-600)' },
            // Legacy categories for backward compatibility
            { id: 'Outdoor', name: 'Outdoor', color: 'var(--primary-600)' },
            { id: 'Service', name: 'Service', color: 'var(--blue-600)' },
            { id: 'Education', name: 'Education', color: 'var(--amber-600)' },
            { id: 'Competition', name: 'Competition', color: 'var(--red-600)' }
        ];
        
        this.init();
    }

    /**
     * Initialize the Events Service
     */
    async init() {
        console.log('🎉 Initializing Unified Events Service...');
        
        this.currentUser = AuthService.getCurrentUser();
        if (!this.currentUser) {
            console.error('❌ No authenticated user found');
            return;
        }
        
        this.setupEventListeners();
        await this.loadEvents();
        this.renderEventsPage();
        
        console.log('✅ Events Service initialized successfully');
    }

    /**
     * Load Events from PHP API or Demo Data
     */
    async loadEvents() {
        this.setLoading(true);
        
        try {
            // Try to load from PHP API first
            const response = await fetch(API_CONFIG.endpoints.read, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.events = result.data.events || [];
                    console.log(`📋 Loaded ${this.events.length} events from PHP API`);
                } else {
                    throw new Error(result.error || 'Failed to load events');
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to load from PHP API, trying JSON fallback:', error.message);
            
            try {
                // Try to load from JSON file
                const jsonResponse = await fetch('/JS/events.json');
                if (jsonResponse.ok) {
                    const jsonData = await jsonResponse.json();
                    this.events = jsonData.events || [];
                    console.log(`📋 Loaded ${this.events.length} events from JSON file`);
                } else {
                    throw new Error('Failed to load events.json');
                }
            } catch (jsonError) {
                console.warn('⚠️ Failed to load from JSON, using demo data:', jsonError.message);
                this.events = [...DEMO_EVENTS];
                console.log(`📋 Loaded ${this.events.length} events from demo data`);
            }
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Save Events to PHP API
     */
    async saveEvents() {
        try {
            const eventsData = {
                events: this.events,
                lastUpdated: new Date().toISOString()
            };

            const response = await fetch(API_CONFIG.endpoints.write, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: API_CONFIG.securityToken,
                    data: eventsData
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('✅ Events saved to PHP API successfully');
                    return true;
                } else {
                    throw new Error(result.error || 'Failed to save events');
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Failed to save events to PHP API:', error);
            this.showNotification('Failed to save events. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Create event button - only show for leaders and admins
        const createEventBtn = document.getElementById('createEventBtn');
        if (createEventBtn) {
            if (this.canCreateEvents()) {
                createEventBtn.addEventListener('click', this.showCreateEventModal.bind(this));
                createEventBtn.style.display = 'flex';
            } else {
                createEventBtn.style.display = 'none';
            }
        }

        // Search functionality
        const searchInput = document.getElementById('eventsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderEventsPage();
            });
        }

        // Category filters
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.selectedCategory = e.target.dataset.category;
                this.updateCategoryFilters();
                this.renderEventsPage();
            });
        });

        // Modal close functionality
        const eventModal = document.getElementById('eventModal');
        const eventModalClose = document.getElementById('eventModalClose');
        
        if (eventModalClose) {
            eventModalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (eventModal) {
            eventModal.addEventListener('click', (e) => {
                if (e.target === eventModal) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Render Events Page
     */
    renderEventsPage() {
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsGrid) return;

        if (this.isLoading) {
            eventsGrid.innerHTML = this.getLoadingHTML();
            return;
        }

        const filteredEvents = this.getFilteredEvents();

        if (filteredEvents.length === 0) {
            eventsGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        eventsGrid.innerHTML = filteredEvents
            .map(event => this.getEventCardHTML(event))
            .join('');

        this.setupEventCardListeners();
    }

    /**
     * Get Filtered Events
     */
    getFilteredEvents() {
        let filtered = this.events.filter(event => {
            // Filter by user's troop (if not admin)
            if (this.currentUser.role !== 'admin' && event.troop !== this.currentUser.troop) {
                return false;
            }
            
            // Filter by category
            if (this.selectedCategory !== 'all' && event.category !== this.selectedCategory) {
                return false;
            }
            
            // Filter by search query
            if (this.searchQuery) {
                const searchFields = [
                    event.title,
                    event.description,
                    event.location,
                    event.category
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(this.searchQuery)) {
                    return false;
                }
            }
            
            return true;
        });

        // Sort by date (upcoming first)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
    }

    /**
     * Get Event Card HTML
     */
    getEventCardHTML(event) {
        const attendancePercentage = Math.round((event.attendees?.length || 0) / (event.maxAttendees || 1) * 100);
        const hasJoined = event.attendees?.includes(this.currentUser.id);
        const isUpcoming = event.status === 'upcoming';
        const isFull = (event.attendees?.length || 0) >= (event.maxAttendees || 0);

        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-image">
                    <img src="${event.image || event.coverImage || this.getDefaultEventImage()}" alt="${event.title}" loading="lazy">
                    <div class="event-category-badge category-${event.category?.toLowerCase()}">
                        ${this.getCategoryDisplayName(event.category)}
                    </div>
                    ${event.status ? `<div class="event-status-badge status-${event.status}">${this.getStatusDisplayName(event.status)}</div>` : ''}
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-description">${event.description}</p>
                    
                    <div class="event-details">
                        <div class="event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${this.formatDate(event.date)}
                        </div>
                        <div class="event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            ${event.time}
                        </div>
                        <div class="event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${event.location}
                        </div>
                    </div>

                    <div class="attendance-section">
                        <div class="attendance-info">
                            <span>Attendance</span>
                            <span class="attendance-count">${event.attendees?.length || 0}/${event.maxAttendees || 0}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${attendancePercentage}%"></div>
                        </div>
                    </div>

                    <div class="event-actions">
                        ${this.getEventActionsHTML(event, isUpcoming, isFull, hasJoined)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get Event Actions HTML
     */
    getEventActionsHTML(event, isUpcoming, isFull, hasJoined) {
        // Guests can only view
        if (this.currentUser.role === 'guest') {
            return `
                <button class="event-btn event-btn-secondary event-view-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View Details
                </button>
            `;
        }

        let actions = [];

        // View button (always available)
        actions.push(`
            <button class="event-btn event-btn-secondary event-view-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View
            </button>
        `);

        // Join/Leave button for upcoming events
        if (isUpcoming && this.canJoinEvents()) {
            if (hasJoined) {
                actions.push(`
                    <button class="event-btn event-btn-joined" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        Joined
                    </button>
                `);
            } else if (isFull) {
                actions.push(`
                    <button class="event-btn event-btn-secondary" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Full
                    </button>
                `);
            } else {
                actions.push(`
                    <button class="event-btn event-btn-primary event-join-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Join
                    </button>
                `);
            }
        }

        return actions.join('');
    }

    /**
     * Setup Event Card Listeners
     */
    setupEventCardListeners() {
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            const eventId = card.dataset.eventId;
            const event = this.findEvent(eventId);
            
            if (!event) return;

            // View button
            const viewBtn = card.querySelector('.event-view-btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEventDetailsModal(event);
                });
            }

            // Join button
            const joinBtn = card.querySelector('.event-join-btn');
            if (joinBtn) {
                joinBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.joinEvent(eventId);
                });
            }

            // Card click (view details)
            card.addEventListener('click', () => {
                this.showEventDetailsModal(event);
            });
        });
    }

    /**
     * Show Create Event Modal
     */
    showCreateEventModal() {
        if (!this.canCreateEvents()) {
            this.showNotification('You do not have permission to create events', 'error');
            return;
        }

        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('eventModalTitle');
        const modalBody = document.getElementById('eventModalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = 'Create New Event';
            modalBody.innerHTML = this.getCreateEventFormHTML();
            modal.style.display = 'flex';
            
            this.setupCreateEventForm();
        }
    }

    /**
     * Get Create Event Form HTML
     */
    getCreateEventFormHTML() {
        const categoryOptions = this.categories
            .filter(cat => !['Outdoor', 'Service', 'Education', 'Competition'].includes(cat.id))
            .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
            .join('');

        return `
            <form id="createEventForm" class="event-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventTitle">Event Title *</label>
                        <input type="text" id="eventTitle" required placeholder="Enter event title">
                    </div>
                    <div class="form-group">
                        <label for="eventCategory">Category *</label>
                        <select id="eventCategory" required>
                            <option value="">Select category</option>
                            ${categoryOptions}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="eventDescription">Description *</label>
                    <textarea id="eventDescription" required placeholder="Describe the event..." rows="3"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventDate">Date *</label>
                        <input type="date" id="eventDate" required>
                    </div>
                    <div class="form-group">
                        <label for="eventTime">Time *</label>
                        <input type="time" id="eventTime" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventLocation">Location *</label>
                        <input type="text" id="eventLocation" required placeholder="Event location">
                    </div>
                    <div class="form-group">
                        <label for="eventMaxAttendees">Max Attendees *</label>
                        <input type="number" id="eventMaxAttendees" required min="1" placeholder="25">
                    </div>
                </div>

                <div class="image-upload-section">
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21,15 16,10 5,21"></polyline>
                            </svg>
                        </div>
                        <div class="upload-text">Click to upload images</div>
                        <div class="upload-hint">Or drag and drop images here</div>
                    </div>
                    <input type="file" id="imageUpload" class="file-input" multiple accept="image/*">
                    <div id="imagePreviewGrid" class="image-preview-grid"></div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="window.eventsService.closeModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create Event
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Setup Create Event Form
     */
    setupCreateEventForm() {
        const form = document.getElementById('createEventForm');
        if (form) {
            form.addEventListener('submit', this.handleCreateEvent.bind(this));
        }
        
        // Set default date to today
        const dateInput = document.getElementById('eventDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Set default time
        const timeInput = document.getElementById('eventTime');
        if (timeInput) {
            timeInput.value = '10:00';
        }

        // Setup image upload
        this.setupImageUpload();
    }

    /**
     * Setup Image Upload
     */
    setupImageUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('imageUpload');
        
        if (!uploadArea || !fileInput) return;

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleImageSelection(e.target.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.parentElement.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.parentElement.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.parentElement.classList.remove('dragover');
            this.handleImageSelection(e.dataTransfer.files);
        });
    }

    /**
     * Handle Image Selection
     */
    handleImageSelection(files) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.selectedImages.push({
                    file: file,
                    url: e.target.result,
                    name: file.name
                });
                this.updateImagePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Update Image Preview
     */
    updateImagePreview() {
        const previewGrid = document.getElementById('imagePreviewGrid');
        if (!previewGrid) return;

        previewGrid.innerHTML = this.selectedImages.map((image, index) => `
            <div class="image-preview ${index === this.coverImageIndex ? 'selected' : ''}" data-index="${index}">
                <img src="${image.url}" alt="${image.name}">
                <div class="image-preview-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>
                <button class="remove-image" data-index="${index}">×</button>
                ${index === this.coverImageIndex ? '<div class="cover-indicator">Cover</div>' : ''}
            </div>
        `).join('');

        // Setup preview listeners
        this.setupImagePreviewListeners();
    }

    /**
     * Setup Image Preview Listeners
     */
    setupImagePreviewListeners() {
        const previews = document.querySelectorAll('.image-preview');
        previews.forEach(preview => {
            const index = parseInt(preview.dataset.index);
            
            // Click to set as cover
            preview.addEventListener('click', () => {
                this.coverImageIndex = index;
                this.updateImagePreview();
            });
            
            // Remove image
            const removeBtn = preview.querySelector('.remove-image');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectedImages.splice(index, 1);
                    if (this.coverImageIndex >= index) {
                        this.coverImageIndex = Math.max(0, this.coverImageIndex - 1);
                    }
                    this.updateImagePreview();
                });
            }
        });
    }

    /**
     * Handle Create Event
     */
    async handleCreateEvent(e) {
        e.preventDefault();
        
        // Get submit button reference before any async operations
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        
        const formData = {
            title: document.getElementById('eventTitle').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value.trim(),
            category: document.getElementById('eventCategory').value,
            maxAttendees: parseInt(document.getElementById('eventMaxAttendees').value)
        };
        
        // Validation
        if (!this.validateEventForm(formData)) {
            return;
        }

        try {
            // Show loading state
            if (submitBtn) {
                submitBtn.innerHTML = '<div class="loading-spinner"></div> Creating...';
                submitBtn.disabled = true;
            }

            // Upload images and get URLs (simulate upload for demo)
            const imageUrls = await this.uploadImages();
            
            const eventData = {
                ...formData,
                id: Date.now().toString(),
                attendees: [],
                status: 'upcoming',
                troop: this.currentUser.troop,
                createdBy: this.currentUser.id,
                createdAt: new Date().toISOString(),
                images: imageUrls,
                image: imageUrls[this.coverImageIndex] || imageUrls[0] || this.getDefaultEventImage()
            };

            // Add to local events array
            this.events.unshift(eventData);

            // Save to PHP API
            const saved = await this.saveEvents();
            
            if (saved) {
                this.showNotification(`Event "${eventData.title}" created successfully!`, 'success');
                this.closeModal();
                this.renderEventsPage();
                
                // Update dashboard if available
                if (window.dashboardService) {
                    window.dashboardService.refresh();
                }
            } else {
                // Remove event if save failed
                this.events = this.events.filter(e => e.id !== eventData.id);
            }

        } catch (error) {
            console.error('❌ Error creating event:', error);
            this.showNotification('Failed to create event. Please try again.', 'error');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    /**
     * Validate Event Form
     */
    validateEventForm(formData) {
        const requiredFields = ['title', 'description', 'date', 'time', 'location', 'category'];
        
        for (const field of requiredFields) {
            if (!formData[field]) {
                this.showNotification(`Please fill in the ${field} field`, 'error');
                return false;
            }
        }
        
        if (!formData.maxAttendees || formData.maxAttendees < 1) {
            this.showNotification('Max attendees must be at least 1', 'error');
            return false;
        }
        
        // Check if date is in the future
        const eventDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
            this.showNotification('Event date must be in the future', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Upload Images (Simulated)
     */
    async uploadImages() {
        // In a real implementation, this would upload to a server
        // For demo purposes, we'll return the data URLs
        return this.selectedImages.map(img => img.url);
    }

    /**
     * Join Event
     */
    async joinEvent(eventId) {
        if (!this.canJoinEvents()) {
            this.showNotification('You do not have permission to join events', 'error');
            return;
        }

        const event = this.findEvent(eventId);
        if (!event) {
            this.showNotification('Event not found', 'error');
            return;
        }

        if (event.attendees?.includes(this.currentUser.id)) {
            this.showNotification('You have already joined this event!', 'error');
            return;
        }

        if ((event.attendees?.length || 0) >= (event.maxAttendees || 0)) {
            this.showNotification('Event is full!', 'error');
            return;
        }

        try {
            // Update event attendees
            if (!event.attendees) event.attendees = [];
            event.attendees.push(this.currentUser.id);

            // Update user's joined events
            if (!this.currentUser.joinedEvents) {
                this.currentUser.joinedEvents = [];
            }
            this.currentUser.joinedEvents.push(eventId);
            AuthService.updateUser(this.currentUser);

            // Save to PHP API
            const saved = await this.saveEvents();
            
            if (saved) {
                this.showNotification(`Successfully joined "${event.title}"!`, 'success');
                this.renderEventsPage();
                
                // Update dashboard if available
                if (window.dashboardService) {
                    window.dashboardService.refresh();
                }
            } else {
                // Rollback changes if save failed
                event.attendees = event.attendees.filter(id => id !== this.currentUser.id);
                this.currentUser.joinedEvents = this.currentUser.joinedEvents.filter(id => id !== eventId);
                AuthService.updateUser(this.currentUser);
            }
        } catch (error) {
            console.error('❌ Error joining event:', error);
            this.showNotification('Failed to join event. Please try again.', 'error');
        }
    }

    /**
     * Show Event Details Modal
     */
    showEventDetailsModal(event) {
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('eventModalTitle');
        const modalBody = document.getElementById('eventModalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = event.title;
            modalBody.innerHTML = this.getEventDetailsHTML(event);
            modal.style.display = 'flex';
        }
    }

    /**
     * Get Event Details HTML
     */
    getEventDetailsHTML(event) {
        const hasJoined = event.attendees?.includes(this.currentUser.id);
        const isFull = (event.attendees?.length || 0) >= (event.maxAttendees || 0);
        const isUpcoming = event.status === 'upcoming';

        return `
            <div class="event-details">
                <img src="${event.image || event.coverImage || this.getDefaultEventImage()}" 
                     alt="${event.title}" 
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;">
                
                <p style="margin-bottom: 16px; color: var(--text-secondary); line-height: 1.6;">${event.description}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div>
                        <strong style="color: var(--text-primary);">Date:</strong> 
                        <span style="color: var(--text-secondary);">${this.formatDate(event.date)}</span>
                    </div>
                    <div>
                        <strong style="color: var(--text-primary);">Time:</strong> 
                        <span style="color: var(--text-secondary);">${event.time}</span>
                    </div>
                    <div>
                        <strong style="color: var(--text-primary);">Location:</strong> 
                        <span style="color: var(--text-secondary);">${event.location}</span>
                    </div>
                    <div>
                        <strong style="color: var(--text-primary);">Category:</strong> 
                        <span style="color: var(--text-secondary);">${this.getCategoryDisplayName(event.category)}</span>
                    </div>
                    <div>
                        <strong style="color: var(--text-primary);">Attendees:</strong> 
                        <span style="color: var(--text-secondary);">${event.attendees?.length || 0}/${event.maxAttendees || 0}</span>
                    </div>
                    <div>
                        <strong style="color: var(--text-primary);">Status:</strong> 
                        <span style="color: var(--text-secondary);">${this.getStatusDisplayName(event.status)}</span>
                    </div>
                </div>
                
                ${this.getModalActionsHTML(event, isUpcoming, isFull, hasJoined)}
            </div>
        `;
    }

    /**
     * Get Modal Actions HTML
     */
    getModalActionsHTML(event, isUpcoming, isFull, hasJoined) {
        if (this.currentUser.role === 'guest') {
            return '';
        }

        if (isUpcoming && !hasJoined && !isFull && this.canJoinEvents()) {
            return `
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button class="btn btn-primary" onclick="window.eventsService.joinEventFromModal('${event.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Join Event
                    </button>
                </div>
            `;
        }
        
        return '';
    }

    /**
     * Join Event from Modal
     */
    joinEventFromModal(eventId) {
        this.joinEvent(eventId);
        this.closeModal();
    }

    /**
     * Update Category Filters
     */
    updateCategoryFilters() {
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            filter.classList.toggle('active', filter.dataset.category === this.selectedCategory);
        });
    }

    /**
     * Close Modal
     */
    closeModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reset form state
        this.selectedImages = [];
        this.coverImageIndex = 0;
    }

    /**
     * Set Loading State
     */
    setLoading(loading) {
        this.isLoading = loading;
    }

    /**
     * Get Loading HTML
     */
    getLoadingHTML() {
        return `
            <div class="events-loading">
                <svg class="loading-spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                </svg>
                <span>Loading events...</span>
            </div>
        `;
    }

    /**
     * Get Empty State HTML
     */
    getEmptyStateHTML() {
        const title = this.searchQuery || this.selectedCategory !== 'all' 
            ? 'No events found' 
            : 'No events available';
        
        const description = this.searchQuery || this.selectedCategory !== 'all'
            ? 'Try adjusting your search or filter criteria'
            : 'No events available for your troop yet.';

        return `
            <div class="events-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    /**
     * Find Event by ID
     */
    findEvent(eventId) {
        return this.events.find(event => event.id == eventId);
    }

    /**
     * Check if user can create events
     */
    canCreateEvents() {
        return this.currentUser && ['leader', 'admin'].includes(this.currentUser.role);
    }

    /**
     * Check if user can join events
     */
    canJoinEvents() {
        return this.currentUser && ['member', 'leader', 'admin'].includes(this.currentUser.role);
    }

    /**
     * Get Category Display Name
     */
    getCategoryDisplayName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : categoryId;
    }

    /**
     * Get Status Display Name
     */
    getStatusDisplayName(status) {
        const statusMap = {
            'upcoming': 'Upcoming',
            'past': 'Past',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    /**
     * Format Date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Get Default Event Image
     */
    getDefaultEventImage() {
        const defaultImages = [
            'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/163403/box-sport-men-training-163403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ];
        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

    /**
     * Show Notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            ${icon}
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    /**
     * Get Notification Icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>',
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        };
        return icons[type] || icons.info;
    }

    // ===========================================
    // PUBLIC API METHODS
    // ===========================================

    /**
     * Refresh Events
     */
    async refresh() {
        this.currentUser = AuthService.getCurrentUser();
        this.setupEventListeners();
        await this.loadEvents();
        this.renderEventsPage();
    }

    /**
     * Get Events
     */
    getEvents() {
        return this.events;
    }

    /**
     * Get Filtered Events (Public)
     */
    getFilteredEventsPublic() {
        return this.getFilteredEvents();
    }
}

// ===========================================
// INTEGRATION FUNCTIONS
// ===========================================

/**
 * Update Events Page Content in Main Application
 */
function updateEventsPageContent() {
    const eventsPage = document.getElementById('eventsPage');
    if (!eventsPage) return;
    
    eventsPage.innerHTML = `
        <div class="events-page">
            <!-- Page Header -->
            <div class="events-header">
                <h1>Events</h1>
                <div class="events-header-actions">
                    <button class="btn btn-primary" id="createEventBtn" style="display: none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create Event
                    </button>
                </div>
            </div>

            <!-- Search and Filter Controls -->
            <div class="events-controls">
                <div class="search-container">
                    <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="eventsSearch" class="search-input" placeholder="Search events by title, description, or location...">
                </div>
                
                <div class="category-filters">
                    <button class="category-filter active" data-category="all">All Events</button>
                    <button class="category-filter" data-category="ramita">Ramita</button>
                    <button class="category-filter" data-category="ma3lola">Ma3lola</button>
                    <button class="category-filter" data-category="Sergila">Sergila</button>
                    <button class="category-filter" data-category="Bousra">Bousra</button>
                </div>
            </div>

            <!-- Events Grid -->
            <div id="eventsGrid" class="events-grid">
                <!-- Events will be loaded here -->
            </div>
        </div>

        <!-- Event Modal -->
        <div id="eventModal" class="event-modal">
            <div class="event-modal-content">
                <div class="event-modal-header">
                    <h2 id="eventModalTitle">Event Details</h2>
                    <button class="event-modal-close" id="eventModalClose" aria-label="Close modal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="event-modal-body" id="eventModalBody">
                    <!-- Modal content will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Re-initialize the events service after updating the DOM
    setTimeout(() => {
        if (window.eventsService && typeof window.eventsService.init === 'function') {
            window.eventsService.init();
        }
    }, 100);
}

/**
 * Update Demo Data Categories
 */
function updateDemoData() {
    if (window.DEMO_EVENTS) {
        window.DEMO_EVENTS.forEach(event => {
            // Map old categories to new ones
            const categoryMap = {
                'Outdoor': 'ramita',
                'Service': 'ma3lola', 
                'Education': 'Sergila',
                'Competition': 'Bousra'
            };
            
            if (categoryMap[event.category]) {
                event.category = categoryMap[event.category];
            }
        });
    }
}

// ===========================================
// INITIALIZATION
// ===========================================

// Initialize the unified events service
let eventsService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        // Update demo data categories
        updateDemoData();
        
        // Initialize events service
        eventsService = new EventsService();
        window.eventsService = eventsService;
        
        // Update events page content if we're on the main app
        const eventsPage = document.getElementById('eventsPage');
        if (eventsPage) {
            updateEventsPageContent();
        }
        
        console.log('✅ Unified Events Service initialized');
    }
});

// ===========================================
// GLOBAL EXPORTS
// ===========================================

// Export for use in other files
window.EventsService = EventsService;
window.updateEventsPageContent = updateEventsPageContent;
window.updateDemoData = updateDemoData;

console.log('📜 Unified Events module loaded successfully');
