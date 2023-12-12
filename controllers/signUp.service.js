const bcrypt = require('bcrypt');
const httpStatus = require('http-status-codes').StatusCodes;
const { db, FieldValue } = require('../startup/firebase');
const { validateUser, generateAuthToken } = require('../models/user.model');
const reverseGeocodeWithOpenStreetMap = require('../helpers/location');

const registerUser = async (req, res) => {
  const { name, email, dob, latitude, longitude } = req.body;
  let { password } = req.body;

  const { error } = validateUser(req.body);

  if (error) {
    console.warn(`Invalid data format: ${error}`);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: `Invalid data format: ${error}` });
  }

  const response = await reverseGeocodeWithOpenStreetMap(latitude, longitude);

  if (
    response.error ||
    (response.address.city != process.env.ALLOWED_CITY &&
      response.address.country != process.env.ALLOWED_COUNTRY)
  ) {
    console.warn(`Users in Leipzig, Germany are allowed to register`);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: 'Users in Leipzig, Germany are allowed to register' });
  }

  const userRef = await db
    .collection(process.env.USERS_DOC)
    .where('email', '==', email)
    .get();

  if (!userRef.empty) {
    console.warn('User already registered');
    return res
      .status(httpStatus.CONFLICT)
      .json({ error: 'User already registered' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const now = FieldValue.serverTimestamp();

  const newUser = await db.collection(process.env.USERS_DOC).add({
    name,
    email,
    password: hashedPassword,
    temporary_password: null,
    dob,
    location: 'Leipzig, Germany',
    created_at: now,
    modified_at: now,
  });

  const token = generateAuthToken(newUser.id, newUser, '7d');

  const sanitizedUser = {
    id: newUser.id,
    name,
    email,
    dob,
    location: 'Leipzig, Germany',
  };

  res.status(httpStatus.CREATED).header('x-auth-token', token).json({
    message: 'User registered successfully',
    user: sanitizedUser,
  });
};

module.exports = registerUser;
