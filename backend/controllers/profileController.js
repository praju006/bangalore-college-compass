import User from "../models/User.js";
import College from "../models/College.js";


// SAVE COLLEGE
export const saveCollege = async (req, res) => {
  try {
    const { userId, collegeName } = req.body;

    const college = await College.findOne({ name: collegeName });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedColleges: college._id } }
    );

    res.status(200).json({ message: "College saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// REMOVE COLLEGE
export const removeCollege = async (req, res) => {
  try {
    const { userId, collegeName } = req.body;

    const college = await College.findOne({ name: collegeName });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { savedColleges: college._id } }
    );

    res.status(200).json({ message: "College removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE PREFERENCES
export const updatePreferences = async (req, res) => {
  try {
    const { userId, preferredCity, preferredCourse, budgetRange } = req.body;

    await User.findByIdAndUpdate(userId, {
      preferredCity,
      preferredCourse,
      budgetRange,
    });

    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("savedColleges");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET RECOMMENDATIONS
export const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.preferredCity && !user.preferredCourse && !user.budgetRange) {
      const colleges = await College.find().sort({ rating: -1 }).limit(5);
      return res.status(200).json(colleges);
    }

    const query = {};
    if (user.preferredCity) query.city = { $regex: user.preferredCity, $options: "i" };
    if (user.budgetRange) query["courses.fees"] = { $lte: user.budgetRange };

    const colleges = await College.find(query).sort({ rating: -1 }).limit(5);
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};