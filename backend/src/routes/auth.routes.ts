import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  AuthController.registerValidation,
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  AuthController.loginValidation,
  AuthController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getMe);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP code via email
 * @access  Public
 */
router.post(
  '/forgot-password',
  AuthController.forgotPasswordValidation,
  AuthController.forgotPassword
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code for password reset
 * @access  Public
 */
router.post(
  '/verify-otp',
  AuthController.verifyOTPValidation,
  AuthController.verifyOTP
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password after OTP verification
 * @access  Public
 */
router.post(
  '/reset-password',
  AuthController.resetPasswordValidation,
  AuthController.resetPassword
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, avatar)
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  AuthController.updateProfileValidation,
  AuthController.updateProfile
);

export default router;

