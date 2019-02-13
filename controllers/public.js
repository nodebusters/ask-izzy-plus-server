const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User");

router.get("/", (req, res) => {
  return res.send("public route working");
});

router.get("/admin", (req, res) => {
  return res.send("this is the login page for admin");
});

module.exports = router;