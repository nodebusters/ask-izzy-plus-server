const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User')
const nodemailer = require('nodemailer')

// PUBLIC ROUTES: Root
router.get('/', (req,res) => {
  return res.send("public route working")
})

router.get('/admin', (req, res) => {
  return res.send("this is the login page for admin")
})

router.get('/emailTest', (req, res) => {
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
    subject: 'GET Test via /emailTest',
    html: `<h1>GET Request Email from Public Route</h1><p>This triggers when you goto /emailTest in the API app.</p>`
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