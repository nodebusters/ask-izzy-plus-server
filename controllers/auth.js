const passport = require('passport');
const router = require('express').Router();

// PASSPORT/COOKIE-PARSER: Checks if token exists and displays corresopnding messages. 
router.get('/token', (req, res) => {
  console.log('req.session.token',': ', req.session.token);
  if (req.session.token) {
    res.cookie('token', req.session.token);
    res.json({
      status: 'session cookie set'
    });
  } else {
    res.cookie('token', '')
    res.json({
      status: 'session cookie not set'
    });
  }
});

router.get('/logout/message', (req,res) => {
  return res.send("logout successful")
});

// PASSPORT/COOKIE-SESSION: To terminate cookie-session and redirect to logout message, fn can be called from any route handler
router.get('/logout', (req, res) => {
  req.logout();        
  req.session = null;
  res.redirect('/auth/logout/message');
});

// PASSPORT: To login using Google oAuth 2.0 strategy from Passport
router.get('/login', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/userinfo.profile']
}));

// PASSPORT: Error handling if Google oAuth login attempt unsuccessful
router.get('/login/error', (req,res) => {
  return res.send("Something went wrong with Google Oauth.")
});

// PASSPORT: Callback routing if login is successful or unsuccessful
router.get('/login/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login/error'
  }),
  (req, res) => {
    console.log(req.user.token);
    req.session.token = req.user.token;
    res.redirect('/protected/dashboard');
  }
);

module.exports = router;