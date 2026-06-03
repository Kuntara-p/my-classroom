// 1. นำเข้าเครื่องมือที่จำเป็นจาก Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. ตั้งค่าการเชื่อมต่อ (เอาโค้ดจากหน้า Firebase ของคุณมาวางทับในเครื่องหมายปีกกานี้ทั้งหมด)
const firebaseConfig = {
  apiKey: "AIzaSyAENHpxjeI5cLqJXUyu9rU19C8WLupsO-A",
  authDomain: "myclassroom-app-18f9a.firebaseapp.com",
  projectId: "myclassroom-app-18f9a",
  storageBucket: "myclassroom-app-18f9a.firebasestorage.app",
  messagingSenderId: "248486677753",
  appId: "1:248486677753:web:a8a920b75aa76b78426628",
  measurementId: "G-T9MJ1T82NJ"
};

// 3. เริ่มต้นทำงานและเชื่อมต่อฐานข้อมูล
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ส่วนดึงข้อมูลจากหน้าเว็บ (DOM Elements) ---
const nameInput = document.getElementById("studentName");
const addBtn = document.getElementById("addStudentBtn");
const studentList = document.getElementById("studentList");
const loadReportBtn = document.getElementById("loadReportBtn");
const reportTableBody = document.getElementById("reportTableBody");

// --- 4. ฟังก์ชัน: เพิ่มรายชื่อนักเรียน ---
addBtn.addEventListener("click", async () => {
    const name = nameInput.value;
    if (name === "") {
        alert("กรุณากรอกชื่อนักเรียนก่อนครับ");
        return;
    }
    try {
        await addDoc(collection(db, "students"), { fullName: name });
        alert("บันทึกข้อมูลสำเร็จ!");
        nameInput.value = "";
        loadStudents(); // รีเฟรชรายชื่อ
    } catch (error) {
        console.error("เกิดข้อผิดพลาด: ", error);
    }
});

// --- 5. ฟังก์ชัน: โหลดรายชื่อและสร้างปุ่มจัดการ ---
async function loadStudents() {
    studentList.innerHTML = ""; 
    const querySnapshot = await getDocs(collection(db, "students"));
    
    querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        const studentId = doc.id;
        
        const li = document.createElement("li");
        li.style.marginBottom = "15px";
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";
        
        // ชื่อนักเรียน
        const nameSpan = document.createElement("span");
        nameSpan.textContent = studentData.fullName + " ";
        nameSpan.style.display = "inline-block";
        nameSpan.style.width = "200px";
        nameSpan.style.fontWeight = "bold";
        li.appendChild(nameSpan);

        // กลุ่มปุ่มเช็คชื่อ
        const statuses = ["มา", "ขาด", "ลา", "สาย"];
        statuses.forEach(status => {
            const btn = document.createElement("button");
            btn.textContent = status;
            btn.style.marginRight = "5px";
            btn.style.cursor = "pointer";
            btn.addEventListener("click", () => {
                saveAttendance(studentId, studentData.fullName, status);
            });
            li.appendChild(btn);
        });

        // เส้นคั่น
        const separator = document.createElement("span");
        separator.textContent = " | ";
        separator.style.margin = "0 10px";
        separator.style.color = "#ccc";
        li.appendChild(separator);

        // ช่องและปุ่มกรอกคะแนน
        const scoreInput = document.createElement("input");
        scoreInput.type = "number";
        scoreInput.placeholder = "คะแนน";
        scoreInput.style.width = "60px";
        scoreInput.style.marginRight = "5px";
        li.appendChild(scoreInput);

        const saveScoreBtn = document.createElement("button");
        saveScoreBtn.textContent = "บันทึกคะแนน";
        saveScoreBtn.style.cursor = "pointer";
        saveScoreBtn.addEventListener("click", () => {
            saveScore(studentId, studentData.fullName, scoreInput.value);
            scoreInput.value = ""; // ล้างช่องคะแนน
        });
        li.appendChild(saveScoreBtn);

        studentList.appendChild(li);
    });
}

// --- 6. ฟังก์ชัน: บันทึกการเช็คชื่อลง Firebase ---
async function saveAttendance(studentId, studentName, status) {
    const dateInput = document.getElementById("attendanceDate").value;
    if (dateInput === "") {
        alert("กรุณาเลือกวันที่ด้านบนก่อนทำการเช็คชื่อครับ");
        return;
    }
    try {
        await addDoc(collection(db, "attendance"), {
            studentId: studentId,
            studentName: studentName,
            date: dateInput,
            status: status,
            timestamp: new Date()
        });
        alert(`บันทึก ${studentName} สถานะ: ${status} เรียบร้อย!`);
    } catch (error) {
        console.error("ข้อผิดพลาดการเช็คชื่อ: ", error);
    }
}

// --- 7. ฟังก์ชัน: บันทึกคะแนนลง Firebase ---
async function saveScore(studentId, studentName, score) {
    const assignmentInput = document.getElementById("assignmentName").value;
    if (assignmentInput === "") {
        alert("กรุณากรอกชื่องานหรือการสอบด้านบนก่อนครับ");
        return;
    }
    if (score === "") {
        alert("กรุณากรอกคะแนนก่อนกดบันทึกครับ");
        return;
    }
    try {
        await addDoc(collection(db, "scores"), {
            studentId: studentId,
            studentName: studentName,
            assignmentName: assignmentInput,
            score: Number(score),
            timestamp: new Date()
        });
        alert(`บันทึกคะแนน "${assignmentInput}" ของ ${studentName} สำเร็จ!`);
    } catch (error) {
        console.error("ข้อผิดพลาดการบันทึกคะแนน: ", error);
    }
}

// --- 8. ฟังก์ชัน: โหลดรายงานสรุป (Dashboard) ---
loadReportBtn.addEventListener("click", async () => {
    reportTableBody.innerHTML = "<tr><td colspan='3'>กำลังประมวลผลข้อมูล...</td></tr>";
    try {
        const studentsSnap = await getDocs(collection(db, "students"));
        const attendanceSnap = await getDocs(collection(db, "attendance"));
        const scoresSnap = await getDocs(collection(db, "scores"));

        reportTableBody.innerHTML = ""; // ล้างข้อความโหลด

        studentsSnap.forEach(studentDoc => {
            const studentId = studentDoc.id;
            const studentName = studentDoc.data().fullName;

            // นับครั้งที่มาเรียน
            let presentCount = 0;
            attendanceSnap.forEach(attDoc => {
                const attData = attDoc.data();
                if (attData.studentId === studentId && attData.status === "มา") {
                    presentCount++;
                }
            });

            // รวมคะแนนทั้งหมด
            let totalScore = 0;
            scoresSnap.forEach(scoreDoc => {
                const scoreData = scoreDoc.data();
                if (scoreData.studentId === studentId) {
                    totalScore += scoreData.score;
                }
            });

            // สร้างแถวแสดงข้อมูลในตาราง
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="padding: 10px;">${studentName}</td>
                <td style="padding: 10px;">${presentCount}</td>
                <td style="padding: 10px;">${totalScore}</td>
            `;
            reportTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("ข้อผิดพลาดในการดึงรายงาน: ", error);
        reportTableBody.innerHTML = "<tr><td colspan='3'>โหลดข้อมูลไม่สำเร็จ</td></tr>";
    }
});

// --- สั่งให้โหลดรายชื่อนักเรียนทันทีที่เปิดหน้าเว็บ ---
loadStudents();