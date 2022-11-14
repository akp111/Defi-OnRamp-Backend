const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true, unique: true },
    stripe_id: {type: String, unique: true},
    amount: {type:Number}
  },
  { timestamp: true }
);

module.exports = mongoose.model("User", userSchema);