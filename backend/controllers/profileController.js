import User from "../models/User.js";
import College from "../models/College.js";


// SAVE COLLEGE
export const saveCollege = async (req, res) => {
  try {
    const { userId, collegeId } = req.body;

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedColleges: collegeId } }
    );

    res.status(200).json({ message: "College saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// REMOVE COLLEGE
export const removeCollege = async (req, res) => {
  try {
    const { userId, collegeId } = req.body;

    await User.findByIdAndUpdate(
      userId,
      { $pull: { savedColleges: collegeId } }
    );

    res.status(200).json({ message: "College removed successfully" });
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

    const colleges = await College.find({
      city: user.preferredCity,
      courses: user.preferredCourse,
      fees: { $lte: user.budgetRange }
    })
      .sort({ rating: -1 })
      .limit(5);

    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};