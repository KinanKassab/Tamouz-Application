// Demo Data
const DEMO_USERS = {
    'admin@scouts.org': {
        id: '1',
        name: 'Admin User',
        email: 'admin@scouts.org',
        password: 'password',
        role: 'admin',
        troop: 'Troop 101',
        bio: 'Dedicated to leading our scout troop and fostering growth in young minds.',
        joinedEvents: [],
        joinDate: '2020-01-10',
        phone: '+1 (555) 123-4567',
        troop: 'Troop 101'
    },
    'leader@scouts.org': {
        id: '2',
        name: 'Scout Leader',
        email: 'leader@scouts.org',
        password: 'password',
        role: 'leader',
        troop: 'Troop 101',
        bio: 'Passionate about guiding scouts on their journey of discovery and adventure.',
        joinedEvents: [],
        joinDate: '2021-03-15',
        phone: '+1 (555) 234-5678',
        troop: 'Troop 101'
    },
    'scout@scouts.org': {
        id: '3',
        name: 'Scout Member',
        email: 'scout@scouts.org',
        password: 'password',
        role: 'member',
        troop: 'Troop 101',
        bio: 'Excited to learn new skills and make lasting friendships through scouting.',
        joinedEvents: [],
        joinDate: '2022-09-20',
        phone: '+1 (555) 345-6789',
        troop: 'Troop 101'
    },
    'guest@scouts.org': {
        id: '4',
        name: 'Guest User',
        email: 'guest@scouts.org',
        password: 'password',
        role: 'guest',
        troop: 'Visitor',
        bio: 'Interested in learning about scouting activities.',
        joinedEvents: [],
        joinDate: '2023-06-01',
        phone: '+1 (555) 999-0000',
        troop: 'Visitor'
    }
};

const DEMO_EVENTS = [
    {
        id: 1,
        title: 'Weekend Camping Trip',
        description: 'Three-day camping adventure with hiking and campfire activities. Learn outdoor survival skills and enjoy nature.',
        date: '2025-01-20',
        time: '09:00',
        location: 'Mountain View Campsite',
        attendees: ['1', '2'], // User IDs who joined
        maxAttendees: 25,
        category: 'Outdoor',
        image: 'https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'upcoming',
        troop: 'Ramita'
    },
    {
        id: 2,
        title: 'Community Service Project',
        description: 'Help clean up the local park and plant new trees. Make a positive impact in our community.',
        date: '2025-01-25',
        time: '14:00',
        location: 'Central Park',
        attendees: ['2', '3'],
        maxAttendees: 20,
        category: 'Service',
        image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'upcoming',
        troop: 'Ramita'
    },
    {
        id: 3,
        title: 'First Aid Workshop',
        description: 'Learn essential first aid skills. Certified instructors will guide you through practical exercises.',
        date: '2025-01-28',
        time: '10:00',
        location: 'Scout Hall',
        attendees: ['1', '2', '3'],
        maxAttendees: 15,
        category: 'Education',
        image: 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'upcoming',
        troop: 'Ramita'
    },
    {
        id: 4,
        title: 'Annual Scout Games',
        description: 'Traditional games and competitions between troops. Show your skills and team spirit.',
        date: '2025-01-10',
        time: '09:00',
        location: 'Sports Complex',
        attendees: ['1', '2', '3'],
        maxAttendees: 50,
        category: 'Competition',
        image: 'https://images.pexels.com/photos/163403/box-sport-men-training-163403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'past',
        troop: 'Ramita'
    }
];

// Navigation permissions by role - removed information section
const ROLE_PERMISSIONS = {
    guest: ['events'],
    member: ['dashboard', 'events', 'profile'],
    leader: ['dashboard', 'events', 'information', 'profile', 'settings'],
    admin: ['dashboard', 'events', 'information', 'profile', 'settings']
};

// Event permissions by role
const EVENT_PERMISSIONS = {
    guest: ['view'],
    member: ['view', 'join'],
    leader: ['view', 'join', 'create', 'manage'],
    admin: ['view', 'join', 'create', 'manage']
};

// Export for use in other files
window.DEMO_USERS = DEMO_USERS;
window.DEMO_EVENTS = DEMO_EVENTS;
window.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
window.EVENT_PERMISSIONS = EVENT_PERMISSIONS;