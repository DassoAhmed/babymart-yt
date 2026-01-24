import mongoose from "mongoose";
import Category from "./categoryModel";

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,   
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        stock:{
            type: Number,
            default: 0,
            min: 0,
        },
        rating: [
            {
                userId:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
        averageRAting: {
            type: Number,
            default: 0,
        },
        images: 
            {
                type: String,
                required: true,
            },
        Category: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Category",
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Brand",
        },
    },
    {
        timestamps: true,
    }
);

// calculate average rating before saving
productSchema.pre("save", function (next) {
    if (this.rating && this.rating.length > 0) {
        const total = this.rating.reduce((acc, curr) => acc + curr.rating, 0);
        this.averageRating = total / this.rating.length;
    } 
    next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
