import mongoose from 'mongoose';

const selectedItems = new mongoose.Schema({
    AdminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, required: true },
    CustomerId: {type: mongoose.Schema.Types.ObjectId},
    selectedItems: [{
      name: { type: String, required: true },
      category: { type: String },
      size: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      instructions: { type: String },
      image: { type: String } // Change from Number to String
    }]
  });
  

const SelectedItems = mongoose.model('SelectedItems', selectedItems);
export default SelectedItems;