const router = require('express').Router();
const jwtDecode = require('jwt-decode');
const nodemailer = require('nodemailer');
const Organisation = require('../models/Organisation')
const User = require('../models/User')
const ObjectId = require('mongoose').Types.ObjectId;
require('dotenv').load();

// MIDDLEWARE: isAuthenticated function checks if Google OAuth token exists, if so calls next otherwise it sends an error message.
const isAuthenticated = (req, res, next) => {
  //token can be passed in req.session or req.headers. 
  if (req.session.token || req.headers.token) {
    next();
  } else {
    res.send("Sorry you need to sign in");
  }
}

// Email Variables
const mailerEmail = process.env.GMAIL_ACCOUNT
const receiverEmail = 'askizzyplus.info@gmail.com'
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.GMAIL_ACCOUNT,
      pass: process.env.GMAIL_PASS
  }
})

//PASSPORT: Using isAuthenticated in all the end points of our router. To access any end point the token has to exists. 
router.use(isAuthenticated);

router.get('/profile', (req, res) => {
  const { user } = req.session.passport;
  res.send(user.profile);
});

router.get('/organisations', (req, res) => {
  Organisation.find()
    .then(docs => {
      res.send(docs)
    })
})

router.get('/users', (req, res) => {
  User.find()
    .then(docs => {
      res.send(docs)
    })
})

router.get('/dashboard', (req, res) => {
    const { user } = req.session.passport
    const { givenName } = user.profile.name;
    res.send(`Welcome ${givenName}`);
})

router.get('/admin/dashboard', (req, res) => {
    const { user } = req.session.passport
    const { givenName } = user.profile.name;
    res.send(`You are logged in as ${givenName} from Infoxchange`);
})

//Checks if the user exists in the authorised users database, if so it responds with the user organisation data.
router.get('/getUserData', (req, res) => {  
  const { token } = req.headers;
  const decoded = jwtDecode(token);
  const { email } = decoded;
  //Accessing the data from organisation based on the email.
  const Organisation = require('../models/Organisation');
  const User = require('../models/User');
  User.findOne({ email })
    .then((doc) => {
      if (doc) {
        const user = doc;
        Organisation.findOne({ _id: user.organisation })
          .then((doc) => {
            const organisation = doc;
            const data = {
              user,
              organisation
            };
            return res.send(data);
          })
      } else {
        const data = {
          message: "Sorry this email is not authorised to use the platform. Please contact Infoexchange to register."
        }
        return res.send(data);
      }
    })
    .catch((error) => {
      const data = {
        message: "Sorry something went wrong with the server."
      }
      return res.send(data);
    })
})

//Update ORGANISATION - EMAIL DONE!.... loop added.
router.put('/organisation/:_id', (req, res) => {
  const { _id } = req.params;
  const options = {
    new: true,
  }
  req.body.lastUpdated = new Date();
  Organisation.findByIdAndUpdate(new ObjectId(_id), req.body, options, (err, organisation) => {
    res.send(organisation);
// Email Code
  const dataUpdated = Object.keys(req.body).map(function(key) {
    const val = req.body[key];
    return `<li>${key.toUpperCase()}: ${val}</li>`
  });

  const emailBody = {
    from: mailerEmail,
    to: receiverEmail,
    subject: 'Organisation Updated',
    html: `<h3>Hello infoXchange</h3><p>A user from ${organisation.name} has updated the information for this organisation<br>The new information submitted is as follows....<br><br><ul>${dataUpdated.join("")}</ul></p>`
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
})

//Create Site - EMAIL DONE!... Loop added
router.post('/site/:org_id', (req, res) => {
  const { org_id } = req.params;
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    const site = req.body;
    organisation.sitesInOrganisation.push(site);
    organisation.save();
    res.send(organisation);
// Email Code
const dataUpdated = Object.keys(req.body).map(function(key) {
  const val = req.body[key];
  return `<li>${key.toUpperCase()}: ${val}</li>`
});

const emailBody = {
  from: mailerEmail,
  to: receiverEmail,
  subject: 'Site Created',
  html: `<h3>Hello infoXchange</h3><p>A user from ${organisation.name} has created a new site.<br>The data submitted for the new site is... <br><br><ul>${dataUpdated.join("")}</ul></p>`
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
})

// Update Site - EMAIL DONE!... Loop added
router.put('/site/:org_id/:site_id', (req, res) => { 
  const { org_id, site_id } = req.params;
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id))
    site.set(req.body);
    organisation.lastUpdated = new Date();
    organisation.save(() => {
      res.send(organisation);
    })
    // Email Code
    const dataUpdated = Object.keys(req.body).map(function(key) {
      const val = req.body[key];
      return `<li>${key.toUpperCase()}: ${val}</li>`
    });

    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: 'Site Updated',
      html: `<h3>Hello infoXchange</h3><p>A user from ${organisation.name} has updated details for the '${site.name}' Site<br>The data submitted for the new site is... <br><br><ul>${dataUpdated.join("")}</ul></p>`
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
})

//Delete Site EMAIL DONE!... No Loop required.
router.delete('/site/:org_id/:site_id', (req, res) => {
  const { org_id, site_id } = req.params;
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    if (err){
      return res.send(err)
    }
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    site.remove();
    organisation.save();
    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: 'Site Deleted',
      html: `<h4>Hello infoeXchange</h4><p>A user from ${organisation.name} has deleted the '${site.name}' site</p>`
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
    return res.send(organisation);
  })
})

//Create Service EMAIL DONE!... loop added
router.post('/service/:org_id/:site_id', (req, res) => {
  const { org_id, site_id } = req.params;
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
// Finding the records and updating them    
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    const services= site.servicesInSite;
    const service = req.body;
    services.push(service);
    organisation.save();
    res.send(organisation);
 // Email Code
 const dataUpdated = Object.keys(req.body).map(function(key) {
  const val = req.body[key];
  return `<li>${key.toUpperCase()}: ${val}</li>`
});

const emailBody = {
  from: mailerEmail,
  to: receiverEmail,
  subject: 'Service Created',
  html: `<h3>Hello infoXchange</h3><p>A user from ${organisation.name} has created a new service for '${site.name}' Site<br>The data submitted for the new site is... <br><br><ul>${dataUpdated.join("")}</ul></p>`
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
})

// Update Service EMAIL DONE!... Created loop
router.put('/service/:org_id/:site_id/:service_id', (req, res) => { 
  const { org_id, site_id, service_id } = req.params;
   Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id))
    const service = site.servicesInSite.id(new ObjectId(service_id))
    service.set(req.body);
    //Here we change the value of lastUpdated to the current date/time.
    organisation.lastUpdated = new Date();
    organisation.save(() => {
      res.send(organisation);
    })
     // Email Code
     const dataUpdated = Object.keys(req.body).map(function(key) {
      const val = req.body[key];
      return `<li>${key.toUpperCase()}: ${val}</li>`
    });

    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: `Service Updated`,
      html: `<h3>Hello infoXchange</h3><p>A user from ${organisation.name} has updated details for the '${service.name}' service under their '${site.name}' Site<br>The data submitted for the new site is... <br><br><ul>${dataUpdated.join("")}</ul></p>`
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
})

// Delete Service EMAIL DONE!
router.delete('/service/:org_id/:site_id/:service_id', (req,res)=>{
  const { org_id, site_id, service_id } = req.params;
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    if (err){
      return res.send(err)
    }
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    const service = site.servicesInSite.id(new ObjectId(service_id));
    service.remove();
    organisation.save();
// Email Code
    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: 'Service Deleted',
      html: `<h4>Hello infoeXchange</h4><p>A user from ${organisation.name} has deleted the service '${service.name}' which was provided at the '${site.name}' site`
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
    return res.send(organisation);
  })
})

//ADMIN END POINTS:
//Checks if the admin user exists in the authorised admin users database, if so it responds with the admin user data.
router.get('/getAdminUserData', (req, res) => {
  const { token } = req.headers;
  // console.log('token', ': ', token);
  const decoded = jwtDecode(token);
  const { email } = decoded;
  const AdminUser = require('../models/AdminUser');
  AdminUser.findOne({ email })
    .then((doc) => {
      if (doc) {
        const adminUser = doc;
        const data = {
          adminUser
        }
        return res.send(data)
      } else {
        const data = {
          message: "Sorry you are not authorized to use the admin dashboard"
        }
        return res.send(data)
      }
    }) 
    .catch((error) => {
      const data = {
        message: "Sorry something went wrong with the server."
      }
      return res.send(data);
    })
})

//Create user route
router.post('/user', (req, res) => {
  const newUser = req.body;
  User.create(newUser)
  .then(doc => {
    User.find()
    .then(users => res.send(users))
  })
})

//Delete user route
router.delete('/user/:user_id', (req, res) => {
  const { user_id }= req.params;
  const User = require('../models/User');
  User.findOneAndRemove({ _id: user_id })
    .then(doc => {
      User.find()
        .then(users => res.send(users))
    })
})

module.exports = router;