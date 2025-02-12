import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
});

const Session = mongoose.model("Session", SessionSchema);
export default Session;
