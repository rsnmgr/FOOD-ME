import Admin from '../../model/UserModel/Admin.js';
import Super from '../../model/UserModel/Super.js';
import Staff from '../../model/admin/staff/Details.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

// Generate password reset token and save it to user
const generateResetToken = async (user) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
  
  // Save the reset token and expiry to the user
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();
  
  return resetToken;
};

// Send password reset email
const sendResetEmail = async (email, resetToken, role) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Frontend URL with reset token
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}/${role}`;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  // Send the email
  return transporter.sendMail(mailOptions);
};

// Forgot Password controller - generates token and sends email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address' });
  }

  try {
    // Check all user models for the email
    let user = await Admin.findOne({ email });
    let role = 'admin';


    if (!user) {
      user = await Super.findOne({ email });
      role = 'super';
    }

    if (!user) {
      user = await Staff.findOne({ email });
      role = 'staff';
    }

    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    // Generate reset token
    const resetToken = await generateResetToken(user);

    // Send reset email
    await sendResetEmail(email, resetToken, role);

    res.status(200).json({ 
      message: 'Password reset email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing your request', error: error.message });
  }
};

// Reset Password controller - validates token and updates password
export const resetPassword = async (req, res) => {
  const { token, password, role } = req.body;
  console.log("Reset password attempt:", { role, token: token.substring(0, 10) + '...' });

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  try {
    // Find user with valid reset token
    let userModel;
    switch (role) {
      case 'user':
        userModel = User;
        break;
      case 'admin':
        userModel = Admin;
        break;
      case 'super':
        console.log("Resetting super admin password");
        userModel = Super;
        break;
      case 'staff':
        userModel = Staff;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log("No user found with valid token for role:", role);
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    console.log(`Found user with ID: ${user._id}, Email: ${user.email}`);
    
    // Update the user's password
    const oldPassword = user.password;
    user.password = password; // This will be hashed by the pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    console.log("Password updated successfully for user:", user.email);
    
    // Double-check the user was saved with new password
    const updatedUser = await userModel.findById(user._id);
    console.log("Password changed from", oldPassword.substring(0, 10), "to", updatedUser.password.substring(0, 10));

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
}; 