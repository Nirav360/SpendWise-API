import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refresh,
} from "../controllers/userController.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh").get(refresh);
router.route("/logout").post(logoutUser);

export default router;
