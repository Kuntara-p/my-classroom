import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
      import {
        getFirestore,
        collection,
        addDoc,
        getDocs,
        query,
        where,
        orderBy,
        doc,
        deleteDoc,
        setDoc,
        getDoc,
        writeBatch,
        updateDoc,
      } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// =========================================================================
      // ⚠️ 1. วาง Firebase Config เฉพาะของคุณครูในกรอบนี้ (ห้ามลบปีกกาเปิด-ปิด)
      // =========================================================================
      const firebaseConfig = {
        apiKey: "AIzaSyAENHpxjeI5cLqJXUyu9rU19C8WLupsO-A",
        authDomain: "myclassroom-app-18f9a.firebaseapp.com",
        projectId: "myclassroom-app-18f9a",
        storageBucket: "myclassroom-app-18f9a.firebasestorage.app",
        messagingSenderId: "248486677753",
        appId: "1:248486677753:web:a8a920b75aa76b78426628",
        measurementId: "G-T9MJ1T82NJ",
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

export { app, db };
