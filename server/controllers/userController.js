import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// getUsers controller
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(200).json({
    sucess: true,
    users,
    });
});

//create user controller (if needed in future)
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body ;
    // Check if user exists
    const userExists = await User.findOne({ email
    });;
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

   if (user){
    //Initial empty cart
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
    });
   }else {
    res.status(400);
    throw new Error ("Invalid user data");
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
     if(req.body.password){
        user.password = req.body.password;
     }
     if(req.body.role) {
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

export { getUsers, createUser, getUsersById, updateUser };