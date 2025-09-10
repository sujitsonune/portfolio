import { Timestamp } from 'firebase/firestore'

// Base Firebase types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Admin authentication types
export type AdminRole = 'super_admin' | 'content_admin' | 'editor'

export interface AdminPermissions {
  canEditContent: boolean;
  canManageUsers: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
  canDeleteContent: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  profilePicture?: string;
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
    timezone?: string;
  };
}

// Utility types for Firebase documents
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreData {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Personal Information
export interface PersonalInfo extends BaseDocument {
  name: string;
  title: string;
  bio: string;
  profileImage?: string;
  resume?: string;
  contact: ContactInfo;
  socialLinks: SocialLink[];
  isActive: boolean;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location: {
    city: string;
    country: string;
    timezone?: string;
  };
  availability: 'available' | 'busy' | 'unavailable';
}

export interface SocialLink {
  platform: string;
  url: string;
  username?: string;
  isVisible: boolean;
}

// Work Experience
export interface WorkExperience extends BaseDocument {
  company: string;
  role: string;
  department?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  location: {
    city?: string;
    country?: string;
    remote: boolean;
  };
  duration: {
    startDate: Timestamp;
    endDate?: Timestamp; // null for current position
    isCurrent: boolean;
  };
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  companyLogo?: string;
  companyWebsite?: string;
  order: number;
  isVisible: boolean;
}

// Project
export interface Project extends BaseDocument {
  title: string;
  description: string;
  longDescription?: string;
  category: 'web' | 'mobile' | 'desktop' | 'ai-ml' | 'other';
  status: 'completed' | 'in-progress' | 'planned' | 'archived';
  technologies: Technology[];
  features: string[];
  challenges?: string[];
  learnings?: string[];
  images: ProjectImage[];
  links: ProjectLink[];
  team?: TeamMember[];
  timeline: {
    startDate: Timestamp;
    endDate?: Timestamp;
    duration?: string;
  };
  metrics?: ProjectMetrics;
  isFeatured: boolean;
  order: number;
  isVisible: boolean;
}

export interface Technology {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'cloud' | 'mobile' | 'other';
  icon?: string;
  color?: string;
}

export interface ProjectImage {
  url: string;
  caption?: string;
  isMain: boolean;
  order: number;
}

export interface ProjectLink {
  type: 'live' | 'github' | 'demo' | 'documentation' | 'other';
  url: string;
  label: string;
}

export interface TeamMember {
  name: string;
  role: string;
  linkedIn?: string;
  github?: string;
}

export interface ProjectMetrics {
  visitors?: number;
  users?: number;
  performance?: string;
  impact?: string;
}

// Skill
export interface Skill extends BaseDocument {
  name: string;
  category: SkillCategory;
  proficiencyLevel: ProficiencyLevel;
  proficiencyScore: number; // 0-100 for radar charts and progress bars
  yearsOfExperience: number;
  icon?: string;
  color?: string;
  description?: string;
  endorsements: SkillEndorsement[];
  certifications: SkillCertification[];
  projects: string[]; // Project IDs where this skill was used
  progression: SkillProgression[];
  tags: string[];
  lastUsed?: Timestamp;
  order: number;
  isVisible: boolean;
}

export type SkillCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'mobile'
  | 'cloud'
  | 'devops'
  | 'design'
  | 'testing'
  | 'soft-skills'
  | 'tools'
  | 'other';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillEndorsement {
  endorserId: string;
  endorserName: string;
  endorserRole: string;
  endorserCompany?: string;
  endorserImage?: string;
  message?: string;
  date: Timestamp;
  relationship: 'colleague' | 'manager' | 'client' | 'peer' | 'other';
}

export interface SkillCertification {
  name: string;
  issuer: string;
  date: Timestamp;
  expiryDate?: Timestamp;
  credentialId?: string;
  credentialUrl?: string;
  badgeUrl?: string;
  score?: string;
  level?: string;
  isActive: boolean;
}

export interface SkillProgression {
  date: Timestamp;
  proficiencyScore: number;
  milestone?: string;
  project?: string;
  certificate?: string;
  experience?: string;
}

// Skills visualization types
export interface SkillRadarData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    pointBackgroundColor: string[];
  }[];
}

export interface SkillCloudItem {
  skill: Skill;
  size: number;
  x: number;
  y: number;
  color: string;
  fontSize: string;
}

export interface SkillFilter {
  categories: SkillCategory[];
  proficiencyLevels: ProficiencyLevel[];
  minExperience: number;
  maxExperience: number;
  hasEndorsements: boolean;
  hasCertifications: boolean;
  recentlyUsed: boolean;
  searchTerm: string;
}

export interface SkillGrouping {
  category: SkillCategory;
  skills: Skill[];
  averageProficiency: number;
  totalEndorsements: number;
  color: string;
}

// Achievement
export interface Achievement extends BaseDocument {
  title: string;
  description: string;
  category: AchievementCategory;
  date: Timestamp;
  organization: string;
  organizationLogo?: string;
  certificateUrl?: string;
  credentialId?: string;
  skills?: string[]; // Related skills
  impact?: string;
  media?: AchievementMedia[];
  isVisible: boolean;
  order: number;
}

export type AchievementCategory = 
  | 'certification'
  | 'award'
  | 'publication'
  | 'speaking'
  | 'contribution'
  | 'milestone'
  | 'other';

export interface AchievementMedia {
  type: 'image' | 'video' | 'document';
  url: string;
  caption?: string;
}

// Testimonial
export interface Testimonial extends BaseDocument {
  name: string;
  role: string;
  company: string;
  companyLogo?: string;
  message: string;
  rating?: number; // 1-5 stars
  image?: string;
  linkedIn?: string;
  relationship: 'colleague' | 'client' | 'manager' | 'subordinate' | 'other';
  project?: string; // Project ID this testimonial relates to
  isVisible: boolean;
  order: number;
}

// Navigation and UI types
export interface NavItem {
  href: string;
  label: string;
}

export interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Error types
export interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}

// Loading states
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string; // For spam prevention
}

// Analytics types
export interface PageView {
  page: string;
  timestamp: Timestamp;
  userAgent?: string;
  referrer?: string;
}

export interface ContactSubmission {
  id: string;
  form: ContactForm;
  timestamp: Timestamp;
  responded: boolean;
  responseDate?: Timestamp;
}

// Filter and sort types
export interface FilterOptions {
  category?: string[];
  technology?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  featured?: boolean;
  visible?: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Hook return types
export interface UseFirestoreReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseFirestoreCollectionReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
}