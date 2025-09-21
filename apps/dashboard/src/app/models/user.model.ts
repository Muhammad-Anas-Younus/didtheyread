import mongoose, { models } from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profileImg: { type: String },
});

const userModel = models.user || mongoose.model("user", userSchema);

export default userModel;
