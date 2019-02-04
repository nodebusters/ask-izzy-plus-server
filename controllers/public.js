// EXPRESS ROUTER: Public pages to show all users and guests
const router = require('express').Router();

// MONGOOSE: Connect to MongoDB via Mongoose and reference Organisation collection
const mongoose = require('mongoose');
const User = require('../models/User')


// PUBLIC ROUTES: Root
router.get('/', (req,res) => {
  return res.send("public route working")
})

router.get('/admin', (req, res) => {
  return res.send("this is the login page for admin")
})

module.exports = router;