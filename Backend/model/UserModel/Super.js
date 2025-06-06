import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';

const superSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'super' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

superSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
      this.password = await bcryptjs.hash(this.password, 12);
  }
  next();
});

superSchema.methods.generateAuthToken = async function () {
  try {
      return jwt.sign({ _id: this._id }, keySecret, { expiresIn: '30d' });
  } catch (error) {
      console.error("Error generating token:", error);
      throw error;
  }
};

export default mongoose.model('SuperAdmin', superSchema);
