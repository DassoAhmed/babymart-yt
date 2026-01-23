import express from 'express';
import { protect , admin } from '../middleware/authMiddleware.js';
import { createUser, getUsers, getUsersById, updateUser,} from '../controllers/userController.js';

const router = express.Router();

//route
router
  .route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);
 
// /:id route to get user by id (admin only)
router
.route("/:id")
.get(protect, admin, getUsersById)
.put(protect, admin, updateUser);
// .delete(protect, admin, deleteUserById);

// /:id/addresses route to add address to user (protected)

// /:id/addresses/:addressId route to delete address from user (protected)


export default router;