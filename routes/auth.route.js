const express = require('express');
const loginService = require('../controllers/login.service.js');
const authenticateTokenService = require('../controllers/authenticateToken.service.js');
const changePasswordService = require('../controllers/changePassword.service.js');
const resetPasswordService = require('../controllers/resetPassword.service.js');
const authentication = require('../middlewares/authentication.js');
const passport = require('../startup/google.js');
const httpStatus = require('http-status-codes').StatusCodes;

const router = express.Router();

router.post('/', loginService);
router.post('/token', authentication, authenticateTokenService);
router.post('/changePassword', authentication, changePasswordService);
router.post('/resetPassword', resetPasswordService);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google'),
  function (req, res) {
    res
      .status(httpStatus.OK)
      .header('x-auth-token', req.user.token)
      .json({ message: 'Login Successful!' });
  }
);

module.exports = router;
