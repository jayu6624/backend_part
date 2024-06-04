import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"; // Adjust the path as necessary
import {verifyjwt} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser)


router.route("/logout").post(verifyjwt,logoutUser)
export default router;
