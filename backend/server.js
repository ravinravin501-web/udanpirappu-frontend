const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;

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

/* SMS OTP SECTION */

let otpStore = {};

app.post("/api/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.json({
        success: false,
        message: "Phone number required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp: otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: phone
      })
    });

    const result = await response.json();

    res.json({
      success: true,
      message: "OTP sent successfully",
      result: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  const savedOtp = otpStore[phone];

  if (!savedOtp) {
    return res.json({
      success: false,
      message: "OTP not found"
    });
  }

  if (Date.now() > savedOtp.expires) {
    delete otpStore[phone];

    return res.json({
      success: false,
      message: "OTP expired"
    });
  }

  if (savedOtp.otp === otp) {
    delete otpStore[phone];

    return res.json({
      success: true,
      message: "OTP verified"
    });
  }

  res.json({
    success: false,
    message: "Wrong OTP"
  });
});

/* SERVER START */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
