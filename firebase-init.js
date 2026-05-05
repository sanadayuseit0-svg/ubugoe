const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBQu3Z-XfM3r9u0zUBbcbhI8LnDXsc7eDY",
  authDomain:        "ubugoe-cf43f.firebaseapp.com",
  projectId:         "ubugoe-cf43f",
  storageBucket:     "ubugoe-cf43f.firebasestorage.app",
  messagingSenderId: "816148103110",
  appId:             "1:816148103110:web:7f77f692f245c562c6bcc7",
};

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

// デバイスごとに固有IDを生成・保持（家族間共有はこのIDを共有することで実現）
let _deviceId = localStorage.getItem('ubugoe_device_id');
if (!_deviceId) {
  _deviceId = 'device-' + Math.random().toString(36).slice(2, 11);
  localStorage.setItem('ubugoe_device_id', _deviceId);
}
const FAMILY_DOC = db.collection('families').doc(_deviceId);
