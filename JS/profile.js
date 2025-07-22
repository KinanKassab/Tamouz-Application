// Profile Management
class ProfileService {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.loadProfile();
    }

    loadProfile() {
        const profileContent = document.getElementById('profileContent');
        if (!profileContent || !this.currentUser) return;

        profileContent.innerHTML = this.getProfileHTML();
        this.setupEventListeners();
    }

    getProfileHTML() {
        const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const joinDate = this.formatDate(this.currentUser.joinDate || '2022-01-15');

        return `
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${initials}
                    </div>
                    <div class="profile-info">
                        <h2>${this.currentUser.name}</h2>
                        <p>${this.capitalizeRole(this.currentUser.role)} • ${this.currentUser.troop}</p>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <div class="profile-stat">
                        <div class="profile-stat-value">${this.currentUser.joinedEvents?.length || 0}</div>
                        <div class="profile-stat-label">Events Joined</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">3</div>
                        <div class="profile-stat-label">Years Active</div>
                    </div>
                </div>
            </div>

            <div class="profile-card">
                <h3>Personal Information</h3>
                <form id="profileForm">
                    <div class="profile-field">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" value="${this.currentUser.name}" required>
                    </div>
                    
                    <div class="profile-field">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" value="${this.currentUser.email}" required>
                    </div>
                    
                    <div class="profile-field">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" value="${this.currentUser.phone || ''}" placeholder="Enter your phone number">
                    </div>
                    
                    <div class="profile-field">
                        <label for="troop">Troop</label>
                        <input type="text" id="troop" value="${this.currentUser.troop || 'Not assigned'}" readonly>
                    </div>
                    
                    <div class="profile-field">
                        <label for="role">Role</label>
                        <input type="text" id="role" value="${this.capitalizeRole(this.currentUser.role)}" readonly>
                    </div>
                    
                    <div class="profile-field">
                        <label for="joinDate">Join Date</label>
                        <input type="text" id="joinDate" value="${joinDate}" readonly>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline" id="cancelBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>

        `;
    }

    setupEventListeners() {
        // Profile form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.resetForm.bind(this));
        }

        // Toggle switches
        const toggles = document.querySelectorAll('.toggle-switch');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', this.handleToggle.bind(this));
        });
    }

    handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updatedData = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            bio: document.getElementById('bio').value
        };

        // Simulate saving to server
        this.showNotification('Profile updated successfully!', 'success');
        
        // Update current user data
        this.currentUser.name = updatedData.name;
        this.currentUser.email = updatedData.email;
        
        // Update localStorage
        localStorage.setItem('scoutpluse_user', JSON.stringify(this.currentUser));
        
        // Update UI elements that display user name
        this.updateUserDisplayName();
    }

    resetForm() {
        this.loadProfile();
        this.showNotification('Changes discarded', 'info');
    }

    handleToggle(e) {
        const toggle = e.currentTarget;
        toggle.classList.toggle('active');
        
        const settingName = toggle.id;
        const isActive = toggle.classList.contains('active');
        
        this.showNotification(`${this.getSettingDisplayName(settingName)} ${isActive ? 'enabled' : 'disabled'}`, 'info');
    }

    changePassword() {
        alert('Change Password feature coming soon!\n\nThis would open a secure form to update your password.');
    }

    updateUserDisplayName() {
        // Update user avatar and welcome message
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
        }

        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            const translationService = window.getTranslationService?.();
            const welcomeText = translationService?.t('dashboard.welcome') || 'Welcome back';
            welcomeMessage.textContent = `${welcomeText}, ${this.currentUser.name}!`;
        }
    }

    getDefaultBio() {
        const bios = {
            admin: 'Dedicated to leading our scout troop and fostering growth in young minds.',
            leader: 'Passionate about guiding scouts on their journey of discovery and adventure.',
            member: 'Excited to learn new skills and make lasting friendships through scouting.'
        };
        return bios[this.currentUser.role] || '';
    }

    getSettingDisplayName(settingId) {
        const names = {
            emailNotifications: 'Email Notifications',
            smsNotifications: 'SMS Notifications',
            profileVisibility: 'Profile Visibility'
        };
        return names[settingId] || settingId;
    }

    capitalizeRole(role) {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
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
        this.loadProfile();
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Add CSS for profile-specific styles
const profileStyles = `
<style>
.profile-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-4);
    margin-bottom: var(--spacing-6);
}

.profile-stat {
    text-align: center;
    padding: var(--spacing-4);
    background: var(--bg-secondary);
    border-radius: var(--radius-xl);
}

.profile-stat-value {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-1);
}

.profile-stat-label {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.profile-field textarea {
    width: 100%;
    padding: var(--spacing-3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
}

.profile-field textarea:focus {
    outline: none;
    border-color: var(--primary-500);
}

.profile-badges {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-3);
}

.profile-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-xl);
    text-align: center;
}

.profile-badge-icon {
    width: 3rem;
    height: 3rem;
    background: var(--amber-100);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--amber-600);
    margin-bottom: var(--spacing-2);
}

.dark .profile-badge-icon {
    background: var(--amber-900);
    color: var(--amber-300);
}

.profile-badge-name {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-primary);
}

.settings-list {
    display: flex;
    flex-direction: column;
    gap: 0;
}

@media (max-width: 768px) {
    .profile-stats {
        grid-template-columns: 1fr;
    }
    
    .profile-badges {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
`;

// Inject profile styles
document.head.insertAdjacentHTML('beforeend', profileStyles);

// Initialize profile service when page loads
let profileService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        profileService = new ProfileService();
        window.profileService = profileService;
    }
});

// Export for use in other files
window.ProfileService = ProfileService;