/**
 * Auth types for JavaScript (JSDoc)
 * Based on AuthResource from backend
 */

/**
 * @typedef {Object} Role
 * @property {number} id
 * @property {string} name
 * @property {string} [description]
 */

/**
 * @typedef {Object} Permission
 * @property {number} id
 * @property {string} name
 * @property {string} [description]
 */

/**
 * @typedef {Object} AuthUser
 * @property {number} id
 * @property {string} name
 * @property {string} last_name
 * @property {string|null} [avatar]
 * @property {string|null} [avatar_url]
 * @property {string} email
 * @property {string} phone
 * @property {'MALE'|'FEMALE'} gender
 * @property {string} dob
 * @property {string|null} email_verified_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Role[]} [roles]
 * @property {Permission[]} [permissions]
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} data
 * @property {string} data.token
 * @property {AuthUser} data.user
 */

/**
 * @typedef {Object} UserResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {Object} data
 * @property {AuthUser} data.user
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} name
 * @property {string} last_name
 * @property {string} email
 * @property {string} phone
 * @property {string} dob
 * @property {'MALE'|'FEMALE'} gender
 * @property {string} password
 * @property {string} password_confirmation
 */

/**
 * @typedef {Object} ForgotPasswordPayload
 * @property {string} email
 */

/**
 * @typedef {Object} ResetPasswordPayload
 * @property {string} token
 * @property {string} email
 * @property {string} password
 * @property {string} password_confirmation
 */

/**
 * @typedef {Object} VerifyEmailPayload
 * @property {string} token
 * @property {string} email
 */

// Export dummy object agar file terbaca sebagai ES Module di JavaScript
export {};
