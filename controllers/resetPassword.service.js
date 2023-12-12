const bcrypt = require('bcrypt');
const generator = require('generate-password');
const httpStatus = require('http-status-codes').StatusCodes;
const { db, FieldValue } = require('../startup/firebase');
const sendResetPasswordNotification = require('../helpers/notification');

const resetPassword = async (req, res) => {
  const { email } = req.body;

  const userRef = await db
    .collection(process.env.USERS_DOC)
    .where('email', '==', email)
    .limit(1)
    .get();

  if (userRef.empty) {
    console.warn('User not found');
    return res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
  }

  const userDoc = userRef.docs[0];
  const userData = userDoc.data();

  const temporaryPassword = generator.generate({
    length: 8,
    numbers: true,
  });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

  const now = FieldValue.serverTimestamp();

  await db.collection(process.env.USERS_DOC).doc(userDoc.id).update({
    password: null,
    temporary_password: hashedPassword,
    modified_at: now,
  });

  try {
    const response = await sendResetPasswordNotification(
      userData,
      temporaryPassword
    );
    return res.status(httpStatus.OK).json({
      message: response.message,
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

module.exports = resetPassword;
