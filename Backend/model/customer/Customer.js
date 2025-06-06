import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
const keySecret =
  "ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh";
  const customerSchema = new mongoose.Schema({
    name: { type: String },
    phone: { type: String },
    adminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: { type: String, default: "customer" },
});

customerSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign({ _id: this._id }, keySecret, { expiresIn: '12h' });
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
};

export default mongoose.model("Customer", customerSchema);
