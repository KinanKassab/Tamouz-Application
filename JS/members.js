// Members Management
class MembersService {
    constructor() {
        this.currentUser = null;
        this.members = [];
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.loadMembers();
    }

    async loadMembers() {
        try {
            // Load from users.json
            const response = await fetch('/JS/users.json');
            const data = await response.json();
            this.members = data.users;
        } catch (error) {
            console.warn('Failed to load users.json, using demo data');
            this.members = Object.values(DEMO_USERS);
        }
        
        this.displayMembers();
    }

    displayMembers() {
        const membersGrid = document.getElementById('membersGrid');
        if (!membersGrid) return;

        if (this.members.length === 0) {
            membersGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        membersGrid.innerHTML = this.members
            .map(member => this.getMemberCardHTML(member))
            .join('');

        this.setupMemberCardListeners();
    }

    getMemberCardHTML(member) {
        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const joinedEvents = member.joinedEvents?.length || 0;
        const canEdit = this.currentUser && ['admin', 'leader'].includes(this.currentUser.role);

        return `
            <div class="member-card" data-member-id="${member.id}">
                <div class="member-avatar">
                    ${initials}
                </div>
                <div class="member-name">${member.name}</div>
                <div class="member-role">${this.capitalizeRole(member.role)} • ${member.troop}</div>
                
                <div class="member-stats">
                    <div class="member-stat">
                        <div class="member-stat-value">${joinedEvents}</div>
                        <div class="member-stat-label">Events</div>
                    </div>
                    <div class="member-stat">
                        <div class="member-stat-value">${member.role === 'guest' ? '0' : '12'}</div>
                        <div class="member-stat-label">Activities</div>
                    </div>
                    <div class="member-stat">
                        <div class="member-stat-value">${this.getYearsActive()}</div>
                        <div class="member-stat-label">Years</div>
                    </div>
                </div>

                <div class="member-bio">
                    <p>${member.bio || 'No bio available'}</p>
                </div>

                ${canEdit ? `
                    <div class="member-actions">
                        <button class="btn btn-outline btn-sm edit-member-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    setupMemberCardListeners() {
        const editButtons = document.querySelectorAll('.edit-member-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const memberCard = button.closest('.member-card');
                const memberId = memberCard.dataset.memberId;
                this.showEditMemberModal(memberId);
            });
        });

        const memberCards = document.querySelectorAll('.member-card');
        memberCards.forEach(card => {
            card.addEventListener('click', () => {
                const memberId = card.dataset.memberId;
                this.showMemberDetailsModal(memberId);
            });
        });
    }

    showMemberDetailsModal(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = member.name;
            modalBody.innerHTML = `
                <div class="member-details">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div class="member-avatar" style="width: 80px; height: 80px; font-size: 24px; margin: 0 auto 16px;">
                            ${member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <h3>${member.name}</h3>
                        <p style="color: var(--text-secondary);">${this.capitalizeRole(member.role)} • ${member.troop}</p>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="margin-bottom: 8px;">Bio</h4>
                        <p style="color: var(--text-secondary); line-height: 1.6;">${member.bio || 'No bio available'}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
                        <div style="text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${member.joinedEvents?.length || 0}</div>
                            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Events Joined</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${member.role === 'guest' ? '0' : '12'}</div>
                            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Activities</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${this.getYearsActive()}</div>
                            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Years Active</div>
                        </div>
                    </div>
                </div>
            `;
            modal.style.display = 'flex';
        }
    }

    showEditMemberModal(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = `Edit ${member.name}`;
            modalBody.innerHTML = `
                <form id="editMemberForm">
                    <div class="form-group">
                        <label for="memberName">Name</label>
                        <input type="text" id="memberName" value="${member.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="memberEmail">Email</label>
                        <input type="email" id="memberEmail" value="${member.email}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="memberRole">Role</label>
                        <select id="memberRole" required>
                            <option value="guest" ${member.role === 'guest' ? 'selected' : ''}>Guest</option>
                            <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                            <option value="leader" ${member.role === 'leader' ? 'selected' : ''}>Leader</option>
                            <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="memberTroop">Troop</label>
                        <input type="text" id="memberTroop" value="${member.troop}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="memberBio">Bio</label>
                        <textarea id="memberBio" rows="4" placeholder="Member bio...">${member.bio || ''}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                        <button type="button" class="btn btn-outline" onclick="window.membersService.closeModal()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            `;
            
            modal.style.display = 'flex';
            this.setupEditMemberForm(member);
        }
    }

    setupEditMemberForm(member) {
        const form = document.getElementById('editMemberForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditMember(member);
            });
        }
    }

    async handleEditMember(member) {
        const updatedData = {
            name: document.getElementById('memberName').value,
            email: document.getElementById('memberEmail').value,
            role: document.getElementById('memberRole').value,
            troop: document.getElementById('memberTroop').value,
            bio: document.getElementById('memberBio').value
        };

        // Update member data
        Object.assign(member, updatedData);

        // Update the members array
        const memberIndex = this.members.findIndex(m => m.id === member.id);
        if (memberIndex !== -1) {
            this.members[memberIndex] = member;
        }

        // Simulate saving to users.json (in a real app, this would be an API call)
        try {
            await this.saveToUsersJson();
            this.showNotification('Member updated successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to save changes', 'error');
        }

        this.closeModal();
        this.displayMembers();
    }

    async saveToUsersJson() {
        // In a real application, this would make an API call to update the users.json file
        // For demo purposes, we'll just update localStorage and show a success message
        const usersData = {
            users: this.members
        };
        
        // Update DEMO_USERS for consistency
        this.members.forEach(member => {
            DEMO_USERS[member.email] = member;
        });
        
        console.log('Updated users data:', usersData);
        return Promise.resolve();
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3>No members found</h3>
                <p>No members to display at this time</p>
            </div>
        `;
    }

    capitalizeRole(role) {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }

    getYearsActive() {
        // Simple calculation - in a real app this would be based on join date
        return Math.floor(Math.random() * 5) + 1;
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
        this.loadMembers();
    }

    getMembers() {
        return this.members;
    }
}

// Initialize members service when page loads
let membersService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        membersService = new MembersService();
        window.membersService = membersService;
    }
});

// Export for use in other files
window.MembersService = MembersService;