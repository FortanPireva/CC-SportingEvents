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
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  AuthController.forgotPasswordValidation,
  AuthController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  AuthController.resetPasswordValidation,
  AuthController.resetPassword
);

/**
 * @route   POST /api/auth/verify-reset-token
 * @desc    Verify if reset token is valid
 * @access  Public
 */
router.post(
  '/verify-reset-token',
  AuthController.verifyResetTokenValidation,
  AuthController.verifyResetToken
);

export default router;

