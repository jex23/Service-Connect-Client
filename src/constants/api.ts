export const API_CONFIG = {
  BASE_URL: 'http://localhost:9078',
  ENDPOINTS: {
    USER_LOGIN: '/api/auth/user/login',
    USER_REGISTER: '/api/auth/user/register',
    PROVIDER_LOGIN: '/api/auth/provider/login',
    PROVIDER_REGISTER: '/api/auth/provider/register',
    USER_SERVICE_REGISTER: '/api/auth/user/register-service',
    SERVICE_CATEGORIES: '/api/auth/service-categories',
    PROVIDER_REGISTER_CATEGORIES: '/api/auth/provider/register-categories',
    PROVIDER_REGISTER_SERVICE: '/api/auth/provider/register-service',
    PROVIDER_SERVICE_UPLOAD_PHOTOS: '/api/auth/provider/service/upload-photos',
    PROVIDER_SERVICE_SCHEDULE: '/api/auth/providers/schedule',
    PROVIDER_REGISTERED_CATEGORIES: '/api/providers/me/categories/registered',
    SERVICE_BOOKING: '/api/users/service-booking',
    PAYMENT_STATUS: '/api/users/payment-status',
    BOOKING_CALENDAR: '/api/users/booking-calendar',
    BOOKING_SCHEDULE_CHECK: '/api/users/booking-schedule-check',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    USER_FEEDBACK: '/api/users/feedback',
    PROVIDER_FEEDBACK: '/api/providers'
  }
} as const;