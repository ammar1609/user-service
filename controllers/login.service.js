const bcrypt = require('bcrypt');
const httpStatus = require('http-status-codes').StatusCodes;
const { db, Filter, FieldValue } = require('../startup/firebase');
const { generateAuthToken } = require('../models/user.model');
const Auth = require('../models/auth.model');

const login = async (req, res) => {
  const { email, password } = req.body;
  const { error } = Auth.validateAuth(req.body);

  let validPassword;
  let token;

  if (error) {
    console.warn(`Invalid data format: ${error}`);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: `Invalid data format: ${error}` });
  }

  const userRef = await db
    .collection(process.env.USERS_DOC)
    .where('email', '==', email)
    .limit(1)
    .get();

  if (userRef.empty) {
    console.warn('Invalid email or password');
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ error: 'Invalid email or password' });
  }

  const userDoc = userRef.docs[0];
  const userData = userDoc.data();

  if (userData.temporary_password) {
    validPassword = await bcrypt.compare(password, userData.temporary_password);

    if (!validPassword) {
      console.warn('Invalid email or password');
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid email or password' });
    }

    const now = FieldValue.serverTimestamp();

    await db
      .collection(process.env.USERS_DOC)
      .doc(userDoc.id)
      .update({ temporary_password: null, modified_at: now });

    token = generateAuthToken(userDoc.id, userData, '6h');

    return res.status(httpStatus.OK).header('x-auth-token', token).json({
      message:
        'Login Successful! Please note this is a one time password which will expire shortly. Kindly change your password at the earliest',
    });
  }

  validPassword = await bcrypt.compare(password, userData.password);

  if (!validPassword) {
    console.warn('Invalid email or password');
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ error: 'Invalid email or password' });
  }

  token = generateAuthToken(userDoc.id, userData, '7d');

  res
    .status(httpStatus.OK)
    .header('x-auth-token', token)
    .json({ message: 'Login Successful!' });
};

module.exports = login;
