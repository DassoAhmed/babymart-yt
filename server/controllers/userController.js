import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// getUsers controller
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(200).json({
        success: true,
        users,
    });
});

//create user controller (if needed in future)
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        addresses: [],
    });

    if (user) {
        //Initial empty cart
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

//get user by id controller (if needed in future)
const getUsersById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//update user by id controller (if needed in future)
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    //allow updates by user themselves or admin only
    user.name = req.body.name || user.name;
    if (req.body.password) {
        user.password = req.body.password;
    }
    if (req.body.role) {
        user.role = req.body.role;
    }
    user.addresses = req.body.addresses || user.addresses;

    //avatar update can be handled here if needed
    const updatedUser = await user.save();
    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
    });
});

//delete user by id controller (if needed in future)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        // Delete user's cart 
        // Delete user's orders (if any exists)
        //Delete the user
        await user.deleteOne();
        res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// add addresses
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    //only allow user to modify their own addresses or admin
    if (
        user._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const { street, city, country, postalCode, isDefault } = req.body;

    if (!street || !city || !country || !postalCode) {
        res.status(400);
        throw new Error("All address fields are required");
    }

    //if this is the first address, set as default
    if (user.addresses.length === 0) {
        user.addresses.push({
            street,
            city,
            country,
            postalCode,
            isDefault: true,
        });
    } else {
        // if setting this as default, make other addresses non-default
        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }
        
        user.addresses.push({
            street,
            city,
            country,
            postalCode,
            isDefault: isDefault || false,
        });
    }

    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address added successfully",
    });
});

//update address
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    //Only allow user to modify their own addresses or admin
    if (
        user._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        res.status(404);
        throw new Error("Address not found");
    }
    
    const { street, city, country, postalCode, isDefault } = req.body;

    if (street) address.street = street;
    if (city) address.city = city;
    if (country) address.country = country;
    if (postalCode) address.postalCode = postalCode;

    // if this is set as default, make other addresses non-default
    if (isDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
        address.isDefault = true;
    }

    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address updated successfully",
    });
});

//delete address
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
     }

// Only allow user to modify their own addresses or admin
    if (
        user._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        res.status(404);
        throw new Error("Address not found");
    }

   // if deleting default address, make the first remaining address default
    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);
    
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }
    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address deleted successfully",
    });
});f

export { getUsers, createUser, getUsersById, updateUser, deleteUser, addAddress, updateAddress, deleteAddress };