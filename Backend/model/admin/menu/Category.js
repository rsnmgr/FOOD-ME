import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    AdminId: { type: String, required: true },
    category: [{
        name: { type: String, required: true },
        status: { type: String, required: true }
    }]
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
