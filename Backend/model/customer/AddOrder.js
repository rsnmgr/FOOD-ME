import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    AdminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, required: true },
    CustomerId : {type:String,rewuire:true},
    OrderHistory: [{
        items: [{
            name: { type: String, required: true },
            category: { type: String },
            size: { type: String },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            instructions: { type: String },
            image: { type: String } // Change from Number to String
        }],
        total: { type: Number, required: true },
        orderDate: { type: Date, default: Date.now },
        itemsStatus: { type: String, default: "pending" },
        notification: {type: String,default:"false"}
    }],
    totalOrderAmount: { type: Number, required: true },
    orderStatus: { type: String, default: "Running" },
    orderDate: { type: Date, default: Date.now },

},
    { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
