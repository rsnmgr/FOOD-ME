import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  AdminId: { type: String, required: true },
  products: [
    {
      name: { type: String, required: true },
      category: { type: String, required: true },
      units: [
        {
          size: { type: String },
          price: { type: Number },
        },
      ],
      status: { type: String, required: true },
      image: { type: String },
    },
  ],
});

const Products = mongoose.model("Products", productSchema);

export default Products;
