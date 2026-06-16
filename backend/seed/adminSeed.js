import bcrypt from "bcrypt";
import sequelize from "../config/db.js";
import User from "../models/User.js";

const seed = async () => {
  try {
    await sequelize.authenticate();

    const existing = await User.findOne({
      where: { email: "admin@gmail.com" },
    });

    if (existing) {
      console.log("Admin already exists");
      return process.exit(0);
    }

    const hashed = await bcrypt.hash("admin123", 10);

    await User.create({
      user_id: 1,
      name: "Admin",
      email: "admin@gmail.com",
      password: hashed,
    });

    console.log("Admin seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();