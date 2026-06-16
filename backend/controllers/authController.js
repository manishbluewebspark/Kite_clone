import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { Op } from "sequelize";
import { generateTempPassword } from "../utils/generatePassword.js";
import { sendResetOtpEmail } from "../utils/sendEmail.js";


// ================= LOGIN =================
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({
//       where: { email },
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not found",
//       });
//     }

//     const valid = await bcrypt.compare(
//       password,
//       user.password
//     );

//     if (!valid) {
//       return res.status(400).json({
//         message: "Invalid password",
//       });
//     }

//     const token = jwt.sign(
//       {
//         id: user.id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//     });

//     res.json({
//       message: "Login success",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error("LOGIN ERROR:", error);

//     res.status(500).json({
//       message: "Server error",
//     });
//   }
// };


export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        message: "Login ID and password are required",
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: loginId },
          { mobile: loginId },
          { user_id: loginId },
        ],
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        user_id: user.user_id,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ================= SEND OTP =================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const otp = generateTempPassword(6);

    const expiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.update({
      otp,
      otp_expiry: expiry,
    });

    await sendResetOtpEmail(
      email,
      otp
    );

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    res.json({
      message: "OTP verified",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await user.update({
      password: hashedPassword,
      otp: null,
      otp_expiry: null,
    });

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ================= ME =================
export const me = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "mobile",
        "status",
        "user_id",
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ================= LOGOUT =================
export const logout = (req, res) => {
  res.clearCookie("token");

  res.json({
    message: "Logged out",
  });
};