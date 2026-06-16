import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateTempPassword } from "../utils/generatePassword.js";
import { generateUserId } from "../utils/generateUserId.js";
import { sendUserCredentialsEmail } from "../utils/sendEmail.js";

// ================= CREATE USER =================
export const addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      address,
      apiKey,
      secretKey,
      accountType,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Generate unique user id
    let userId;
    let isExists = true;

    while (isExists) {
      userId = generateUserId(); // Example: JGQ802

      const existingId = await User.findOne({
        where: { user_id: userId },
      });

      isExists = !!existingId;
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      user_id: userId,
      name,
      email,
      password: hashedPassword,
      mobile: mobile || null,
      address: address || null,
      api_key: apiKey || null,
      secret_key: secretKey || null,
      account_type: accountType || null,
      status: true,
      role: "user",
    });

    await sendUserCredentialsEmail(
      email,
      name,
      tempPassword
    );

    res.status(201).json({
      message: "User created & email sent",
      user,
    });
  } catch (error) {
    console.error("Add User Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: "user",
      },
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= GET SINGLE USER =================
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update(req.body);

    const updatedUser = await User.findByPk(id);

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};