// EXPRESS ROUTER: Protected pages redirected from auth.js middleware
const router = require('express').Router();
const jwtDecode = require('jwt-decode');
const nodemailer = require('nodemailer');
require('dotenv').load();

const Organisation = require('../models/Organisation')

router.get('/test', (req, res) => {
  return res.send("protected route working")
})

// MIDDLEWARE: isAuthenticated function checks for Google oAuth token first
const isAuthenticated = (req, res, next) => {
  if (req.session.token) {
    next();
  } else {
    res.send("Sorry you need to login");
  }
}

// PASSPORT: To access profile, isAuthenticated function runs first, returns a Google oAuth object
router.get('/profile', isAuthenticated, (req, res) => {
  const { user } = req.session.passport;
  console.log('req.session', ': ', req.session);
  res.send(user.profile);
});

// PASSPORT: To access dashboard, a token must exist, otherwise will show a message to sign in
router.get('/dashboard', (req, res) => {
  if (req.session.token) {
    const { user } = req.session.passport
    console.log('req.session', ': ', req.session);
    const { givenName } = user.profile.name;
    res.send(`Welcome ${givenName}`);
  } else {
    res.send("Sorry you need to sign in.");
  }
})

router.get('/admin/dashboard', (req, res) => {
  if (req.session.token) {
    const { user } = req.session.passport
    console.log('req.session', ': ', req.session);
    const { givenName } = user.profile.name;
    res.send(`You are logged in as ${givenName} from Infoxchange`);
  } else {
    res.send("Sorry you need to sign in.");
  }
})

router.get('/organisations', (req, res) => {
  Organisation.find()
    .then(docs => {
      res.send(docs)
    })
})

//CHECKS for google oauth token and send back data to client.
//localhost:5000/protected/getUserData
router.get('/getUserData', (req, res) => {
  const { token } = req.headers;
  // console.log('token', ': ', token);
  const decoded = jwtDecode(token);
  const { email } = decoded;
  //Accessing the data from organisation based on the email.
  const Organisation = require('../models/Organisation');
  const User = require('../models/User');
  User.findOne({ email })
    .then((doc) => {
      // console.log('doc', ': ', doc);
      if (doc) {
        const user = doc;
        // console.log('user.organisation',': ', user.organisation);
        Organisation.findOne({ _id: user.organisation })
          .then((doc) => {
            // console.log('doc', ': ', doc);

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

router.post('/create/user', (req, res) => {
  const newUser = req.body;
  const User = require('../models/User');
  User.create(newUser, (err, small) => {
    if (err) return handleError(err);
  });
})

//Note the ":" to declare params in the route.
router.put('/update/organisation/:_id', (req, res) => {
  const { _id } = req.params;
  const Organisation = require('../models/Organisation');

  //Note that _id is a mongo ObjectId not a string.
  const ObjectId = require('mongoose').Types.ObjectId;

  // new:true returns the updated document instead of the previous one.
  const options = {
    new: true,
  }

  //Storing req.body in update const.
  const update = req.body;

  //Here we change the value of lastUpdated to the current date/time.
  update.lastUpdated = new Date();

  //findByIdAndUpdate(id,update,options,callback);
  Organisation.findByIdAndUpdate(new ObjectId(_id), update, options, (err, organisation) => {
    // console.log('organisation', ': ', organisation);
    res.send(organisation);
  })

})

//Note the ":" to declare params in the route.
router.put('/update/site/:org_id/:site_id', (req, res) => {
  //Getting organisation and site _ids from req.params. 
  const { org_id, site_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const Organisation = require('../models/Organisation');
  //Storing req.body in update const.
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
})

//Note the ":" to declare params in the route.
router.put('/update/service/:org_id/:site_id/:service_id', (req, res) => {
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


router.post('/sendEmail', (req, res) => {
  console.log('req.body',': ', req.body);
  // console.log('process.env.DEFAULT_MAILER',': ', process.env.DEFAULT_MAILER);
  // console.log('process.env.DEFAULT_MAILER_PASSWORD',': ', process.env.DEFAULT_MAILER_PASSWORD);
  
  const {email, message} = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.DEFAULT_MAILER,
      pass: process.env.DEFAULT_MAILER_PASSWORD
    }
  })

  const emailBody = {
    from: process.env.DEFAULT_MAILER,
    to: email,
    subject: 'Update Notification',
    html: message
  }

  transporter.sendMail(emailBody)
  res.send(req.body)

})


router.post('/create/site/:org_id', (req, res) => {
  //Getting organisation and site _ids from req.params. 
  const { org_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const Organisation = require('../models/Organisation');
  //Storing req.body in update const.
  const update = req.body;

  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    //We are finding site with the help of mongoose method id(). This is handy when we have an array of objects in mongoose.  This methods takes a Mongoose ObjectId and returns the document.
    const site = update;
    organisation.sitesInOrganisation.push(site);
    organisation.save();
    
    res.send(organisation);
 
  })
})

router.delete('/delete/site/:org_id/:site_id', (req,res)=>{
  const { org_id, site_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const Organisation = require('../models/Organisation');
  Organisation.findById(new ObjectId(org_id), (err, organisation) => {
    if (err){
      return res.send(err)
    }
    const site = organisation.sitesInOrganisation.id(new ObjectId(site_id));
    // console.log('site',': ', site);
    site.remove();
    organisation.save();
    return res.send(organisation);
  })
})

module.exports = router;
