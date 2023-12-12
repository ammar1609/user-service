const bcrypt = require('bcrypt');
const httpStatus = require('http-status-codes').StatusCodes;
const { db, FieldValue } = require('../startup/firebase');

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userRef = db.collection(process.env.USERS_DOC).doc(req.user.id);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.warn('User not found');
    return res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
  }

  const userData = userDoc.data();

  if (userData.password != null) {
    const oldPasswordMatch = await bcrypt.compare(
      currentPassword,
      userData.password
    );

    if (!oldPasswordMatch) {
      console.warn('Invalid current password');
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: 'Invalid current password' });
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const now = FieldValue.serverTimestamp();

  await userRef.update({ password: hashedPassword, modified_at: now });

  res.status(httpStatus.OK).json({ message: 'Password changed successfully' });
};

module.exports = changePassword;
