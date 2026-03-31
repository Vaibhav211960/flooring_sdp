import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // One user = One cart
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      default: 10,
      min: 10
    },
    price: Number, // Price at time of adding
    total: Number
  }],
  cartTotal: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
