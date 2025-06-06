import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';
const detailSchema = new mongoose.Schema({
    AdminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    salary: { type: String, required: true },
    status: { type: String, required: true },
    image: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: 'staff' },
    date: { type: Date, default: Date.now },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

detailSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 12);
    }
    next();
});

detailSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign({ _id: this._id }, keySecret, { expiresIn: '30d' });
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
};

export default mongoose.model('StaffDetails', detailSchema);
