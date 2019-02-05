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
const mailerEmail = 'askizzyplus.mailer@gmail.com'
const receiverEmail = 'askizzyplus.user1@gmail.com'
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

//Update ORGANISATION - EMAIL DONE!
router.put('/organisation/:_id', (req, res) => {
  const { _id } = req.params;
  const options = {
    new: true,
  }
  req.body.lastUpdated = new Date();
  Organisation.findByIdAndUpdate(new ObjectId(_id), req.body, options, (err, organisation) => {
    res.send(organisation);
// Email Code
  const { description, website, abn, providerType, alsoKnownAs, emailAddress, emailIsConfidential, postalAddress, postalAddressState, postalAddressSuburb, postalAddressPostcode, postalAddressIsConfidential, phoneNumber, phoneKind, phoneIsConfidential, ceo } = req.body

  const emailBody = {
    from: mailerEmail,
    to: receiverEmail,
    subject: 'Organisation Details Updated',
    html: `<h3>Hello infoXchange</h3><p>A user from ${organisation.name} has updated their information<br>The new information submitted is as follows....<br><br>Description: ${description}<br>Website: ${website}<br>ABN: ${abn}<br>Provider Type: ${providerType}<br>Also Known As: ${alsoKnownAs}<br>Email Address: ${emailAddress}<br>Email Confidential?: ${emailIsConfidential}<br>Postal Address: ${postalAddress}<br>State: ${postalAddressState}<br>Suburb: ${postalAddressSuburb}<br>PostCode: ${postalAddressPostcode}<br>Postal Address is Confidential? ${postalAddressIsConfidential}<br>Phone Number: ${phoneNumber}<br>Phone Kind: ${phoneKind}<br>Phone is Confidential?: ${phoneIsConfidential}<br>CEO: ${ceo}</p>`
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

//Create Site - EMAIL DONE!
router.post('/site/:org_id', (req, res) => {
  const { org_id } = req.params;
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    const site = req.body;
    organisation.sitesInOrganisation.push(site);
    organisation.save();
    res.send(organisation);
// Email Code
    const { name, accessibility, locationDetails, parkingInfo, publicTransportInfo, isMobile, emailAddress, emailIsConfidential, website, postalAddress, postalAddressState, postalAddressSuburb, postalAddressPostcode, postalAddressIsConfidential, phoneNumber, phoneKind, phoneIsConfidential, openingHours, addressBuilding, addressLevel, addressFlatUnit, addressStreetNumber, addressStreetName, addressStreetType, addressStreetSuffix, addressSuburb, addressState, addressPostcode, addressIsConfidential } = req.body

    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: 'New Site Created',
      html: `<h3>Hello infoeXchange</h3><p>A user from ${organisation.name} has created a new site.<br><br>Site Name: ${name}<br>Accessibility: 
      ${accessibility}<br>Location Details: ${locationDetails}<br>Parking Info: ${parkingInfo}<br>Public Transport Info: ${publicTransportInfo}<br>Is Mobile: ${isMobile}<br>Email Address: ${emailAddress}<br>Email Is Confidential?: ${emailIsConfidential}<br>Website: ${website}<br>Postal Address: ${postalAddress}<br>Postal Address State: ${postalAddressState}<br>Postal Address Suburb: ${postalAddressSuburb}<br>Postal Address Postcode: ${postalAddressPostcode}<br>Phone Kind: ${phoneKind}<br>Phone is Confidential?: ${phoneIsConfidential}<br>Opening Hours${openingHours}<br>Address Building: ${addressBuilding}<br>Address Level: ${addressLevel}<br>Address Flat Unit: ${addressFlatUnit}<br>Address Street Number: ${addressStreetNumber}<br>Address Street Name: ${addressStreetName}<br>Address Street Type: ${addressStreetType}<br>Address Street Suffix: ${addressStreetSuffix}<br>Address Suburb: ${addressSuburb}<br>Address State: ${addressState}<br>Address Postcode: ${addressPostcode}<br>Address Is Confidential: ${addressIsConfidential}</p>`
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

// Update Site - EMAIL DONE!
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
  const { siteName, accessibility, locationDetails, parkingInfo, publicTransportInfo, isMobile, emailAddress, emailIsConfidential, website, postalAddress, postalAddressState, postalAddressSuburb, postalAddressPostcode, postalAddressIsConfidential, phoneNumber, phoneKind, phoneIsConfidential, openingHours, addressBuilding, addressLevel, addressFlatUnit, addressStreetNumber, addressStreetName, addressStreetType, addressStreetSuffix, addressSuburb, addressState, addressPostcode, addressIsConfidential } = req.body

const emailBody = {
  from: mailerEmail,
  to: receiverEmail,
  subject: 'Site Updated',
  html: `<h3>Hello infoeXchange</h3><p>A user from ${organisation.name} has updated information for the '${site.name}' site.<br><br>Site Name: ${siteName}<br>Accessibility: 
  ${accessibility}<br>Location Details: ${locationDetails}<br>Parking Info: ${parkingInfo}<br>Public Transport Info: ${publicTransportInfo}<br>Is Mobile: ${isMobile}<br>Email Address: ${emailAddress}<br>Email Is Confidential?: ${emailIsConfidential}<br>Website: ${website}<br>Postal Address: ${postalAddress}<br>Postal Address State: ${postalAddressState}<br>Postal Address Suburb: ${postalAddressSuburb}<br>Postal Address Postcode: ${postalAddressPostcode}<br>Phone Kind: ${phoneKind}<br>Phone is Confidential?: ${phoneIsConfidential}<br>Opening Hours${openingHours}<br>Address Building: ${addressBuilding}<br>Address Level: ${addressLevel}<br>Address Flat Unit: ${addressFlatUnit}<br>Address Street Number: ${addressStreetNumber}<br>Address Street Name: ${addressStreetName}<br>Address Street Type: ${addressStreetType}<br>Address Street Suffix: ${addressStreetSuffix}<br>Address Suburb: ${addressSuburb}<br>Address State: ${addressState}<br>Address Postcode: ${addressPostcode}<br>Address Is Confidential: ${addressIsConfidential}</p>`
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

//Delete Site EMAIL DONE!
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
      subject: `Site Deleted by ${organisation.name}`,
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

//Create Service EMAIL DONE!
router.post('/service/:org_id/:site_id', (req, res) => {
  const { org_id, site_id } = req.params;
  const {  name, description, referralInfo, adhcEligible, assessmentCriteria, targetGender, availability, billingMethod, cost, crisisKeywords, details, eligibilityInfo, ineligibilityInfo, fundingBody, healthcareCardHolders, intakeInfo, intakePoint, isBulkBilling, ndisApproved, promotedService, specialRequirements, language, ageGroupKeyword, ageGroupDescription, serviceTypes, indigenousClassification, capacityStatus, capacityStatusText, capacityFrequency, capacityLastNotification, capacityLastStatusUpdate, capacityExpireDate, accreditationName } = req.body

  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
// Finding the records and updating them    
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    const services= site.servicesInSite;
    const service = req.body;
    services.push(service);
    organisation.save();
    res.send(organisation);
// Sending the email advising what has been created.
    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: 'New Service Created',
      html: `<h4>Hello infoeXchange</h4><p>A user from ${organisation.name} has created a new service for the '${site.name}' site.<br><br>Name: ${name}<br>Description: ${description}<br>Referral Info: ${referralInfo}<br>ADHC Eligible: ${adhcEligible}<br>Assessment Criteria: ${assessmentCriteria}<br>Target Gender: ${targetGender}<br>Availability: ${availability}<br>Billing Method: ${billingMethod}<br>Cost: ${cost}<br>Crisis Keywords: ${crisisKeywords}<br>Details: ${details}<br>Eligibility Info: ${eligibilityInfo}<br>Ineligibility Info: ${ineligibilityInfo}<br>Funding Body: ${fundingBody}<br>Healthcare Card Holders: ${healthcareCardHolders}<br>Intake Info: ${intakeInfo}<br>Bulk Billing?: ${isBulkBilling}<br>NDIS Approved: ${ndisApproved}<br>Promoted Service: ${promotedService}<br>Special Requirements: ${specialRequirements}<br>Language: ${language}<br>Age Group Keyword: ${ageGroupKeyword}<br>Age Group Description: ${ageGroupDescription}<br>Service Types: ${serviceTypes}<br>Indigenous Classification: ${indigenousClassification}<br>Capacity Status: ${capacityStatus}<br>Capacity Status Text: ${capacityStatusText}<br>Capacity Frequency: ${capacityFrequency}<br>Capacity Last Notification: ${capacityLastNotification}<br>Capacity Last Status Update: ${capacityLastStatusUpdate}<br>Capacity Expire Date: ${capacityExpireDate}<br>Accreditation Name: ${accreditationName}</p>`
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

// Update Service EMAIL DONE!
router.put('/service/:org_id/:site_id/:service_id', (req, res) => { 
  const { org_id, site_id, service_id } = req.params;
  const {  name, description, referralInfo, adhcEligible, assessmentCriteria, targetGender, availability, billingMethod, cost, crisisKeywords, details, eligibilityInfo, ineligibilityInfo, fundingBody, healthcareCardHolders, intakeInfo, intakePoint, isBulkBilling, ndisApproved, promotedService, specialRequirements, language, ageGroupKeyword, ageGroupDescription, serviceTypes, indigenousClassification, capacityStatus, capacityStatusText, capacityFrequency, capacityLastNotification, capacityLastStatusUpdate, capacityExpireDate, accreditationName } = req.body

  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id))
    const service = site.servicesInSite.id(new ObjectId(service_id))
    service.set(req.body);
    //Here we change the value of lastUpdated to the current date/time.
    organisation.lastUpdated = new Date();
    organisation.save(() => {
      res.send(organisation);
    })
    // Sending the email advising what has been updated.
    const emailBody = {
      from: mailerEmail,
      to: receiverEmail,
      subject: 'Service Info Updated',
      html: `<h4>Hello infoeXchange</h4><p>A user from ${organisation.name} has updated details of a service at ${site.name}<br><br>Name: ${name}<br>Description: ${description}<br>Referral Info: ${referralInfo}<br>ADHC Eligible: ${adhcEligible}<br>Assessment Criteria: ${assessmentCriteria}<br>Target Gender: ${targetGender}<br>Availability: ${availability}<br>Billing Method: ${billingMethod}<br>Cost: ${cost}<br>Crisis Keywords: ${crisisKeywords}<br>Details: ${details}<br>Eligibility Info: ${eligibilityInfo}<br>Ineligibility Info: ${ineligibilityInfo}<br>Funding Body: ${fundingBody}<br>Healthcare Card Holders: ${healthcareCardHolders}<br>Intake Info: ${intakeInfo}<br>Bulk Billing?: ${isBulkBilling}<br>NDIS Approved: ${ndisApproved}<br>Promoted Service: ${promotedService}<br>Special Requirements: ${specialRequirements}<br>Language: ${language}<br>Age Group Keyword: ${ageGroupKeyword}<br>Age Group Description: ${ageGroupDescription}<br>Service Types: ${serviceTypes}<br>Indigenous Classification: ${indigenousClassification}<br>Capacity Status: ${capacityStatus}<br>Capacity Status Text: ${capacityStatusText}<br>Capacity Frequency: ${capacityFrequency}<br>Capacity Last Notification: ${capacityLastNotification}<br>Capacity Last Status Update: ${capacityLastStatusUpdate}<br>Capacity Expire Date: ${capacityExpireDate}<br>Accreditation Name: ${accreditationName}</p>`
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