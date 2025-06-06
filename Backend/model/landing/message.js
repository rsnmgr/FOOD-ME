import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone:{type:String,required:true},
    email: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true }); // Adds createdAt & updatedAt fields

const Message = mongoose.model('Message', messageSchema);

export default Message;
