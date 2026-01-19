// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// App Info
export const APP_NAME = 'Resort Luxury';
export const APP_DESCRIPTION = 'Resort Management System';
export const APP_VERSION = '1.0.0';

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  SALES_AGENT: 'Sales Agent',
  FINANCE: 'Finance',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked-in',
  CHECKED_OUT: 'Checked-out',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

// Quotation Status
export const QUOTATION_STATUS = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};

// Invoice Status
export const INVOICE_STATUS = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PENDING: 'Pending',
  PARTIAL: 'Partial',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'Cash',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
  ONLINE: 'Online',
};

// Default Reminder Templates
export const DEFAULT_REMINDER_TEMPLATES = {
  before: `Dear {name},

Name: {name}
Receipt Number: {receipt_number}
Due Amount: {due_amount}
Please make payment at your earliest convenience to avoid any late fees.

Thank you for your business!

Best regards,
Crown Voyages Team`,

  on: `Dear {name},

Name: {name}
Receipt Number: {receipt_number}
Due Amount: {due_amount}
Please make payment at your earliest convenience to avoid any late fees.

Thank you for your business!

Best regards,
Crown Voyages Team`,

  after: `Dear {name},

Name: {name}
Receipt Number: {receipt_number}
Due Amount: {due_amount}
Please make payment at your earliest convenience to avoid any late fees.

Thank you for your business!

Best regards,
Crown Voyages Team`,
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

// Lead Sources
export const LEAD_SOURCES = {
  WEBSITE: 'Website',
  PHONE: 'Phone',
  EMAIL: 'Email',
  REFERRAL: 'Referral',
  SOCIAL_MEDIA: 'Social Media',
  WALK_IN: 'Walk-in',
  AGENT: 'Agent',
};

// Report Types
export const REPORT_TYPES = {
  BOOKING: 'booking',
  REVENUE: 'revenue',
  PAYMENT: 'payment',
  CUSTOMER: 'customer',
};

// Time Periods
export const TIME_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  DATETIME: 'MM/DD/YYYY HH:mm',
  TIME: 'HH:mm',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5, // MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
};

// Star Ratings
export const STAR_RATINGS = [1, 2, 3, 4, 5];

// Amenities
export const COMMON_AMENITIES = [
  'WiFi',
  'Pool',
  'Spa',
  'Restaurant',
  'Bar',
  'Gym',
  'Room Service',
  'Parking',
  'Beach Access',
  'Conference Room',
  'Air Conditioning',
  'TV',
  'Mini Bar',
  'Safe',
  'Balcony',
];

// Meal Plans
export const MEAL_PLANS = [
  { value: 'RO', label: 'Room Only' },
  { value: 'BB', label: 'Bed & Breakfast' },
  { value: 'HB', label: 'Half Board' },
  { value: 'FB', label: 'Full Board' },
  { value: 'AI', label: 'All Inclusive' },
];

// Room Types
export const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Suite',
  'Family Room',
  'Presidential Suite',
  'Villa',
  'Bungalow',
  'Studio',
];

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#FFD700',
  SECONDARY: '#D4AF37',
  SUCCESS: '#10B981',
  DANGER: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  DARK: '#1A1A1A',
  LIGHT: '#F3F4F6',
};

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  BOOKING: '/booking',
  RESORTS: '/resorts',
  ROOMS: '/rooms',
  BILLING: '/billing',
  USERS: '/users',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  
  // Dashboard
  DASHBOARD_METRICS: '/dashboard/metrics',
  DASHBOARD_BOOKINGS: '/dashboard/upcoming-bookings',
  DASHBOARD_PAYMENTS: '/dashboard/outstanding-payments',
  
  // Analytics
  ANALYTICS_BOOKINGS: '/analytics/booking-reports',
  ANALYTICS_REVENUE: '/analytics/revenue-reports',
  ANALYTICS_EXPORT: '/analytics/export',
  
  // Bookings
  BOOKINGS: '/bookings',
  LEADS: '/bookings/leads',
  QUOTATIONS: '/bookings/quotations',
  
  // Resorts
  RESORTS: '/resorts',
  
  // Rooms
  ROOMS: '/rooms',
  
  // Billing
  INVOICES: '/billing/invoices',
  PAYMENTS: '/billing/payments',
  REMINDERS: '/billing/reminders',
  
  // Users
  USERS: '/users',
  
  // Upload
  UPLOAD: '/upload',
};