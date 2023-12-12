var admin = require("firebase-admin");
const { Filter, FieldValue } = require('firebase-admin/firestore');

var serviceAccount = require("./share-7b17f-firebase-adminsdk-vh7sw-9738641bea.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db, Filter, FieldValue };