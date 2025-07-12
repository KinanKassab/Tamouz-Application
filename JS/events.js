// Events Management
class EventsService {
    constructor() {
        this.events = [...DEMO_EVENTS]; // Create a copy to allow modifications
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.setupEventListeners();
        this.loadEvents();
    }

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
    }

    canCreateEvents() {
        return this.currentUser && ['leader', 'admin'].includes(this.currentUser.role);
    }

    canJoinEvents() {
        return this.currentUser && ['member', 'leader', 'admin'].includes(this.currentUser.role);
    }

    loadEvents() {
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsGrid) return;

        // Filter events by user's troop and show all events
        const filteredEvents = this.events.filter(event => event.troop === this.currentUser.troop);

        if (filteredEvents.length === 0) {
            eventsGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        eventsGrid.innerHTML = filteredEvents
            .map(event => this.getEventCardHTML(event))
            .join('');

        // Add event listeners to event cards
        this.setupEventCardListeners();
    }

    setupEventCardListeners() {
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach((card, index) => {
            const joinBtn = card.querySelector('.event-join-btn');
            const viewBtn = card.querySelector('.event-view-btn');

            if (joinBtn) {
                joinBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.joinEvent(this.getFilteredEvents()[index]);
                });
            }

            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.viewEvent(this.getFilteredEvents()[index]);
                });
            }

            // Card click handler
            card.addEventListener('click', () => {
                this.viewEvent(this.getFilteredEvents()[index]);
            });
        });
    }

    getFilteredEvents() {
        return this.events.filter(event => event.troop === this.currentUser.troop);
    }

    getEventCardHTML(event) {
        const attendancePercentage = Math.round((event.attendees.length / event.maxAttendees) * 100);
        const isUpcoming = this.currentTab === 'upcoming';
        const isFull = event.attendees.length >= event.maxAttendees;
        const hasJoined = this.currentUser && event.attendees.includes(this.currentUser.id);

        return `
            <div class="event-card">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                    <div class="event-category category-${event.category.toLowerCase()}">
                        ${event.category}
                    </div>
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
                        <div class="event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            ${event.attendees.length}/${event.maxAttendees} members
                        </div>
                    </div>

                    <div class="attendance-bar">
                        <div class="attendance-info">
                            <span>Attendance</span>
                            <span>${attendancePercentage}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${attendancePercentage}%"></div>
                        </div>
                    </div>

                    ${this.getEventButtonHTML(event, isUpcoming, isFull, hasJoined)}
                </div>
            </div>
        `;
    }

    getEventButtonHTML(event, isUpcoming, isFull, hasJoined) {
        // Guests can only view
        if (this.currentUser.role === 'guest') {
            return `
                <button class="btn btn-outline btn-full event-view-btn">
                    <span>View Details</span>
                </button>
            `;
        }

        if (isUpcoming) {
            if (hasJoined) {
                return `
                    <button class="btn btn-outline btn-full" disabled>
                        Already Joined
                    </button>
                `;
            } else if (isFull) {
                return `
                    <button class="btn btn-outline btn-full" disabled>
                        Event Full
                    </button>
                `;
            } else if (this.canJoinEvents()) {
                return `
                    <button class="btn btn-primary btn-full event-join-btn">
                        <span>Join Event</span>
                    </button>
                `;
            }
        }
        
        return `
            <button class="btn btn-outline btn-full event-view-btn">
                <span>View Details</span>
            </button>
        `;
    }

    getEmptyStateHTML() {
        const title = 'No events found';
        const description = 'No events available for your troop yet.';

        return `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    joinEvent(event) {
        if (!this.canJoinEvents()) {
            this.showNotification('You do not have permission to join events', 'error');
            return;
        }

        if (event.attendees.includes(this.currentUser.id)) {
            this.showNotification('You have already joined this event!', 'error');
            return;
        }

        if (event.attendees.length >= event.maxAttendees) {
            this.showNotification('Event is full!', 'error');
            return;
        }

        // Add user to event attendees
        event.attendees.push(this.currentUser.id);
        
        // Update user's joined events
        if (!this.currentUser.joinedEvents) {
            this.currentUser.joinedEvents = [];
        }
        this.currentUser.joinedEvents.push(event.id);

        // Update localStorage
        localStorage.setItem('scoutpluse_user', JSON.stringify(this.currentUser));

        this.showNotification(`Successfully joined "${event.title}"!`, 'success');
        this.loadEvents(); // Refresh the events display
        
        // Update dashboard if it exists
        if (window.dashboardService) {
            window.dashboardService.refresh();
        }
    }

    viewEvent(event) {
        this.showEventDetailsModal(event);
    }

    showEventDetailsModal(event) {
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = event.title;
            modalBody.innerHTML = `
                <div class="event-details">
                    <img src="${event.image}" alt="${event.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin-bottom: 16px; color: var(--text-secondary);">${event.description}</p>
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
                            <span style="color: var(--text-secondary);">${event.category}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-primary);">Members Joined:</strong> 
                            <span style="color: var(--text-secondary);">${event.attendees.length}/${event.maxAttendees}</span>
                        </div>
                    </div>
                    ${this.getModalButtonHTML(event)}
                </div>
            `;
            modal.style.display = 'flex';
        }
    }

    getModalButtonHTML(event) {
        if (this.currentUser.role === 'guest') {
            return '';
        }

        const hasJoined = event.attendees.includes(this.currentUser.id);
        const isFull = event.attendees.length >= event.maxAttendees;
        
        if (event.status === 'upcoming' && !hasJoined && !isFull && this.canJoinEvents()) {
            return `<button class="btn btn-primary" onclick="window.eventsService.joinEventFromModal(${event.id})">Join Event</button>`;
        }
        
        return '';
    }

    joinEventFromModal(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.joinEvent(event);
            this.closeModal();
        }
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showCreateEventModal() {
        if (!this.canCreateEvents()) {
            this.showNotification('You do not have permission to create events', 'error');
            return;
        }

        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = 'Create New Event';
            modalBody.innerHTML = this.getCreateEventFormHTML();
            modal.style.display = 'flex';
            
            // Setup form event listeners
            this.setupCreateEventForm();
        }
    }

    getCreateEventFormHTML() {
        return `
            <form id="createEventForm" class="create-event-form">
                <div class="form-group">
                    <label for="eventTitle">Event Title *</label>
                    <input type="text" id="eventTitle" required placeholder="Enter event title">
                </div>
                
                <div class="form-group">
                    <label for="eventDescription">Description *</label>
                    <textarea id="eventDescription" required placeholder="Describe the event..." rows="3"></textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label for="eventDate">Date *</label>
                        <input type="date" id="eventDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="eventTime">Time *</label>
                        <input type="time" id="eventTime" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="eventLocation">Location *</label>
                    <input type="text" id="eventLocation" required placeholder="Event location">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label for="eventCategory">Category *</label>
                        <select id="eventCategory" required>
                            <option value="">Select category</option>
                            <option value="Outdoor">Outdoor</option>
                            <option value="Service">Service</option>
                            <option value="Education">Education</option>
                            <option value="Competition">Competition</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="eventMaxAttendees">Max Members *</label>
                        <input type="number" id="eventMaxAttendees" required min="1" placeholder="25">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="eventImage">Event Image URL</label>
                    <input type="url" id="eventImage" placeholder="https://example.com/image.jpg">
                    <small style="color: var(--text-muted); font-size: var(--font-size-xs);">
                        Optional: Add an image URL for the event
                    </small>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-outline" onclick="window.eventsService.closeModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
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

    handleCreateEvent(e) {
        e.preventDefault();
        
        const eventData = {
            id: Date.now(), // Simple ID generation
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value,
            category: document.getElementById('eventCategory').value,
            maxAttendees: parseInt(document.getElementById('eventMaxAttendees').value),
            image: document.getElementById('eventImage').value || this.getDefaultEventImage(),
            attendees: [],
            status: 'upcoming'
        };
        
        // Validate required fields
        if (!eventData.title || !eventData.description || !eventData.date || 
            !eventData.time || !eventData.location || !eventData.category || 
            !eventData.maxAttendees) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Add event to the events array
        this.events.unshift(eventData);
        
        // Set troop for the event
        eventData.troop = this.currentUser.troop;
        
        // Show success message
        this.showNotification(`Event "${eventData.title}" created successfully!`, 'success');
        
        // Close modal and refresh events
        this.closeModal();
        this.loadEvents();
        
        // Refresh dashboard if it exists
        if (window.dashboardService) {
            window.dashboardService.refresh();
        }
    }

    getDefaultEventImage() {
        const defaultImages = [
            'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/163403/box-sport-men-training-163403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ];
        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    refresh() {
        this.currentUser = AuthService.getCurrentUser();
        this.setupEventListeners();
        this.loadEvents();
    }

    getEvents() {
        return this.events;
    }
}

// Initialize events service when page loads
let eventsService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        eventsService = new EventsService();
        window.eventsService = eventsService;
        
        // Setup modal close functionality
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                eventsService.closeModal();
            });
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    eventsService.closeModal();
                }
            });
        }
    }
});

// Export for use in other files
window.EventsService = EventsService;