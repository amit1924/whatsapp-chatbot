import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  data: Object,
});

export default mongoose.model("Session", sessionSchema);
