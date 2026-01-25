import express from 'express';
import { protect , admin } from '../middleware/authMiddleware.js';
import { addAddress, createUser, deleteAddress, deleteUser, getUsers, getUsersById, updateAddress, updateUser,} from '../controllers/userController.js';

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
.put(protect, admin, updateUser)
.delete(protect, admin, deleteUser);


router.route("/:id/addresses").post(protect, addAddress);
router;

router
.route("/:id/addresses/:addressId")
.put(protect, updateAddress)
.delete(protect, deleteAddress);


export default router;