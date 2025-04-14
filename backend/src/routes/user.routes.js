import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; // ✅ make sure this path is correct

const router = Router();

// ✅ Add multer middleware to handle file + form data
router
  .route("/register")
  .post(upload.fields([{ name: "profilePicture", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);

export default router;
