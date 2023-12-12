const express = require('express');
const signUpService = require("../controllers/signUp.service.js");
const getMyUserService = require("../controllers/getMyUser.service.js");
const updateMyUserService = require("../controllers/updateMyUser.service.js");
const authentication = require('../middlewares/authentication.js');

const router = express.Router();

router.post('/', signUpService);
router.get('/', authentication, getMyUserService);
router.patch('/', authentication, updateMyUserService);

module.exports = router;