const mongoose = require("mongoose");

const { Schema } = mongoose;

const AdminUserSchema = new Schema({
  email: String,
  firstName: String,
  lastName: String
});

module.exports = mongoose.model("AdminUser", AdminUserSchema);