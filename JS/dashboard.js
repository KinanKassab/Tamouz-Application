// Dashboard Service
class DashboardService {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.loadDashboard();
    }

    loadDashboard() {
        this.loadRecentEvents();
        this.loadQuickActions();
        this.loadTroopOverview();
        this.loadUpcomingDeadlines();
    }

    loadRecentEvents() {
        const recentEventsContainer = document.getElementById('recentEvents');
        if (!recentEventsContainer) return;

        // Filter events by user's troop
        const troopEvents = DEMO_EVENTS.filter(event => 
            event.troop === this.currentUser.troop && event.status === 'upcoming'
        ).slice(0, 3);

        if (troopEvents.length === 0) {
            recentEventsContainer.innerHTML = this.getEmptyEventsHTML();
            return;
        }

        recentEventsContainer.innerHTML = troopEvents
            .map(event => this.getRecentEventHTML(event))
            .join('');

        // Add event listeners
        this.setupRecentEventListeners();
    }

    loadQuickActions() {
        const quickActionsContainer = document.getElementById('quickActions');
        if (!quickActionsContainer) return;

        const actions = this.getQuickActionsForRole();
        quickActionsContainer.innerHTML = actions
            .map(action => this.getQuickActionHTML(action))
            .join('');

        this.setupQuickActionListeners();
    }

    loadTroopOverview() {
        const troopOverviewContainer = document.getElementById('troopOverview');
        if (!troopOverviewContainer) return;

        const troopData = this.getTroopData();
        troopOverviewContainer.innerHTML = this.getTroopOverviewHTML(troopData);
    }

    loadUpcomingDeadlines() {
        const deadlinesContainer = document.getElementById('upcomingDeadlines');
        if (!deadlinesContainer) return;

        const deadlines = this.getUpcomingDeadlines();
        deadlinesContainer.innerHTML = deadlines
            .map(deadline => this.getDeadlineHTML(deadline))
            .join('');
    }

    getRecentEventHTML(event) {
        const attendancePercentage = Math.round((event.attendees.length / event.maxAttendees) * 100);
        const hasJoined = event.attendees.includes(this.currentUser.id);

        return `
            <div class="recent-event" data-event-id="${event.id}">
                <div class="recent-event-image">
                    <img src="${event.image}" alt="${event.title}" loading="lazy">
                    <div class="event-category category-${event.category.toLowerCase()}">
                        ${event.category}
                    </div>
                    ${hasJoined ? '<div class="joined-badge">Joined</div>' : ''}
                </div>
                <div class="recent-event-content">
                    <h3 class="recent-event-title">${event.title}</h3>
                    <p class="recent-event-description">${event.description}</p>
                    
                    <div class="recent-event-details">
                        <div class="recent-event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${this.formatDate(event.date)}
                        </div>
                        <div class="recent-event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            ${event.time}
                        </div>
                        <div class="recent-event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${event.location}
                        </div>
                    </div>

                    <div class="attendance-progress">
                        <div class="attendance-info">
                            <span>Attendance</span>
                            <span>${attendancePercentage}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${attendancePercentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getQuickActionsForRole() {
        const baseActions = [
            {
                id: 'view-events',
                title: 'View All Events',
                description: 'Browse upcoming activities',
                icon: 'calendar',
                action: () => window.scoutPluseApp.navigateToPage('events')
            },
            {
                id: 'view-profile',
                title: 'My Profile',
                description: 'Update your information',
                icon: 'user',
                action: () => window.scoutPluseApp.navigateToPage('profile')
            }
        ];

        if (['leader', 'admin'].includes(this.currentUser.role)) {
            baseActions.unshift({
                id: 'create-event',
                title: 'Create Event',
                description: 'Plan a new activity',
                icon: 'plus',
                action: () => {
                    window.scoutPluseApp.navigateToPage('events');
                    setTimeout(() => {
                        if (window.eventsService) {
                            window.eventsService.showCreateEventModal();
                        }
                    }, 100);
                }
            });
        }

        if (this.currentUser.role === 'admin') {
            baseActions.push({
                id: 'settings',
                title: 'Settings',
                description: 'Manage preferences',
                icon: 'settings',
                action: () => window.scoutPluseApp.navigateToPage('settings')
            });
        }

        return baseActions;
    }

    getQuickActionHTML(action) {
        const icons = {
            calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
            plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
            user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
            settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'
        };

        return `
            <div class="quick-action" data-action="${action.id}">
                <div class="quick-action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${icons[action.icon]}
                    </svg>
                </div>
                <div class="quick-action-content">
                    <h4 class="quick-action-title">${action.title}</h4>
                    <p class="quick-action-description">${action.description}</p>
                </div>
                <div class="quick-action-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </div>
            </div>
        `;
    }

    getTroopData() {
        // Filter users by current user's troop
        const troopMembers = Object.values(DEMO_USERS).filter(user => user.troop === this.currentUser.troop);
        const troopEvents = DEMO_EVENTS.filter(event => event.troop === this.currentUser.troop);
        
        return {
            name: this.currentUser.troop,
            totalMembers: troopMembers.length,
            activeMembers: troopMembers.filter(user => user.role !== 'guest').length,
            upcomingEvents: troopEvents.filter(event => event.status === 'upcoming').length,
            completedEvents: troopEvents.filter(event => event.status === 'past').length
        };
    }

    getTroopOverviewHTML(troopData) {
        return `
            <div class="troop-overview-header">
                <h3>Troop ${troopData.name}</h3>
                <p>Your troop at a glance</p>
            </div>
            <div class="troop-stats">
                <div class="troop-stat">
                    <div class="troop-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div class="troop-stat-content">
                        <div class="troop-stat-value">${troopData.totalMembers}</div>
                        <div class="troop-stat-label">Total Members</div>
                    </div>
                </div>
                <div class="troop-stat">
                    <div class="troop-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div class="troop-stat-content">
                        <div class="troop-stat-value">${troopData.upcomingEvents}</div>
                        <div class="troop-stat-label">Upcoming Events</div>
                    </div>
                </div>
            </div>
        `;
    }

    getUpcomingDeadlines() {
        // Mock deadlines data
        return [
            {
                title: 'Event Registration Deadline',
                date: '2025-01-18',
                type: 'registration',
                urgent: true
            },
            {
                title: 'Monthly Report Due',
                date: '2025-01-31',
                type: 'report',
                urgent: false
            },
            {
                title: 'Badge Assessment',
                date: '2025-02-05',
                type: 'assessment',
                urgent: false
            }
        ];
    }

    getDeadlineHTML(deadline) {
        const daysUntil = this.getDaysUntilDate(deadline.date);
        const urgentClass = deadline.urgent ? 'deadline-urgent' : '';
        
        return `
            <div class="deadline-item ${urgentClass}">
                <div class="deadline-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                </div>
                <div class="deadline-content">
                    <h4 class="deadline-title">${deadline.title}</h4>
                    <p class="deadline-date">${daysUntil} days remaining</p>
                </div>
            </div>
        `;
    }

    getEmptyEventsHTML() {
        return `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3>No upcoming events</h3>
                <p>Check back later for new activities in your troop</p>
            </div>
        `;
    }

    setupRecentEventListeners() {
        const recentEvents = document.querySelectorAll('.clickable-event');
        recentEvents.forEach(eventElement => {
            eventElement.addEventListener('click', () => {
                // Navigate to events page
                window.scoutPluseApp.navigateToPage('events');
            });
        });
        
        // View all events buttons
        const viewAllBtns = document.querySelectorAll('.view-all-events-btn');
        viewAllBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.scoutPluseApp.navigateToPage('events');
            });
        });
        
        // Clickable stat handlers
        const clickableStats = document.querySelectorAll('.clickable-stat');
        clickableStats.forEach(stat => {
            stat.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = stat.dataset.action;
                if (action === 'show-members') {
                    this.showTroopMembers();
                }
            });
        });
    }
    
    async showTroopMembers() {
        console.log('🔍 Loading troop members...');
        
        try {
            // Load users data
            const users = await AuthService.loadUsers();
            
            // Filter members by current user's troop
            const troopMembers = Object.values(users).filter(user => 
                user.troop === this.currentUser.troop && user.id !== this.currentUser.id
            );
            
            console.log(`👥 Found ${troopMembers.length} troop members`);
            
            // Show modal
            const modal = document.getElementById('troopMembersModal');
            const title = document.getElementById('troopMembersTitle');
            const membersList = document.getElementById('troopMembersList');
            
            if (modal && title && membersList) {
                title.textContent = `Troop ${this.currentUser.troop} Members`;
                membersList.innerHTML = this.getTroopMembersHTML(troopMembers);
                modal.style.display = 'flex';
            }
            
        } catch (error) {
            console.error('❌ Error loading troop members:', error);
            this.showNotification('Failed to load troop members', 'error');
        }
    }
    
    getTroopMembersHTML(members) {
        if (members.length === 0) {
            return `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <h3>No other members</h3>
                    <p>You are the only member in this troop</p>
                </div>
            `;
        }
        
        return members.map(member => {
            const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
            return `
                <div class="troop-member-item">
                    <div class="troop-member-avatar">${initials}</div>
                    <div class="troop-member-info">
                        <div class="troop-member-name">${member.name}</div>
                        <div class="troop-member-role">${member.role}</div>
                    </div>
                </div>
            `;
        }).join('');
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

    setupQuickActionListeners() {
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(actionElement => {
            actionElement.addEventListener('click', () => {
                const actionId = actionElement.dataset.action;
                const action = this.getQuickActionsForRole().find(a => a.id === actionId);
                if (action && action.action) {
                    action.action();
                }
            });
        });
    }

    viewEventDetails(eventId) {
        const event = DEMO_EVENTS.find(e => e.id === eventId);
        if (event && window.eventsService) {
            window.eventsService.showEventDetailsModal(event);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    getDaysUntilDate(dateString) {
        const today = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    refresh() {
        this.loadDashboard();
    }
}

// Add CSS for dashboard-specific styles
const dashboardStyles = `
<style>
.dashboard-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-8);
    margin-bottom: var(--spacing-8);
}

.dashboard-section {
    background: var(--bg-primary);
    padding: var(--spacing-6);
    border-radius: var(--radius-3xl);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    transition: all var(--transition-fast);
}

.dashboard-section:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.dashboard-section h2 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-4);
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
}

.dashboard-section h2::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
    border-radius: var(--radius-full);
}

.recent-events {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
}

.recent-event {
    background: var(--bg-secondary);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    box-shadow: var(--shadow-xs);
    transition: all var(--transition-fast);
    cursor: pointer;
    border: 1px solid var(--border-light);
    position: relative;
}

.recent-event:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-200);
}

.recent-event-image {
    position: relative;
    height: 120px;
    overflow: hidden;
}

.recent-event-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
}

.recent-event:hover .recent-event-image img {
    transform: scale(1.05);
}

.joined-badge {
    position: absolute;
    top: var(--spacing-2);
    left: var(--spacing-2);
    background: var(--green-600);
    color: white;
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--shadow-sm);
}

.recent-event-content {
    padding: var(--spacing-4);
}

.recent-event-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
    line-height: var(--line-height-tight);
}

.recent-event-description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--spacing-3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.recent-event-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
    margin-bottom: var(--spacing-3);
}

.recent-event-detail {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-size: var(--font-size-xs);
    color: var(--text-muted);
}

.recent-event-detail svg {
    flex-shrink: 0;
    color: var(--primary-600);
}

.attendance-progress {
    margin-top: var(--spacing-3);
}

.attendance-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    margin-bottom: var(--spacing-1);
}

.progress-bar {
    height: 4px;
    background: var(--gray-200);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.dark .progress-bar {
    background: var(--gray-700);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-500), var(--secondary-500));
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
}

.quick-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
}

.quick-action {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-4);
    background: var(--bg-secondary);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-light);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.quick-action:hover {
    background: var(--primary-50);
    border-color: var(--primary-200);
    transform: translateX(4px);
}

.dark .quick-action:hover {
    background: var(--primary-900);
    border-color: var(--primary-700);
}

.quick-action-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary-100), var(--secondary-100));
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-600);
    flex-shrink: 0;
}

.dark .quick-action-icon {
    background: linear-gradient(135deg, var(--primary-900), var(--secondary-900));
    color: var(--primary-300);
}

.quick-action-content {
    flex: 1;
}

.quick-action-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-1);
}

.quick-action-description {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    line-height: var(--line-height-normal);
}

.quick-action-arrow {
    color: var(--text-muted);
    transition: transform var(--transition-fast);
}

.quick-action:hover .quick-action-arrow {
    transform: translateX(4px);
    color: var(--primary-600);
}

.troop-overview-header {
    margin-bottom: var(--spacing-4);
}

.troop-overview-header h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-1);
}

.troop-overview-header p {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
}

.troop-stats {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
}

.troop-stat {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-light);
}

.troop-stat-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--accent-100), var(--accent-200));
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-600);
    flex-shrink: 0;
}

.dark .troop-stat-icon {
    background: linear-gradient(135deg, var(--accent-900), var(--accent-800));
    color: var(--accent-300);
}

.troop-stat-content {
    flex: 1;
}

.troop-stat-value {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    line-height: var(--line-height-none);
}

.troop-stat-label {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: var(--font-weight-medium);
}

.upcoming-deadlines {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
}

.deadline-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-light);
    transition: all var(--transition-fast);
}

.deadline-item:hover {
    background: var(--gray-50);
    border-color: var(--gray-300);
}

.dark .deadline-item:hover {
    background: var(--gray-700);
    border-color: var(--gray-600);
}

.deadline-item.deadline-urgent {
    border-color: var(--red-300);
    background: var(--red-50);
}

.dark .deadline-item.deadline-urgent {
    border-color: var(--red-700);
    background: rgba(220, 38, 38, 0.1);
}

.deadline-icon {
    width: 32px;
    height: 32px;
    background: var(--gray-100);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-600);
    flex-shrink: 0;
}

.deadline-urgent .deadline-icon {
    background: var(--red-100);
    color: var(--red-600);
}

.dark .deadline-icon {
    background: var(--gray-700);
    color: var(--gray-300);
}

.dark .deadline-urgent .deadline-icon {
    background: rgba(220, 38, 38, 0.2);
    color: var(--red-400);
}

.deadline-content {
    flex: 1;
}

.deadline-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-0-5);
}

.deadline-date {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    margin: 0;
}

.deadline-urgent .deadline-title {
    color: var(--red-700);
}

.deadline-urgent .deadline-date {
    color: var(--red-600);
}

.dark .deadline-urgent .deadline-title {
    color: var(--red-400);
}

.dark .deadline-urgent .deadline-date {
    color: var(--red-500);
}

@media (max-width: 1200px) {
    .dashboard-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-6);
    }
}

@media (max-width: 768px) {
    .dashboard-content {
        gap: var(--spacing-4);
    }
    
    .dashboard-section {
        padding: var(--spacing-4);
    }
    
    .recent-event-image {
        height: 100px;
    }
    
    .quick-action {
        padding: var(--spacing-3);
    }
    
    .quick-action-icon {
        width: 36px;
        height: 36px;
    }
}
</style>
`;

// Inject dashboard styles
document.head.insertAdjacentHTML('beforeend', dashboardStyles);

// Initialize dashboard service when page loads
let dashboardService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        dashboardService = new DashboardService();
        window.dashboardService = dashboardService;
    }
});

// Export for use in other files
window.DashboardService = DashboardService;