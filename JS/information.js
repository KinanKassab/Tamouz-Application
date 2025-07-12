// Information Management
class InformationService {
    constructor() {
        this.currentUser = null;
        this.currentCategory = 'knots';
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.loadInformation();
    }

    loadInformation() {
        const informationContent = document.getElementById('informationContent');
        if (!informationContent) return;

        informationContent.innerHTML = this.getInformationHTML();
        this.setupEventListeners();
        this.loadCategoryContent();
    }

    getInformationHTML() {
        return `
            <div class="information-categories">
                <button class="category-btn active" data-category="knots">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8 12h8"></path>
                        <path d="M12 8v8"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Knots & Lashings
                </button>
                <button class="category-btn" data-category="fire">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                    </svg>
                    Fire Building
                </button>
                <button class="category-btn" data-category="navigation">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                    </svg>
                    Navigation
                </button>
                <button class="category-btn" data-category="first-aid">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"></path>
                    </svg>
                    First Aid
                </button>
                <button class="category-btn" data-category="camping">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 20h18l-9-15z"></path>
                        <path d="M12 5v15"></path>
                    </svg>
                    Camping Skills
                </button>
                <button class="category-btn" data-category="nature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v20"></path>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Nature Study
                </button>
            </div>
            
            <div class="information-content-area">
                <div id="categoryContent" class="category-content">
                    <!-- Category content will be loaded here -->
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.switchCategory(category);
            });
        });
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update button states
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Load category content
        this.loadCategoryContent();
    }

    loadCategoryContent() {
        const categoryContent = document.getElementById('categoryContent');
        if (!categoryContent) return;

        const content = this.getCategoryData(this.currentCategory);
        categoryContent.innerHTML = this.getCategoryContentHTML(content);
        this.setupContentListeners();
    }

    getCategoryData(category) {
        const data = {
            knots: {
                title: 'Knots & Lashings',
                description: 'Essential knots and lashing techniques for scouting activities',
                items: [
                    {
                        name: 'Square Knot (Reef Knot)',
                        difficulty: 'Beginner',
                        uses: 'Joining two ropes of equal thickness',
                        steps: [
                            'Cross the right rope over the left rope',
                            'Bring the right rope under and through',
                            'Cross the left rope over the right rope',
                            'Bring the left rope under and through',
                            'Tighten both ends'
                        ],
                        image: 'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Bowline Knot',
                        difficulty: 'Intermediate',
                        uses: 'Creating a fixed loop that won\'t slip',
                        steps: [
                            'Create a small loop in the rope',
                            'Pass the working end up through the loop',
                            'Wrap around the standing line',
                            'Pass back down through the original loop',
                            'Tighten the knot'
                        ],
                        image: 'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Clove Hitch',
                        difficulty: 'Beginner',
                        uses: 'Securing rope to a post or pole',
                        steps: [
                            'Wrap the rope around the post',
                            'Cross over and wrap around again',
                            'Tuck the end under the last wrap',
                            'Tighten the knot'
                        ],
                        image: 'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Square Lashing',
                        difficulty: 'Advanced',
                        uses: 'Joining two poles at right angles',
                        steps: [
                            'Start with a clove hitch on the vertical pole',
                            'Wrap around both poles in a square pattern',
                            'Make 3-4 complete wraps',
                            'Add frapping turns between the poles',
                            'Finish with a clove hitch'
                        ],
                        image: 'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                ]
            },
            fire: {
                title: 'Fire Building',
                description: 'Safe and effective fire building techniques for outdoor activities',
                items: [
                    {
                        name: 'Teepee Fire',
                        difficulty: 'Beginner',
                        uses: 'Quick lighting and cooking',
                        steps: [
                            'Create a tinder nest in the center',
                            'Build a small teepee of kindling around tinder',
                            'Add larger sticks in teepee formation',
                            'Light the tinder from multiple sides',
                            'Add fuel as the fire grows'
                        ],
                        image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Log Cabin Fire',
                        difficulty: 'Intermediate',
                        uses: 'Long-burning fires and cooking',
                        steps: [
                            'Place two logs parallel to each other',
                            'Place two more logs perpendicular on top',
                            'Continue alternating layers',
                            'Fill center with tinder and kindling',
                            'Light from the top center'
                        ],
                        image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Star Fire',
                        difficulty: 'Beginner',
                        uses: 'Conserving fuel and easy maintenance',
                        steps: [
                            'Start with a small fire in the center',
                            'Place 5-8 logs like spokes of a wheel',
                            'Push logs toward center as they burn',
                            'Maintain by feeding logs inward',
                            'Easy to control heat output'
                        ],
                        image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                ]
            },
            navigation: {
                title: 'Navigation',
                description: 'Essential navigation skills for outdoor adventures',
                items: [
                    {
                        name: 'Using a Compass',
                        difficulty: 'Beginner',
                        uses: 'Finding direction and navigation',
                        steps: [
                            'Hold compass level and steady',
                            'Turn until red needle points to N',
                            'Read bearing at direction of travel arrow',
                            'Follow the bearing to your destination'
                        ],
                        image: 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Reading Topographic Maps',
                        difficulty: 'Intermediate',
                        uses: 'Understanding terrain and elevation',
                        steps: [
                            'Identify contour lines for elevation',
                            'Locate key landmarks and features',
                            'Understand map symbols and scale',
                            'Orient map with compass bearing'
                        ],
                        image: 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                ]
            },
            'first-aid': {
                title: 'First Aid',
                description: 'Basic first aid skills for emergency situations',
                items: [
                    {
                        name: 'Treating Cuts and Scrapes',
                        difficulty: 'Beginner',
                        uses: 'Minor wound care',
                        steps: [
                            'Clean your hands thoroughly',
                            'Stop any bleeding with direct pressure',
                            'Clean the wound with water',
                            'Apply antibiotic ointment if available',
                            'Cover with sterile bandage'
                        ],
                        image: 'https://images.pexels.com/photos/163403/box-sport-men-training-163403.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Treating Burns',
                        difficulty: 'Intermediate',
                        uses: 'Burn injury care',
                        steps: [
                            'Remove from heat source immediately',
                            'Cool with running water for 10-20 minutes',
                            'Remove jewelry before swelling occurs',
                            'Cover with sterile, non-adhesive bandage',
                            'Seek medical attention for severe burns'
                        ],
                        image: 'https://images.pexels.com/photos/163403/box-sport-men-training-163403.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                ]
            },
            camping: {
                title: 'Camping Skills',
                description: 'Essential skills for successful camping experiences',
                items: [
                    {
                        name: 'Setting Up a Tent',
                        difficulty: 'Beginner',
                        uses: 'Shelter setup',
                        steps: [
                            'Choose level, dry ground away from hazards',
                            'Lay out tent footprint or groundsheet',
                            'Assemble tent poles according to instructions',
                            'Attach tent body to poles',
                            'Stake out guy lines for stability'
                        ],
                        image: 'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Leave No Trace Principles',
                        difficulty: 'Beginner',
                        uses: 'Environmental responsibility',
                        steps: [
                            'Plan ahead and prepare',
                            'Travel and camp on durable surfaces',
                            'Dispose of waste properly',
                            'Leave what you find',
                            'Minimize campfire impacts',
                            'Respect wildlife',
                            'Be considerate of other visitors'
                        ],
                        image: 'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                ]
            },
            nature: {
                title: 'Nature Study',
                description: 'Understanding and appreciating the natural world',
                items: [
                    {
                        name: 'Tree Identification',
                        difficulty: 'Beginner',
                        uses: 'Understanding forest ecosystems',
                        steps: [
                            'Observe leaf shape and arrangement',
                            'Note bark texture and color',
                            'Check for flowers, fruits, or seeds',
                            'Measure tree height and trunk diameter',
                            'Use field guide for identification'
                        ],
                        image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400'
                    },
                    {
                        name: 'Animal Tracking',
                        difficulty: 'Intermediate',
                        uses: 'Wildlife observation and study',
                        steps: [
                            'Look for clear tracks in mud or sand',
                            'Measure track size and spacing',
                            'Note number of toes and claw marks',
                            'Follow track patterns and gait',
                            'Look for other signs like scat or feeding marks'
                        ],
                        image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                ]
            }
        };

        return data[category] || data.knots;
    }

    getCategoryContentHTML(content) {
        return `
            <div class="category-header">
                <h2>${content.title}</h2>
                <p>${content.description}</p>
            </div>
            
            <div class="information-grid">
                ${content.items.map(item => this.getInformationItemHTML(item)).join('')}
            </div>
        `;
    }

    getInformationItemHTML(item) {
        const difficultyClass = item.difficulty.toLowerCase();
        
        return `
            <div class="information-item" data-item="${item.name}">
                <div class="information-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    <div class="difficulty-badge difficulty-${difficultyClass}">
                        ${item.difficulty}
                    </div>
                </div>
                <div class="information-item-content">
                    <h3 class="information-item-title">${item.name}</h3>
                    <p class="information-item-uses">${item.uses}</p>
                    <div class="information-item-steps">
                        <h4>Steps:</h4>
                        <ol>
                            ${item.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    <button class="btn btn-outline btn-sm view-details-btn">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    setupContentListeners() {
        const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemElement = btn.closest('.information-item');
                const itemName = itemElement.dataset.item;
                this.showItemDetails(itemName);
            });
        });

        const informationItems = document.querySelectorAll('.information-item');
        informationItems.forEach(item => {
            item.addEventListener('click', () => {
                const itemName = item.dataset.item;
                this.showItemDetails(itemName);
            });
        });
    }

    showItemDetails(itemName) {
        const content = this.getCategoryData(this.currentCategory);
        const item = content.items.find(i => i.name === itemName);
        
        if (!item) return;

        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = item.name;
            modalBody.innerHTML = `
                <div class="information-details">
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;">
                    
                    <div class="detail-section">
                        <h4>Difficulty Level</h4>
                        <span class="difficulty-badge difficulty-${item.difficulty.toLowerCase()}">${item.difficulty}</span>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Primary Uses</h4>
                        <p>${item.uses}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Step-by-Step Instructions</h4>
                        <ol class="detailed-steps">
                            ${item.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Tips for Success</h4>
                        <ul class="tips-list">
                            <li>Practice regularly to build muscle memory</li>
                            <li>Start with quality materials and proper tools</li>
                            <li>Take your time - accuracy is more important than speed</li>
                            <li>Ask experienced scouts or leaders for guidance</li>
                        </ul>
                    </div>
                </div>
            `;
            modal.style.display = 'flex';
        }
    }

    refresh() {
        this.loadInformation();
    }

    getCurrentCategory() {
        return this.currentCategory;
    }
}

// Add CSS for information-specific styles
const informationStyles = `
<style>
.information-categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-3);
    margin-bottom: var(--spacing-8);
}

.category-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-4);
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    text-align: left;
}

.category-btn:hover {
    border-color: var(--primary-300);
    background: var(--primary-50);
    color: var(--text-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.dark .category-btn:hover {
    background: var(--primary-900);
    border-color: var(--primary-700);
}

.category-btn.active {
    border-color: var(--primary-600);
    background: linear-gradient(135deg, var(--primary-100), var(--secondary-100));
    color: var(--primary-700);
    box-shadow: var(--shadow-sm);
}

.dark .category-btn.active {
    background: linear-gradient(135deg, var(--primary-900), var(--secondary-900));
    color: var(--primary-300);
}

.category-btn svg {
    flex-shrink: 0;
    transition: transform var(--transition-fast);
}

.category-btn:hover svg,
.category-btn.active svg {
    transform: scale(1.1);
}

.information-content-area {
    background: var(--bg-primary);
    border-radius: var(--radius-3xl);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
}

.category-header {
    margin-bottom: var(--spacing-6);
    text-align: center;
}

.category-header h2 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.category-header p {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    line-height: var(--line-height-relaxed);
}

.information-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-6);
}

.information-item {
    background: var(--bg-secondary);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    box-shadow: var(--shadow-xs);
    transition: all var(--transition-fast);
    cursor: pointer;
    border: 1px solid var(--border-light);
}

.information-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-200);
}

.information-item-image {
    position: relative;
    height: 180px;
    overflow: hidden;
}

.information-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
}

.information-item:hover .information-item-image img {
    transform: scale(1.05);
}

.difficulty-badge {
    position: absolute;
    top: var(--spacing-3);
    right: var(--spacing-3);
    padding: var(--spacing-1) var(--spacing-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: var(--shadow-sm);
}

.difficulty-beginner {
    background: var(--green-100);
    color: var(--green-800);
}

.difficulty-intermediate {
    background: var(--amber-100);
    color: var(--amber-800);
}

.difficulty-advanced {
    background: var(--red-100);
    color: var(--red-800);
}

.dark .difficulty-beginner {
    background: var(--green-900);
    color: var(--green-300);
}

.dark .difficulty-intermediate {
    background: var(--amber-900);
    color: var(--amber-300);
}

.dark .difficulty-advanced {
    background: var(--red-900);
    color: var(--red-300);
}

.information-item-content {
    padding: var(--spacing-5);
}

.information-item-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
    line-height: var(--line-height-tight);
}

.information-item-uses {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-4);
    line-height: var(--line-height-relaxed);
}

.information-item-steps {
    margin-bottom: var(--spacing-4);
}

.information-item-steps h4 {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.information-item-steps ol {
    padding-left: var(--spacing-4);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
}

.information-item-steps li {
    margin-bottom: var(--spacing-1);
}

.information-details {
    max-width: 100%;
}

.detail-section {
    margin-bottom: var(--spacing-5);
}

.detail-section h4 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.detail-section p {
    color: var(--text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--spacing-3);
}

.detailed-steps {
    padding-left: var(--spacing-4);
    color: var(--text-secondary);
    line-height: var(--line-height-relaxed);
}

.detailed-steps li {
    margin-bottom: var(--spacing-2);
    padding-left: var(--spacing-1);
}

.tips-list {
    padding-left: var(--spacing-4);
    color: var(--text-secondary);
    line-height: var(--line-height-relaxed);
}

.tips-list li {
    margin-bottom: var(--spacing-2);
    padding-left: var(--spacing-1);
}

@media (max-width: 768px) {
    .information-categories {
        grid-template-columns: 1fr;
    }
    
    .information-grid {
        grid-template-columns: 1fr;
    }
    
    .information-content-area {
        padding: var(--spacing-4);
    }
    
    .category-btn {
        padding: var(--spacing-3);
        font-size: var(--font-size-sm);
    }
    
    .information-item-image {
        height: 150px;
    }
    
    .information-item-content {
        padding: var(--spacing-4);
    }
}

@media (max-width: 480px) {
    .information-categories {
        gap: var(--spacing-2);
    }
    
    .category-btn {
        padding: var(--spacing-2);
        font-size: var(--font-size-xs);
        gap: var(--spacing-1);
    }
    
    .information-item-image {
        height: 120px;
    }
    
    .information-item-content {
        padding: var(--spacing-3);
    }
}
</style>
`;

// Inject information styles
document.head.insertAdjacentHTML('beforeend', informationStyles);

// Initialize information service when page loads
let informationService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        informationService = new InformationService();
        window.informationService = informationService;
    }
});

// Export for use in other files
window.InformationService = InformationService;