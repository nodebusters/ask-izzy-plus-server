const router = require('express').Router();
const jwtDecode = require('jwt-decode');
const nodemailer = require('nodemailer');
const Organisation = require('../models/Organisation')
const User = require('../models/User')
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
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.GMAIL_ACCOUNT,
      pass: process.env.GMAIL_PASS
  }
})
const mailerEmail = 'askizzyplus.mailer@gmail.com'
const receiverEmail = 'askizzyplus.user1@gmail.com'

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

//Update ORGANISATION - EMAIL DONE
router.put('/organisation/:_id', (req, res) => {
  const { _id } = req.params;
  //Note that _id is a mongo ObjectId not a string.
  const ObjectId = require('mongoose').Types.ObjectId;
  // new:true returns the updated document instead of the previous one.
  const options = {
    new: true,
  }
  const update = req.body;
  //Here we change the value of lastUpdated to the current date/time.
  update.lastUpdated = new Date();
  //findByIdAndUpdate(id,update,options,callback);
  Organisation.findByIdAndUpdate(new ObjectId(_id), update, options, (err, organisation) => {
    res.send(organisation);
  })
// Email Code
  const description = 'Description: ' + update.description 
  const website = 'Website: ' + update.website
  const abn = 'ABN: ' + update.abn
  const providerType = 'Provider Type ' + update.providerType
  const alsoKnownAs = 'Also Known As: ' + update.alsoKnownAs
  const emailAddress = 'Email Address: ' + update.emailAddress
  const emailIsConfidential = 'Email Is Confidential: ' + update.emailIsConfidential
  const postalAddress = 'Postal Address: ' + update.postalAddress
  const state = 'State: ' + update.state
  const suburb = 'Suburb: ' + update.suburb
  const postCode = 'Postcode: ' + update.state
  const postalAddressCon = 'Postal Address is Confidential: ' + update.postalAddressIsConfidential
  const phoneNumber = 'Phone Number: ' + update.phoneNumber
  const phoneKind = 'Phone Kind: ' + update.phoneKind
  const phoneCon = 'Phone is Confidential: ' + update.phoneIsConfidential
  const ceo = 'CEO: ' + update.ceo
  
  const emailBody = {
    from: mailerEmail,
    to: receiverEmail,
    subject: 'Organisation Details have been Updated',
    html: `<h3>Organisation Data Update</h3><p>from has updated details for<br>The new information submitted is as follows....<br><br>${description}<br>
    ${website}<br>${abn}<br>${providerType}<br>${alsoKnownAs}<br>${emailAddress}<br>${emailIsConfidential}<br>${postalAddress}<br>${state}<br>${suburb}<br>${postCode}<br>${postalAddressCon}<br>${phoneNumber}<br>${phoneKind}<br>${phoneCon}<br>${ceo}</p>`
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

//Create Site - EMAIL DONE
router.post('/site/:org_id', (req, res) => {
  const { org_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const update = req.body;
//  const Organisation = require('../models/Organisation')
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    //We are finding site with the help of mongoose method id(). This is handy when we have an array of objects in mongoose.  This methods takes a Mongoose ObjectId and returns the document.
    const site = update;
    organisation.sitesInOrganisation.push(site);
    organisation.save();
    res.send(organisation);
  })
// Email Code
const siteName = 'Site Name: ' + update.name
const accessibility = 'Accessibility: ' + update.accessibility
const locationDetails = 'Location Details: ' + update.locationDetails
const parkingInfo = 'Parking Info: ' + update.parkingInfo
const publicTransportInfo = 'Public Transport Info: ' +update.publicTransportInfo
const isMobile = 'Is Mobile?: ' + update.isMobile
const emailAddress = 'Email Address: ' + update.emailAddress
const emailIsConfidential = 'Email is Confidential?: ' + update.emailIsConfidential
const website = 'Website: ' + update.website
const postalAddress = 'Postal Address: ' + update.postalAddress
const postalAddressState = 'Postal Address State: ' + update.postalAddressState
const postalAddressSuburb = 'Postal Address Suburb: ' + update.postalAddressSuburb
const postalAddressPostcode = 'Postal Address Postcode: ' + update.postalAddressPostcode
const postalAddressIsConfidential = 'Postal Address Confidential?: ' + update.postalAddressIsConfidential
const phoneNumber = 'Phone Number: ' + update.phoneNumber
const phoneKind = 'Phone Kind: ' + update.phoneKind
const phoneIsConfidential = 'Phone Confidential?: ' + update.phoneIsConfidential
const openingHours = 'Opening Hours: ' + update.openingHours
const addressBuilding = 'Address Building: ' + update.addressBuilding
const addressLevel = 'Addresss Level: ' + update.addressLevel
const addressFlatUnit = 'Address Flat/Unit: ' + update.addressFlatUnit
const addressStreetNumber = 'Address Street Number: ' + update.addressStreetNumber
const addressStreetName = 'Address Street Name: ' + update.addressStreetName
const addressStreetType = 'Address Street Type: ' + update.addressStreetType
const addressStreetSuffix = 'Address Street Suffix: ' + update.addressStreetSuffix
const addressSuburb = 'Address Suburb: ' + update.addressSuburb
const addressState = 'Address State: ' + update.addressState
const addressPostcode = 'Address Postcode: ' + update.addressPostcode
const addressIsConfidential = 'Address Confidential: ' + update.addressIsConfidential

const emailBody = {
  from: mailerEmail,
  to: receiverEmail,
  subject: 'New Site Created',
  html: `<h3>New Site Created</h3><p>x from y has created a new site<br>The new information submitted is as follows....<br><br>${siteName}<br>
  ${accessibility}<br>${locationDetails}<br>${parkingInfo}<br>${publicTransportInfo}<br>${isMobile}<br>${emailAddress}<br>${emailIsConfidential}<br>${website}<br>${postalAddress}<br>${postalAddressState}<br>${postalAddressSuburb}<br>${postalAddressPostcode}<br>${phoneKind}<br>${phoneKind}<br>${phoneIsConfidential}<br>${openingHours}<br>${addressBuilding}<br>${addressLevel}<br>${addressFlatUnit}<br>${addressStreetNumber}<br>${addressStreetName}<br>${addressStreetType}<br>${addressStreetSuffix}<br>${addressSuburb}<br>${addressState}<br>${addressPostcode}<br>${addressIsConfidential}</p>`
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

// Update Site - EMAIL DONE
router.put('/site/:org_id/:site_id', (req, res) => { 
  const { org_id, site_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const update = req.body;
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    //We are finding site with the help of mongoose method id(). This is handy when we have an array of objects in mongoose.  This methods takes a Mongoose ObjectId and returns the document.
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id))
    // Using the mongoose set() method to replace the values of site with the ones stored in update (req.body).
    site.set(update);
    //Here we change the value of lastUpdated to the current date/time.
    organisation.lastUpdated = new Date();
    // In Mongo we need to save the main document, if not the changes to the subdocument won't take place.
    organisation.save(() => {
      res.send(organisation);
    })
    //Note we use a callback to wait until is saved to send the response. 
  })
// Email Code
const siteName = 'Site Name: ' + update.name
const accessibility = 'Accessibility: ' + update.accessibility
const locationDetails = 'Location Details: ' + update.locationDetails
const parkingInfo = 'Parking Info: ' + update.parkingInfo
const publicTransportInfo = 'Public Transport Info: ' +update.publicTransportInfo
const isMobile = 'Is Mobile?: ' + update.isMobile
const emailAddress = 'Email Address: ' + update.emailAddress
const emailIsConfidential = 'Email is Confidential?: ' + update.emailIsConfidential
const website = 'Website: ' + update.website
const postalAddress = 'Postal Address: ' + update.postalAddress
const postalAddressState = 'Postal Address State: ' + update.postalAddressState
const postalAddressSuburb = 'Postal Address Suburb: ' + update.postalAddressSuburb
const postalAddressPostcode = 'Postal Address Postcode: ' + update.postalAddressPostcode
const postalAddressIsConfidential = 'Postal Address Confidential?: ' + update.postalAddressIsConfidential
const phoneNumber = 'Phone Number: ' + update.phoneNumber
const phoneKind = 'Phone Kind: ' + update.phoneKind
const phoneIsConfidential = 'Phone Confidential?: ' + update.phoneIsConfidential
const openingHours = 'Opening Hours: ' + update.openingHours
const addressBuilding = 'Address Building: ' + update.addressBuilding
const addressLevel = 'Addresss Level: ' + update.addressLevel
const addressFlatUnit = 'Address Flat/Unit: ' + update.addressFlatUnit
const addressStreetNumber = 'Address Street Number: ' + update.addressStreetNumber
const addressStreetName = 'Address Street Name: ' + update.addressStreetName
const addressStreetType = 'Address Street Type: ' + update.addressStreetType
const addressStreetSuffix = 'Address Street Suffix: ' + update.addressStreetSuffix
const addressSuburb = 'Address Suburb: ' + update.addressSuburb
const addressState = 'Address State: ' + update.addressState
const addressPostcode = 'Address Postcode: ' + update.addressPostcode
const addressIsConfidential = 'Address Confidential: ' + update.addressIsConfidential

const emailBody = {
  from: mailerEmail,
  to: receiverEmail,
  subject: 'Site Updated',
  html: `<h3>Site Updated</h3><p>x from y has updated the information for an existing site<br>The new information submitted is as follows....<br><br>${siteName}<br>
  ${accessibility}<br>${locationDetails}<br>${parkingInfo}<br>${publicTransportInfo}<br>${isMobile}<br>${emailAddress}<br>${emailIsConfidential}<br>${website}<br>${postalAddress}<br>${postalAddressState}<br>${postalAddressSuburb}<br>${postalAddressPostcode}<br>${phoneKind}<br>${phoneKind}<br>${phoneIsConfidential}<br>${openingHours}<br>${addressBuilding}<br>${addressLevel}<br>${addressFlatUnit}<br>${addressStreetNumber}<br>${addressStreetName}<br>${addressStreetType}<br>${addressStreetSuffix}<br>${addressSuburb}<br>${addressState}<br>${addressPostcode}<br>${addressIsConfidential}</p>`
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

//Delete Site
router.delete('/site/:org_id/:site_id', (req,res)=>{
  const { org_id, site_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  Organisation.find({ _id: org_id })
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    if (err){
      return res.send(err)
    }
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    // console.log('site',': ', site);
    site.remove();
    organisation.save();
    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: 'Site Deleted',
      html: `<h3>Site Deleted</h3><p>x from y has deleted a site<br>The site deleted is - ${site.name}</p>`
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

//Create Service
router.post('/service/:org_id/:site_id', (req, res) => {
  //Getting organisation and site _ids from req.params. 
  const { org_id, site_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const Organisation = require('../models/Organisation');
  //Storing req.body in update const.
  const update = req.body;

  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    //We are finding site with the help of mongoose method id(). This is handy when we have an array of objects in mongoose.  This methods takes a Mongoose ObjectId and returns the document.
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    const services= site.servicesInSite;
    const service = update;
    services.push(service);
    organisation.save();
    
    res.send(organisation);
 
  })
})

// Update Service
router.put('/service/:org_id/:site_id/:service_id', (req, res) => {
  //Getting organisation and site _ids from req.params. 
  const { org_id, site_id, service_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const Organisation = require('../models/Organisation');
  //Storing req.body in update const.
  const update = req.body;

  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    //We are finding site with the help of mongoose method id(). This is handy when we have an array of objects in mongoose.  This methods takes a Mongoose ObjectId and returns the document.
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id))

    //Likewise we find service by id. 
    const service = site.servicesInSite.id(new ObjectId(service_id))

    // Using the mongoose set() method to replace the values of service with the ones stored in update (req.body).
    service.set(update);

    //Here we change the value of lastUpdated to the current date/time.
    organisation.lastUpdated = new Date();
    // In Mongo we need to save the main document, if not the changes to the subdocument won't take place.
    organisation.save(() => {
      res.send(organisation);
    })
    //Note we use a callback to wait until is saved to send the response. 
  })
})

// Delete Service
router.delete('/service/:org_id/:site_id/:service_id', (req,res)=>{
  const { org_id, site_id, service_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const Organisation = require('../models/Organisation');
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    if (err){
      return res.send(err)
    }
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    // console.log('site',': ', site);
    const service = site.servicesInSite.id(new ObjectId(service_id));
    service.remove();
    organisation.save();
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