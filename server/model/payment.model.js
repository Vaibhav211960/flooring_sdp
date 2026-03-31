import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        paymentMode: {
            type: String,
            enum: ["CARD", "COD", "UPI", "Net Banking"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["confirmed", "processing", "cancelled", "refunded"],
            required: true,
        },
        refundStatus: {
            type: String,
            enum: ["not_required", "pending", "initiated", "completed"],
            default: "pending",
        },
        refundInitiatedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
