// src/firebase.js

// 1. 从 SDK 中导入你需要的函数
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 导入 Firebase Authentication
import { getFirestore } from "firebase/firestore"; // 导入 Firestore 数据库
// import { getAnalytics } from "firebase/analytics"; // 如果你需要分析功能，也取消注释这一行

// 2. 你的 Web 应用的 Firebase 配置
// 重要：从环境变量读取配置，而不是硬编码
// 在 .env.local 文件中配置这些值
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// 验证必需的配置项
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Firebase 配置缺失！请在 .env.local 文件中配置以下环境变量：\n' +
    '- REACT_APP_FIREBASE_API_KEY\n' +
    '- REACT_APP_FIREBASE_AUTH_DOMAIN\n' +
    '- REACT_APP_FIREBASE_PROJECT_ID\n' +
    '- REACT_APP_FIREBASE_STORAGE_BUCKET\n' +
    '- REACT_APP_FIREBASE_MESSAGING_SENDER_ID\n' +
    '- REACT_APP_FIREBASE_APP_ID\n' +
    '- REACT_APP_FIREBASE_MEASUREMENT_ID'
  );
}

// 3. 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);

// 4. 初始化并导出你需要的 Firebase 服务实例
const auth = getAuth(app); // 获取 Authentication 服务实例
const db = getFirestore(app); // 获取 Firestore 服务实例
// const analytics = getAnalytics(app); // 如果你需要分析功能

// 5. 导出服务实例，以便在应用的其他部分使用
export { app, auth, db /*, analytics */ };