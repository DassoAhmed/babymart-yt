import Cart from "../models/cartModel.js";
import order from "../models/OrderModel.js";

export const createOrderFromCart = async (req, res) => {
    const { items, shippingAddress } = req.body;

    //validate that items are provided
    if(!items || !Array.isArray(items) || items.length === 0){
        res.status(400);
        throw new Error("Cart Items are required")
    }

    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const totalAmount = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        const orderData = {
            user: userId,
            items: cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            })),
            shippingAddress: req.body.shippingAddress || req.user.shippingAddress,
            totalAmount,
            paymentMethod: req.body.paymentMethod || 'COD'
        };

        const order = await Order.create(orderData);

        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } }
        );

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error("Get order by ID error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getAllOrdersAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.page) || 10;
        const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
        const status =req.query.status;
        const paymentStatus = req.query.paymentStatus;
        const limit = parseInt(req.query.limit) || 10;

        //build filter object
        const filter = {};
        if(status && status !== "all"){
            filter.status = status;
        }
        if (paymentStatus && paymentStatus !== "all"){
            //map payment status  to actual status
            if(paymentStatus === "paid"){
                filter.status = { $in: ["paid", "complete"]};
            }else if ( paymentStatus === "pending" ){
                filter.status = "pending";
            }else if (paymentStatus === "failed") {
                filter.status = "cancelled";
            }
        }

        const skip = (page - 1) * perPage;


        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.startDate && req.query.endDate) {
            filter.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const orders = await Order.find(filter)
            .populate('userId', 'name email')
            .populate("item.productId", "name price image")
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(perPage);

            //total value properties
        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / perPage);

        // Transform data to match frontent expect
        const transformedOrders = order.map((order) =>({
            _id: order._id,
            orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`, // Generate readable order ID
            user: {
                _id: order.userId._id,
                name: order.userId.name || 'Unknown',
                email: order.userId.email || 'No email',
                phone: order.userId.phone || 'No phone'
            },
            items: order.items.map(item => ({
                product:{
                    _Id: item.productId._id,
                    name: item.productId.name || item.name || 'Product not found',
                    price: item.productId || item.productId.price || 0,
                    image: item.productId.image || '/images/default-product.png',
                    
                },
                quantity: item.quantity,
                price: item.productId,
                total: (item.price || item.product?.price || 0) * item.quantity
            })),
            shippingAddress: order.shippingAddress || {},
            totalAmount: order.totalAmount,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: 
            order.status === 'paid' || order.status === 'complete' 
            ? "paid"
            : order.status === 'cancelled'
            ? "failed" 
            : "pending",
            shippingAddress: order.shippingAddress || {
                street: "N/A",
                city: "N/A",
                state: "N/A",
                zipcode: "N/A",
                country: "N/A",
            },
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            // Calculate item count and subtotals for frontend
            itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: order.items.reduce((sum, item) => 
                sum + ((item.price || item.product?.price || 0) * item.quantity), 0),
            tax: order.tax || 0,
            shippingFee: order.shippingFee || 0,
            discount: order.discount || 0
        }));
          

        const summary = {
            totalOrders: total,
            pending: await Order.countDocuments({ status: 'pending' }),
            processing: await Order.countDocuments({ status: 'processing' }),
            shipped: await Order.countDocuments({ status: 'shipped' }),
            delivered: await Order.countDocuments({ status: 'delivered' }),
            cancelled: await Order.countDocuments({ status: 'cancelled' })
        };

        res.status(200).json({
           orders: transformedOrders,
           total,
           totalPages,
           currentPage: page,
        });

    } catch (error) {
        console.error("Get all orders admin error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status is required"
            });
        }

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.status = status;
        
        order.statusHistory.push({
            status,
            updatedBy: req.user._id,
            updatedAt: new Date()
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order
        });

    } catch (error) {
        console.error("Update order status error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete order with status other than pending"
            });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });

    } catch (error) {
        console.error("Delete order error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export default {
    createOrderFromCart,
    getOrders,
    getOrderById,
    getAllOrdersAdmin,
    updateOrderStatus,
    deleteOrder
};