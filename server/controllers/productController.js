import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
// import cloudinary from "../utils/cloudinary.js";

//create product controller

const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        category,
        brand,
        images,
        discountPercentage,
        stock,
    } = req.body;
    // check if product with same name exists
    const productExists = await Product.findOne({ name });
    if (productExists) {
        res.status(400);
        throw new Error("Product with this name already exists");
    }
    //upload images to cloudinary
    const product = await Product.create({
        name,
        description,
        price,
        category,
        brand,
        discountPercentage:discountPercentage || 0,
        stock:stock || 0,
        image:"",
    });
    if (product) {
        res.status(201).json(product);
    } else {
        res.status(400);
        throw new Error("Invalid product data");
    }
});

export { createProduct };