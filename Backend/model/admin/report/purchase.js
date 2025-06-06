import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    AdminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    purchases: [{
        supplierName: { type: String, required: true },
        dateOfPurchase: { type: Date, required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        paymentStatus: { type: String, required: true },
        image: { type: String } // Path for the purchase image
    }]
});

const Purchases = mongoose.model('Purchases', purchaseSchema);

export default Purchases;