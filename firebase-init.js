const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBQu3Z-XfM3r9u0zUBbcbhI8LnDXsc7eDY",
  authDomain:        "ubugoe-cf43f.firebaseapp.com",
  projectId:         "ubugoe-cf43f",
  storageBucket:     "ubugoe-cf43f.firebasestorage.app",
  messagingSenderId: "816148103110",
  appId:             "1:816148103110:web:7f77f692f245c562c6bcc7",
};

firebase.initializeApp(FIREBASE_CONFIG);
const db         = firebase.firestore();
const FAMILY_DOC = db.collection('families').doc('default');
