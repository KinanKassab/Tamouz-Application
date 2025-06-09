import { User, Activity, Skill, Post, Notification } from '../types';

export class MockDataService {
  createMockUser(email: string, fullName?: string): User {
    return {
      id: 'user-' + Date.now(),
      email,
      fullName: fullName || 'مستخدم تجريبي',
      role: 'member',
      status: 'active',
      avatarUrl: '/images/default-avatar.png',
      phone: '+961 70 123 456',
      dateOfBirth: '1995-01-01',
      bio: 'عضو نشط في كشافة تموز',
      skills: ['العقد', 'التخييم', 'الإسعافات الأولية'],
      badges: ['خبير التخييم', 'ملاح ماهر', 'مسعف أولي'],
      joinDate: '2022-01-01T00:00:00Z',
      lastSeen: new Date().toISOString(),
      isOnline: true,
    };
  }

  getMockActivities(): Activity[] {
    return [
      {
        id: 'activity-1',
        title: 'رحلة تخييم جبال الشوف',
        description: 'رحلة تخييم لمدة يومين مع أنشطة متنوعة في الطبيعة وتعلم مهارات البقاء',
        type: 'camping',
        date: '2025-02-15',
        time: '06:00',
        location: 'جبال الشوف، لبنان',
        maxParticipants: 25,
        currentParticipants: 18,
        status: 'upcoming',
        imageUrl: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg',
        requirements: ['حقيبة نوم', 'ملابس دافئة', 'أحذية مناسبة'],
        organizer: 'أحمد محمد',
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'activity-2',
        title: 'ورشة الإسعافات الأولية',
        description: 'تعلم أساسيات الإسعافات الأولية والتعامل مع الطوارئ',
        type: 'workshop',
        date: '2025-02-18',
        time: '14:00',
        location: 'مقر الفوج',
        maxParticipants: 15,
        currentParticipants: 12,
        status: 'upcoming',
        imageUrl: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
        requirements: ['دفتر ملاحظات', 'قلم'],
        organizer: 'فاطمة علي',
        createdAt: '2025-01-05T00:00:00Z',
      },
      {
        id: 'activity-3',
        title: 'اجتماع شهري للقادة',
        description: 'مناقشة خطط الشهر القادم والتحضيرات للأنشطة',
        type: 'meeting',
        date: '2025-02-22',
        time: '19:00',
        location: 'مقر الفوج',
        maxParticipants: 8,
        currentParticipants: 6,
        status: 'upcoming',
        organizer: 'محمد حسن',
        createdAt: '2025-01-10T00:00:00Z',
      },
    ];
  }

  getMockSkills(): Skill[] {
    return [
      {
        id: 'skill-1',
        title: 'العقدة المربعة',
        description: 'العقدة الأساسية لربط حبلين من نفس السماكة بطريقة آمنة ومحكمة',
        category: 'knots',
        difficulty: 1,
        progress: 80,
        imageUrl: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg',
        steps: [
          'ضع الحبل الأيمن فوق الأيسر',
          'اربط عقدة بسيطة',
          'ضع الحبل الأيسر فوق الأيمن',
          'اربط عقدة أخرى',
          'اشدد العقدة بقوة'
        ],
        resources: ['دليل العقد الكشفية', 'فيديو تعليمي'],
      },
      {
        id: 'skill-2',
        title: 'إشعال النار',
        description: 'طرق مختلفة لإشعال النار في الطبيعة باستخدام مواد طبيعية',
        category: 'survival',
        difficulty: 2,
        progress: 60,
        imageUrl: 'https://images.pexels.com/photos/1749900/pexels-photo-1749900.jpeg',
        steps: [
          'جمع المواد الجافة',
          'بناء عش النار',
          'إشعال الشرارة',
          'تغذية النار تدريجياً',
          'الحفاظ على النار'
        ],
        resources: ['دليل البقاء', 'ورشة عملية'],
      },
      {
        id: 'skill-3',
        title: 'استخدام البوصلة',
        description: 'قراءة البوصلة والتوجه بدقة في الطبيعة',
        category: 'navigation',
        difficulty: 2,
        progress: 90,
        imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
        steps: [
          'فهم أجزاء البوصلة',
          'تحديد الاتجاه المغناطيسي',
          'قراءة الدرجات',
          'التوجه نحو الهدف',
          'تصحيح المسار'
        ],
        resources: ['دليل الملاحة', 'تطبيق عملي'],
      },
    ];
  }

  getMockPosts(): Post[] {
    return [
      {
        id: 'post-1',
        authorId: 'user-1',
        authorName: 'أحمد محمد',
        authorAvatar: '/images/default-avatar.png',
        content: 'تذكير برحلة التخييم القادمة يوم الجمعة. يرجى إحضار جميع المعدات المطلوبة والتجمع في المقر الساعة 6:00 صباحاً.',
        imageUrl: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg',
        likes: 12,
        comments: 5,
        isLiked: false,
        createdAt: '2025-01-27T10:00:00Z',
      },
      {
        id: 'post-2',
        authorId: 'user-2',
        authorName: 'فاطمة علي',
        authorAvatar: '/images/default-avatar.png',
        content: 'تهانينا لجميع الأعضاء الذين حصلوا على شارات جديدة هذا الأسبوع! 🏆 استمروا في العمل الرائع.',
        likes: 24,
        comments: 8,
        isLiked: true,
        createdAt: '2025-01-26T15:30:00Z',
      },
      {
        id: 'post-3',
        authorId: 'user-3',
        authorName: 'محمد حسن',
        authorAvatar: '/images/default-avatar.png',
        content: 'ورشة الإسعافات الأولية كانت مفيدة جداً! شكراً للمدربة فاطمة على الشرح الواضح والتطبيق العملي.',
        likes: 18,
        comments: 3,
        isLiked: false,
        createdAt: '2025-01-25T20:15:00Z',
      },
    ];
  }

  getMockNotifications(): Notification[] {
    return [
      {
        id: 'notif-1',
        title: 'نشاط جديد',
        message: 'تم إضافة رحلة تخييم جديدة لشهر فبراير',
        type: 'info',
        isRead: false,
        createdAt: '2025-01-27T09:00:00Z',
        actionUrl: '#activities',
      },
      {
        id: 'notif-2',
        title: 'تذكير',
        message: 'ورشة الإسعافات الأولية غداً الساعة 2:00 مساءً',
        type: 'warning',
        isRead: false,
        createdAt: '2025-01-26T18:00:00Z',
        actionUrl: '#activities',
      },
      {
        id: 'notif-3',
        title: 'تهانينا!',
        message: 'حصلت على شارة "خبير التخييم" الجديدة',
        type: 'success',
        isRead: true,
        createdAt: '2025-01-25T14:30:00Z',
        actionUrl: '#profile',
      },
    ];
  }
}