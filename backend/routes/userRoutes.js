import express from "express";
import {
  addUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// CREATE
router.post("/add", addUser);

// READ
router.get("/all", getAllUsers);
router.get("/:id", getSingleUser);

// UPDATE
router.put("/update/:id", updateUser);

// DELETE
router.delete("/delete/:id", deleteUser);

export default router;