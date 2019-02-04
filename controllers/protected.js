// EXPRESS ROUTER: Protected pages redirected from auth.js middleware
const router = require('express').Router();
const jwtDecode = require('jwt-decode');
const nodemailer = require('nodemailer');
require('dotenv').load();
const Organisation = require('../models/Organisation')
const User = require('../models/User')

router.get('/test', (req, res) => {
  return res.send("protected route working")
})

// MIDDLEWARE: isAuthenticated function checks if Google OAuth token exists, if so calls next otherwise it sends an error message.
const isAuthenticated = (req, res, next) => {
  //token can be passed in req.session or req.headers. 
  if (req.session.token || req.headers.token) {
    next();
  } else {
    res.send("Sorry you need to sign in");
  }
}

//PASSPORT: Using isAuthenticated in all the end points of our router. To access any end point the token has to exists. 
router.use(isAuthenticated);

//Profile info from User.
router.get('/profile', (req, res) => {
  const { user } = req.session.passport;
  res.send(user.profile);
});

//Organisations data endpoint.
router.get('/organisations', (req, res) => {
  Organisation.find()
    .then(docs => {
      res.send(docs)
    })
})

//Users data endpoint.
router.get('/users', (req, res) => {
  User.find()
    .then(docs => {
      res.send(docs)
    })
})

//Dashboard for AskIzzy Plus User.
router.get('/dashboard', (req, res) => {
    const { user } = req.session.passport
    const { givenName } = user.profile.name;
    res.send(`Welcome ${givenName}`);
})

//Dashboard for AskIzzy Plus Admin.
router.get('/admin/dashboard', (req, res) => {
    const { user } = req.session.passport
    const { givenName } = user.profile.name;
    res.send(`You are logged in as ${givenName} from Infoxchange`);
})

//ASKIZZY PLUS USER END POINTS:
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

//ORGANISATION
//Update
router.put('/organisation/:_id', (req, res) => {
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


// SITE
//Create Site
router.post('/site/:org_id', (req, res) => {
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

// Update Site:
router.put('/site/:org_id/:site_id', (req, res) => {
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

//Delete Site
router.delete('/site/:org_id/:site_id', (req,res)=>{
  const { org_id, site_id } = req.params;
  const ObjectId = require('mongoose').Types.ObjectId;
  const Organisation = require('../models/Organisation');
  Organisation.find({ _id: org_id })
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

//SERVICE
//Create 
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

// Update 
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

// Delete
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
