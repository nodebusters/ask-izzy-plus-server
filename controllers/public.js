// EXPRESS ROUTER: Public pages to show all users and guests
const router = require('express').Router();
// MONGOOSE: Connect to MongoDB via Mongoose and reference Organisation collection
const mongoose = require('mongoose');

const User = require('../models/User')
const nodemailer = require('nodemailer'); 


// PUBLIC ROUTES: Root
router.get('/', (req, res) => {
  return res.send("public route working")
})

router.get('/admin', (req, res) => {
  return res.send("this is the login page for admin")
})

router.get('/users', (req, res) => {
  User.find()
    .then(docs => res.send(docs));
})

router.get('/email', (req, res) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASS
    }
  })

  const emailBody = {
    from: 'askizzyplustest1@gmail.com',
    to: 'askizzyplustest1@gmail.com',
    subject: 'PublicRoute Email Test',
    html: '<p>This email is sent via GET request from /email route</p>'
    }

transporter.sendMail(emailBody, function(error, info) {
  if(error){
    console.log(error)
    res.send('Email not sent :(')
 } else {
    console.log(info.response)
    res.send('Email Sent :-)')
}
})
})

module.exports = router;