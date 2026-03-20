import bcrypt from "bcryptjs";
import User from "../models/User.js";

// POST /api/auth/reset-password
// Body: { email, newPassword }
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong. Try again." });
  }
};