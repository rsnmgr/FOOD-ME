import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';
import { io } from '../../server.js';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  restaurant: { type: String },
  password: { type: String },
  image: { type: String },
  role: { type: String, default: "admin" },
  status: { type: String, default: 'Active' },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

adminSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.trialStartDate = new Date();
    this.trialEndDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
  }

  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 12);
  }
  next();
});

// Optimized pre-hook for checking trial status
adminSchema.pre(['find', 'findOne'], async function() {
  // Skip if this is a direct status check query to avoid recursion
  if (this.getQuery().hasOwnProperty('status')) {
    return;
  }

  const now = new Date();
  
  // Use updateMany directly without loading documents into memory
  const result = await mongoose.model('Admin').updateMany(
    { 
      status: 'Active',
      trialEndDate: { $lt: now }
    },
    {
      $set: { status: 'Inactive' }
    }
  );

  // Only emit socket event if any documents were updated
  if (result.modifiedCount > 0) {
    // Get only the emails of affected admins
    const affectedAdmins = await mongoose.model('Admin')
      .find({ status: 'Inactive', trialEndDate: { $lt: now } })
      .select('email')
      .lean();

    io.emit('adminStatusUpdated', {
      message: 'Trial expired. Admin status updated to Inactive.',
      affectedAdmins: affectedAdmins.map(admin => admin.email)
    });
  }
});

adminSchema.methods.generateAuthToken = async function () {
  try {
    return jwt.sign({ _id: this._id }, keySecret, { expiresIn: '30d' });
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
