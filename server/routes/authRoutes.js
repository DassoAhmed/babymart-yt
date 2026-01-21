import express from "express";
import { registerUser } from "../controllers/authController.js";
import { loginUser } from "../controllers/authController.js";

const router = express.Router();

// register route
router.post("/register", registerUser)  

// login route 

router.post("/login", loginUser); 

// router.post("/login", (req, res) => {
// res.send({ message: "Login working" });
// });

export default router;