// 1. นำเข้าเครื่องมือที่จำเป็นจาก Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. นำ Firebase Config ของคุณครูมาวางแทนที่ในกรอบนี้ได้เลยครับ
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

// --- ส่วนดึงข้อมูลจากหน้าเว็บ ---
const nameInput = document.getElementById("studentName");
const addBtn = document.getElementById("addStudentBtn");
const studentListBody = document.getElementById("studentListBody");
const loadReportBtn = document.getElementById("loadReportBtn");
const reportTableBody = document.getElementById("reportTableBody");

// --- 4. ฟังก์ชัน: เพิ่มรายชื่อนักเรียน ---
addBtn.addEventListener("click", async () => {
    const name = nameInput.value;
    if (name.trim() === "") {
        alert("กรุณากรอกชื่อนักเรียนก่อนครับ");
        return;
    }
    try {
        await addDoc(collection(db, "students"), { fullName: name });
        nameInput.value = "";
        loadStudents(); 
    } catch (error) {
        console.error("เกิดข้อผิดพลาด: ", error);
    }
});

// --- 5. ฟังก์ชัน: โหลดรายชื่อและสร้างปุ่มจัดการในตาราง ---
async function loadStudents() {
    studentListBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>กำลังโหลดรายชื่อ...</td></tr>"; 
    
    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        studentListBody.innerHTML = ""; // ล้างข้อความโหลด
        
        querySnapshot.forEach((doc) => {
            const studentData = doc.data();
            const studentId = doc.id;
            
            const tr = document.createElement("tr");

            // คอลัมน์ที่ 1: ชื่อ
            const tdName = document.createElement("td");
            tdName.style.fontWeight = "500";
            tdName.textContent = studentData.fullName;
            tr.appendChild(tdName);

            // คอลัมน์ที่ 2: ปุ่มเช็คชื่อ 4 สถานะ
            const tdAttendance = document.createElement("td");
            const statuses = [
                { text: "มา", color: "#2ecc71", textC: "#fff" }, 
                { text: "ขาด", color: "#e74c3c", textC: "#fff" }, 
                { text: "ลา", color: "#f1c40f", textC: "#000" }, 
                { text: "สาย", color: "#e67e22", textC: "#fff" }
            ];
            
            statuses.forEach(status => {
                const btn = document.createElement("button");
                btn.className = "status-btn";
                btn.textContent = status.text;
                btn.addEventListener("click", (e) => {
                    // ทำให้ปุ่มที่ถูกกดเปลี่ยนสีให้เห็นชัดเจน
                    e.target.style.backgroundColor = status.color;
                    e.target.style.color = status.textC;
                    saveAttendance(studentId, studentData.fullName, status.text);
                });
                tdAttendance.appendChild(btn);
            });
            tr.appendChild(tdAttendance);

            // คอลัมน์ที่ 3: ช่องกรอกคะแนน
            const tdScore = document.createElement("td");
            tdScore.style.display = "flex";
            tdScore.style.gap = "5px";
            
            const scoreInput = document.createElement("input");
            scoreInput.type = "number";
            scoreInput.placeholder = "คะแนน";
            scoreInput.className = "score-input";
            
            const saveScoreBtn = document.createElement("button");
            saveScoreBtn.textContent = "บันทึก";
            saveScoreBtn.className = "status-btn btn-score";
            
            saveScoreBtn.addEventListener("click", () => {
                saveScore(studentId, studentData.fullName, scoreInput.value);
                scoreInput.value = ""; // ล้างช่องหลังบันทึก
            });
            
            tdScore.appendChild(scoreInput);
            tdScore.appendChild(saveScoreBtn);
            tr.appendChild(tdScore);

            studentListBody.appendChild(tr);
        });
    } catch (error) {
        console.error("โหลดรายชื่อไม่สำเร็จ: ", error);
        studentListBody.innerHTML = "<tr><td colspan='3'>ไม่สามารถดึงข้อมูลได้</td></tr>";
    }
}

// --- 6. ฟังก์ชัน: บันทึกการเช็คชื่อ ---
async function saveAttendance(studentId, studentName, status) {
    const dateInput = document.getElementById("attendanceDate").value;
    if (dateInput === "") {
        alert("กรุณาเลือก 'วันที่เช็คชื่อ' ด้านบนก่อนครับ");
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
    } catch (error) {
        console.error("ข้อผิดพลาดการเช็คชื่อ: ", error);
    }
}

// --- 7. ฟังก์ชัน: บันทึกคะแนน ---
async function saveScore(studentId, studentName, score) {
    const assignmentInput = document.getElementById("assignmentName").value;
    if (assignmentInput.trim() === "") {
        alert("กรุณากรอก 'ชื่องาน/การสอบ' ด้านบนก่อนครับ");
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
        alert(`บันทึกคะแนน ${score} ให้ ${studentName} เรียบร้อย!`);
    } catch (error) {
        console.error("ข้อผิดพลาดการบันทึกคะแนน: ", error);
    }
}

// --- 8. ฟังก์ชัน: โหลดรายงานสรุป (Dashboard) ---
loadReportBtn.addEventListener("click", async () => {
    reportTableBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>กำลังประมวลผลข้อมูล...</td></tr>";
    try {
        const studentsSnap = await getDocs(collection(db, "students"));
        const attendanceSnap = await getDocs(collection(db, "attendance"));
        const scoresSnap = await getDocs(collection(db, "scores"));

        reportTableBody.innerHTML = ""; 

        studentsSnap.forEach(studentDoc => {
            const studentId = studentDoc.id;
            const studentName = studentDoc.data().fullName;

            // นับครั้งที่ "มา"
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

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${studentName}</td>
                <td style="text-align: center; color: var(--primary); font-weight: 500;">${presentCount}</td>
                <td style="text-align: center; color: var(--success); font-weight: 500;">${totalScore}</td>
            `;
            reportTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("ข้อผิดพลาดในการดึงรายงาน: ", error);
        reportTableBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>โหลดข้อมูลไม่สำเร็จ</td></tr>";
    }
});

// --- โหลดรายชื่อนักเรียนเมื่อเปิดหน้าเว็บ ---
loadStudents();
