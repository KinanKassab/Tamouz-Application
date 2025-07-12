// Dashboard Service
class DashboardService {
    constructor() {
        this.currentUser = null;
        this.stats = {};
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.loadDashboard();
    }

    loadDashboard() {
        this.updateStats();
        this.loadRecentEvents();
    }

    updateStats() {
        // Calculate stats from demo data
        const upcomingEvents = DEMO_EVENTS.filter(event => event.status === 'upcoming').length;
        const activeMembers = Object.keys(DEMO_USERS).length;
        const informationItems = 12; // Placeholder count

        this.stats = {
            upcomingEvents,
            activeMembers,
            informationItems
        };

        // Update stat cards
        this.updateStatCards();
    }

    updateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach((card, index) => {
            const valueElement = card.querySelector('.stat-value');
            if (valueElement) {
                switch (index) {
                    case 0:
                        valueElement.textContent = this.stats.upcomingEvents;
                        break;
                    case 1:
                        valueElement.textContent = this.stats.activeMembers;
                        break;
                    case 2:
                        valueElement.textContent = this.stats.informationItems;
                        break;
                }
            }
        });
    }

    loadRecentEvents() {
        const recentEventsContainer = document.getElementById('recentEvents');
        if (!recentEventsContainer) return;

        const recentEvents = DEMO_EVENTS
            .filter(event => event.status === 'upcoming')
            .slice(0, 3);

        if (recentEvents.length === 0) {
            recentEventsContainer.innerHTML = this.getEmptyEventsHTML();
            return;
        }

        recentEventsContainer.innerHTML = recentEvents
            .map(event => this.getRecentEventHTML(event))
            .join('');

        // Add event listeners
        this.setupRecentEventListeners();
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
                <p>Check the Events page to see all activities</p>
            </div>
        `;
    }

    setupRecentEventListeners() {
        const recentEvents = document.querySelectorAll('.recent-event');
        recentEvents.forEach(eventElement => {
            eventElement.addEventListener('click', () => {
                const eventId = parseInt(eventElement.dataset.eventId);
                this.viewEventDetails(eventId);
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

    refresh() {
        this.loadDashboard();
    }

    getStats() {
        return this.stats;
    }
}

// Add CSS for dashboard-specific styles
const dashboardStyles = `
    }
}
<style>
.recent-events {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-4);
    margin-top: var(--spacing-4);
}

.recent-event {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid var(--border-color);
}

.recent-event:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.recent-event-image {
    position: relative;
    height: 160px;
    overflow: hidden;
}

.recent-event-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.recent-event-content {
    padding: var(--spacing-4);
}

.recent-event-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
    line-height: 1.4;
}

.recent-event-description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    margin-bottom: var(--spacing-3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.recent-event-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
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
    border-radius: 2px;
    overflow: hidden;
}

.dark .progress-bar {
    background: var(--gray-700);
}

.progress-fill {
    height: 100%;
    background: var(--primary-500);
    border-radius: 2px;
    transition: width 0.3s ease;
}

@media (max-width: 768px) {
    .recent-events {
        grid-template-columns: 1fr;
    }
    
    .recent-event-image {
        height: 140px;
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