/**
 * Shared Type Definitions for UniVault
 */

export type Role = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';
export type ExamType = 'Midterm' | 'Final' | 'Internal';
export type PaperStatus = 'pending' | 'approved' | 'rejected';
export type NotificationType = 'approval' | 'alert' | 'system' | 'points' | 'badge';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  points: number;
  badges: Badge[];
  verified: boolean;
  joinedAt: string;
  status: UserStatus;
  avatar?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Paper {
  id: string;
  title: string;
  department: string;
  semester: number;
  subjectName: string;
  subjectCode: string;
  university: string;
  year: number;
  examType: ExamType;
  tags: string[];
  fileUrl: string;
  fileName: string;
  fileSize: string;
  uploaderId: string;
  uploaderName: string;
  status: PaperStatus;
  views: number;
  downloads: number;
  commentsCount: number;
  bookmarksCount: number;
  ocrText?: string;
  picture?: string;
  questions?: string[];
  predictionTips?: string[];
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  paperId: string;
  paperTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface Comment {
  id: string;
  paperId: string;
  userId: string;
  userName: string;
  comment: string;
  rating: number; // 1-5
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  department: string;
  semester: string;
  year: string;
  examType: string;
  sortBy: 'latest' | 'views' | 'downloads' | 'rating';
}

export interface DashboardStats {
  totalPapers: number;
  approvedPapers: number;
  pendingPapers: number;
  totalViews: number;
  totalDownloads: number;
  userContributionPoints: number;
  contributorRank: number;
}
