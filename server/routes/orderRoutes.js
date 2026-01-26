import express from "express";
import {
    getOrders,
    getOrderById,
    createOrderFromCart,
    updateOrderStatus,
    deleteOrder,
    getAllOrdersAdmin
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (if any) - none in this case

// Protected routes (user must be logged in)
router.route("/").post(protect, createOrderFromCart); // Create order from cart
router.route("/my-orders").get(protect, getOrders); // Get user's own orders

// Admin only routes
router.route("/admin/all").get(protect, admin, getAllOrdersAdmin); // Get all orders (admin)

// Order by ID routes
router.route("/:id")
    .get(protect, getOrderById) // Get specific order
    .put(protect, admin, updateOrderStatus) // Update order status (admin)
    .delete(protect, admin, deleteOrder); // Delete order (admin)

export default router;