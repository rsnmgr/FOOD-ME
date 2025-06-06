import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sales: [{
        items: [{
            name: { type: String, required: true },
            size: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }],
        tableId: { type: mongoose.Schema.Types.ObjectId, required: true },
        CustomerId:{ type: mongoose.Schema.Types.ObjectId },
        SubtotalAmmount: { type: Number, required: true },
        Discount: { type: Number, required: true },
        DiscountAmmount: { type: Number, required: true },
        vatPercentage: { type: Number, required: true, default: 0 },
        vatAmount: { type: Number, required: true, default: 0 },
        totalAmmount: { type: Number, required: true },
        paymentType: { type: String, required: true },
        status: { type: String, required: true, default: "unpaid" },
        date: { type: Date, required: true, default: Date.now },
    }]
});


const salesModel = mongoose.model("salesReports", salesSchema);
export default salesModel;
