import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { UserRole } from '@prisma/client';
import { EmailService } from './email.service';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  location?: string;
  role?: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
  private static readonly JWT_EXPIRES_IN = '7d';

  static async register(data: RegisterData) {
    const { name, email, password, location, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location,
        role: role || UserRole.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        role: true,
        createdAt: true,
      },
    });

    // If user is an organizer, create organizer record
    if (user.role === UserRole.ORGANIZER) {
      await prisma.organizer.create({
        data: {
          userId: user.id,
          contactInfo: email,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    return { user, token };
  }

  static async login(data: LoginData) {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        avatar: true,
        location: true,
        role: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          location: true,
          role: true,
          createdAt: true,
          preferences: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Update user profile (name, avatar)
   * @param userId - User ID
   * @param data - Profile data to update
   */
  static async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const { name, avatar } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Build update data
    const updateData: { name?: string; avatar?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        location: true,
        role: true,
        createdAt: true,
        preferences: true,
      },
    });

    return updatedUser;
  }

  /**
   * Request password reset - generates OTP code and sends email
   * @param email - User's email address
   */
  static async forgotPassword(email: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // For security reasons, don't reveal if the email exists or not
    if (!user) {
      // Still return success to prevent email enumeration attacks
      return {
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
      };
    }

    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Invalidate any existing unused OTP codes for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        isUsed: true,
      },
    });

    // Create new OTP code record
    await prisma.passwordResetToken.create({
      data: {
        otpCode,
        userId: user.id,
        expiresAt,
      },
    });

    // Send password reset email with OTP
    try {
      await EmailService.sendPasswordResetEmail(user.email, otpCode, user.name);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't throw error here - OTP is already created
    }

    return {
      success: true,
      message: 'If an account exists with this email, a password reset code has been sent.',
    };
  }

  /**
   * Verify OTP code for password reset
   * @param email - User's email address
   * @param otpCode - OTP code from email
   */
  static async verifyOTP(email: string, otpCode: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or OTP code');
    }

    // Find valid OTP code
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        otpCode,
        userId: user.id,
        isUsed: false,
        expiresAt: {
          gt: new Date(), // OTP not expired
        },
      },
    });

    if (!resetToken) {
      throw new Error('Invalid or expired OTP code');
    }

    // Mark OTP as used (one-time use)
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { isUsed: true },
    });

    return {
      success: true,
      message: 'OTP code verified successfully',
      userId: user.id,
    };
  }

  /**
   * Reset password after OTP verification
   * @param userId - User ID from OTP verification
   * @param newPassword - New password to set
   */
  static async resetPassword(userId: string, newPassword: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send confirmation email
    try {
      await EmailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't throw error - password is already changed
    }

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }
}

