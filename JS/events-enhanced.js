/* 
===========================================
SCOUTPLUSE - ENHANCED EVENTS SYSTEM
===========================================

Enhanced events management with PHP API integration
*/

/**
 * Enhanced Events Service with API Integration
 */
class EnhancedEventsService {
    constructor() {
        this.events = [];
        this.currentUser = null;
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.isLoading = false;
        this.lastSync = null;
        
        // Enhanced category system
        this.categories = [
            { id: 'ramita', name: 'Ramita', color: 'var(--primary-600)' },
            { id: 'ma3lola', name: 'Ma3lola', color: 'var(--blue-600)' },
            { id: 'Sergila', name: 'Sergila', color: 'var(--amber-600)' },
            { id: 'Bousra', name: 'Bousra', color: 'var(--red-600)' }
        ];
        
        this.init();
    }

    /**
     * Initialize the Enhanced Events Service
     */
    async init() {
        console.log('🚀 Initializing Enhanced Events Service...');
        
        this.currentUser = AuthService.getCurrentUser();
        if (!this.currentUser) {
            console.error('❌ No authenticated user found');
            return;
        }
        
        this.setupEventListeners();
        await this.loadEvents();
        this.renderEventsPage();
        
        console.log('✅ Enhanced Events Service initialized successfully');
    }

    /**
     * Load Events with API Integration and Fallback
     */
    async loadEvents() {
        this.setLoading(true);
        
        try {
            console.log('📡 Attempting to load events from API...');
            
            // Test API connection first
            const connectionTest = await window.apiService.testConnection();
            
            if (connectionTest.success) {
                // Load from API
                const apiData = await window.apiService.readEvents();
                this.events = apiData.events || [];
                this.lastSync = new Date().toISOString();
                
                console.log(`✅ Loaded ${this.events.length} events from API`);
                this.showNotification(`Loaded ${this.events.length} events from server`, 'success');
                
            } else {
                throw new Error(connectionTest.message);
            }
            
        } catch (error) {
            console.warn('⚠️ API failed, trying fallback methods:', error.message);
            
            try {
                // Try JSON file fallback
                const response = await fetch('../JS/events.json');
                if (response.ok) {
                    const jsonData = await response.json();
                    this.events = jsonData.events || [];
                    console.log(`📋 Loaded ${this.events.length} events from JSON file`);
                    this.showNotification('Loaded events from local file', 'info');
                } else {
                    throw new Error('JSON file not accessible');
                }
            } catch (jsonError) {
                console.warn('⚠️ JSON fallback failed, using demo data:', jsonError.message);
                
                // Final fallback to demo data
                this.events = [...(window.DEMO_EVENTS || [])];
                console.log(`📋 Loaded ${this.events.length} events from demo data`);
                this.showNotification('Using demo data - API unavailable', 'warning');
            }
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Save Events to API
     */
    async saveEvents() {
        if (!window.apiService) {
            console.warn('⚠️ API service not available');
            return false;
        }

        try {
            console.log('💾 Saving events to API...');
            
            const result = await window.apiService.writeEvents(this.events);
            this.lastSync = new Date().toISOString();
            
            console.log('✅ Events saved successfully');
            this.showNotification('Events saved successfully!', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to save events:', error);
            this.showNotification(`Save failed: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Add New Event with API Integration
     */
    async addEvent(eventData) {
        try {
            console.log('➕ Adding new event...');
            
            // Prepare event data
            const newEvent = {
                ...eventData,
                id: this.generateEventId(),
                attendees: [],
                status: 'upcoming',
                troop: this.currentUser.troop,
                createdBy: this.currentUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Try to add via API first
            if (window.apiService) {
                try {
                    await window.apiService.addEvent(newEvent);
                    
                    // Reload events from server to get the latest state
                    await this.loadEvents();
                    
                    console.log('✅ Event added via API');
                    this.showNotification(`Event "${newEvent.title}" created successfully!`, 'success');
                    return true;
                    
                } catch (apiError) {
                    console.warn('⚠️ API add failed, adding locally:', apiError.message);
                    
                    // Add locally and try to sync later
                    this.events.unshift(newEvent);
                    this.showNotification(`Event created locally - will sync when possible`, 'warning');
                }
            } else {
                // Add locally only
                this.events.unshift(newEvent);
                this.showNotification(`Event "${newEvent.title}" created locally!`, 'info');
            }

            return true;
            
        } catch (error) {
            console.error('❌ Error adding event:', error);
            this.showNotification(`Failed to create event: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Join Event with API Sync
     */
    async joinEvent(eventId) {
        if (!this.canJoinEvents()) {
            this.showNotification('You do not have permission to join events', 'error');
            return false;
        }

        const event = this.findEvent(eventId);
        if (!event) {
            this.showNotification('Event not found', 'error');
            return false;
        }

        if (event.attendees?.includes(this.currentUser.id)) {
            this.showNotification('You have already joined this event!', 'error');
            return false;
        }

        if ((event.attendees?.length || 0) >= (event.maxAttendees || 0)) {
            this.showNotification('Event is full!', 'error');
            return false;
        }

        try {
            // Update event locally
            if (!event.attendees) event.attendees = [];
            event.attendees.push(this.currentUser.id);
            event.updatedAt = new Date().toISOString();

            // Update user's joined events
            if (!this.currentUser.joinedEvents) {
                this.currentUser.joinedEvents = [];
            }
            this.currentUser.joinedEvents.push(eventId);
            AuthService.updateUser(this.currentUser);

            // Try to sync with API
            const saved = await this.saveEvents();
            
            if (saved) {
                this.showNotification(`Successfully joined "${event.title}"!`, 'success');
            } else {
                this.showNotification(`Joined "${event.title}" - will sync when possible`, 'warning');
            }

            this.renderEventsPage();
            
            // Update dashboard if available
            if (window.dashboardService) {
                window.dashboardService.refresh();
            }

            return true;
            
        } catch (error) {
            // Rollback changes if something went wrong
            event.attendees = event.attendees.filter(id => id !== this.currentUser.id);
            this.currentUser.joinedEvents = this.currentUser.joinedEvents.filter(id => id !== eventId);
            AuthService.updateUser(this.currentUser);
            
            console.error('❌ Error joining event:', error);
            this.showNotification('Failed to join event. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Create event button
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

        // Modal functionality
        this.setupModalListeners();
        
        // Sync button (if exists)
        const syncBtn = document.getElementById('syncEventsBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', this.syncWithAPI.bind(this));
        }
    }

    /**
     * Setup Modal Listeners
     */
    setupModalListeners() {
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
     * Sync with API manually
     */
    async syncWithAPI() {
        console.log('🔄 Manual sync requested...');
        
        this.showNotification('Syncing with server...', 'info');
        
        try {
            await this.loadEvents();
            this.renderEventsPage();
            this.showNotification('Sync completed successfully!', 'success');
        } catch (error) {
            console.error('❌ Sync failed:', error);
            this.showNotification(`Sync failed: ${error.message}`, 'error');
        }
    }

    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Render Events Page with Enhanced UI
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
        
        // Update sync status
        this.updateSyncStatus();
    }

    /**
     * Update Sync Status Display
     */
    updateSyncStatus() {
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus && this.lastSync) {
            const syncTime = new Date(this.lastSync).toLocaleTimeString();
            syncStatus.textContent = `Last synced: ${syncTime}`;
            syncStatus.style.color = 'var(--text-muted)';
        }
    }

    /**
     * Enhanced Event Card HTML with API Status
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
                    ${event.createdAt && new Date(event.createdAt) > new Date(Date.now() - 24*60*60*1000) ? '<div class="new-event-badge">New</div>' : ''}
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
     * Get Enhanced Loading HTML
     */
    getLoadingHTML() {
        return `
            <div class="events-loading">
                <svg class="loading-spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                </svg>
                <span>Loading events from server...</span>
                <div class="loading-details">
                    <small>Connecting to same domain...</small>
                </div>
            </div>
        `;
    }

    /**
     * Enhanced Create Event Form with API Status
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
            modalTitle.innerHTML = `
                Create New Event
                <div class="api-status ${window.apiService ? 'api-connected' : 'api-disconnected'}">
                    ${window.apiService ? '🟢 API Connected' : '🔴 Offline Mode'}
                </div>
            `;
            modalBody.innerHTML = this.getCreateEventFormHTML();
            modal.style.display = 'flex';
            
            this.setupCreateEventForm();
        }
    }

    /**
     * Handle Create Event with Enhanced Error Handling
     */
    async handleCreateEvent(e) {
        e.preventDefault();
        
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
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Creating...';
            submitBtn.disabled = true;

            // Add event
            const success = await this.addEvent(formData);
            
            if (success) {
                this.closeModal();
                this.renderEventsPage();
                
                // Update dashboard if available
                if (window.dashboardService) {
                    window.dashboardService.refresh();
                }
            }

        } catch (error) {
            console.error('❌ Error creating event:', error);
            this.showNotification('Failed to create event. Please try again.', 'error');
        } finally {
            // Reset button state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create Event
                `;
                submitBtn.disabled = false;
            }
        }
    }

    // Inherit all other methods from the original EventsService
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

    getModalActionsHTML(event, isUpcoming, isFull, hasJoined) {
        if (this.currentUser.role === 'guest') {
            return '';
        }

        if (isUpcoming && !hasJoined && !isFull && this.canJoinEvents()) {
            return `
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button class="btn btn-primary" onclick="window.enhancedEventsService.joinEventFromModal('${event.id}')">
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

    joinEventFromModal(eventId) {
        this.joinEvent(eventId);
        this.closeModal();
    }

    updateCategoryFilters() {
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            filter.classList.toggle('active', filter.dataset.category === this.selectedCategory);
        });
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
    }

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
                ${window.apiService ? '<button class="btn btn-outline" onclick="window.enhancedEventsService.syncWithAPI()">🔄 Refresh from Server</button>' : ''}
            </div>
        `;
    }

    getCreateEventFormHTML() {
        const categoryOptions = this.categories
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
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="window.enhancedEventsService.closeModal()">
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
    }

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

    // Utility methods
    findEvent(eventId) {
        return this.events.find(event => event.id == eventId);
    }

    canCreateEvents() {
        return this.currentUser && ['leader', 'admin'].includes(this.currentUser.role);
    }

    canJoinEvents() {
        return this.currentUser && ['member', 'leader', 'admin'].includes(this.currentUser.role);
    }

    getCategoryDisplayName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : categoryId;
    }

    getStatusDisplayName(status) {
        const statusMap = {
            'upcoming': 'Upcoming',
            'past': 'Past',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    getDefaultEventImage() {
        const defaultImages = [
            'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ];
        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

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

    getNotificationIcon(type) {
        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>',
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        };
        return icons[type] || icons.info;
    }

    // Public API methods
    async refresh() {
        this.currentUser = AuthService.getCurrentUser();
        this.setupEventListeners();
        await this.loadEvents();
        this.renderEventsPage();
    }

    getEvents() {
        return this.events;
    }

    getFilteredEventsPublic() {
        return this.getFilteredEvents();
    }
}

// Initialize enhanced events service
let enhancedEventsService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        enhancedEventsService = new EnhancedEventsService();
        window.enhancedEventsService = enhancedEventsService;
        
        // Replace the original events service
        window.eventsService = enhancedEventsService;
    }
});

// Export for use in other files
window.EnhancedEventsService = EnhancedEventsService;

console.log('🚀 Enhanced Events Service loaded successfully');