const httpStatus = require('http-status-codes').StatusCodes;
const { db } = require('../startup/firebase');

const getMyUser = async (req, res) => {
  const userDoc = await db
    .collection(process.env.USERS_DOC)
    .doc(req.user.id)
    .get();

  if (!userDoc.exists) {
    console.warn('User not found');
    return res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
  }

  const paymentMethodDoc = await db
    .collection(process.env.PAYMENT_METHODS_DOC)
    .where('userId', '==', req.user.id)
    .get();

  let isPaymentMethodPresent = false;

  if (!paymentMethodDoc.empty) {
    isPaymentMethodPresent = true;
  }

  const userData = userDoc.data();
  const sanitizedUser = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    dob: userData.dob,
    location: userData.location,
    isPaymentMethodPresent,
  };

  res.status(httpStatus.OK).json(sanitizedUser);
};

module.exports = getMyUser;
