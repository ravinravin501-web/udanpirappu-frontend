const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.log("MONGO_URL is missing");
}

mongoose.connect(MONGO_URL)
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.log("MongoDB connection error:", err));

const memberSchema = new mongoose.Schema({
  voterId: String,
  name: String,
  fatherName: String,
  dob: String,
  gender: String,
  phone: String,
  district: String,
  constituency: String,
  address: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Member = mongoose.model("Member", memberSchema);

app.get("/", (req, res) => {
  res.send("Udanpirappu backend running");
});

app.post("/api/register", async (req, res) => {
  try {
    const member = await Member.create(req.body);

    res.json({
      success: true,
      message: "Member registered successfully",
      memberId: member._id
    });

  } catch (error) {
    console.log("Register error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get("/api/members", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
