export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  skills?: string[];
  badges?: string[];
  joinDate: string;
  lastSeen: string;
  isOnline: boolean;
}

export type UserRole = 'guest' | 'member' | 'leader' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: ActivityStatus;
  imageUrl?: string;
  requirements?: string[];
  organizer: string;
  createdAt: string;
}

export type ActivityType = 'camping' | 'workshop' | 'meeting' | 'training' | 'community' | 'outdoor';
export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  difficulty: number; // 1-5 stars
  progress: number; // 0-100%
  imageUrl?: string;
  steps?: string[];
  resources?: string[];
}

export type SkillCategory = 'knots' | 'survival' | 'navigation' | 'first-aid' | 'leadership' | 'outdoor';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppState {
  currentUser: User | null;
  currentPage: string;
  isLoading: boolean;
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
}

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface ModalOptions {
  title: string;
  content: string;
  type?: 'confirm' | 'alert' | 'custom';
  onConfirm?: () => void;
  onCancel?: () => void;
}