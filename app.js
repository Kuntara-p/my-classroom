import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, setDoc, getDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
  measurementId: "G-T9MJ1T82NJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ตั้งค่าวันเวลาปัจจุบัน
const today = new Date();
const formattedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
document.getElementById('attendanceDate').value = formattedDate;

const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
document.getElementById('reportMonth').value = currentMonth;

// ผูกตัวแปรหน้าจอต่างๆ
const attendanceRoom = document.getElementById("attendanceRoom");
const attendanceDate = document.getElementById("attendanceDate");
const attendanceInputBody = document.getElementById("attendanceInputBody");
const attendanceCardTable = document.getElementById("attendanceCardTable");
const attendanceBlankState = document.getElementById("attendanceBlankState");

const btnCheckAll = document.getElementById("btnCheckAll");
const btnHolidayAll = document.getElementById("btnHolidayAll");
const holidayDot = document.getElementById("holidayDot");
const holidayBtnText = document.getElementById("holidayBtnText");
const btnNoClassAll = document.getElementById("btnNoClassAll");
const noClassDot = document.getElementById("noClassDot");
const noClassBtnText = document.getElementById("noClassBtnText");
const btnSaveAttendance = document.getElementById("btnSaveAttendance");

const reportRoom = document.getElementById("reportRoom");
const reportMonth = document.getElementById("reportMonth");
const matrixHeader = document.getElementById("matrixHeader");
const matrixBody = document.getElementById("matrixBody");
const reportContentArea = document.getElementById("reportContentArea");
const reportBlankState = document.getElementById("reportBlankState");
const btnShowPreview = document.getElementById("btnShowPreview");

const metaSchoolName = document.getElementById("metaSchoolName");
const metaSchoolLogoInput = document.getElementById("metaSchoolLogoInput");
const metaSchoolLogoPreview = document.getElementById("metaSchoolLogoPreview");
const metaSchoolLogoText = document.getElementById("metaSchoolLogoText");
let savedLogoBase64 = "";

const metaTeacher = document.getElementById("metaTeacher");
const metaAcademic = document.getElementById("metaAcademic");
const metaDirector = document.getElementById("metaDirector");
const metaSemester = document.getElementById("metaSemester");
const metaYear = document.getElementById("metaYear");
const btnSaveMeta = document.getElementById("btnSaveMeta");

const newRoomName = document.getElementById("newRoomName");
const btnAddRoom = document.getElementById("btnAddRoom");
const settingRoomTableBody = document.getElementById("settingRoomTableBody");

const studentTargetRoom = document.getElementById("studentTargetRoom");
const newStudentNumber = document.getElementById("newStudentNumber");
const newStudentName = document.getElementById("newStudentName");
const addStudentBtn = document.getElementById("addStudentBtn");

const importTargetRoom = document.getElementById("importTargetRoom");
const importFileSelector = document.getElementById("importFileSelector");
const btnImportFile = document.getElementById("btnImportFile");

const filterStudentRoom = document.getElementById("filterStudentRoom");
const searchStudentInput = document.getElementById("searchStudentInput");
const studentRegistryTableBody = document.getElementById("studentRegistryTableBody");

let allStudentsCache = [];
let isHolidayMode = false; 
let isNoClassMode = false; 
let printCacheData = []; 

attendanceRoom.addEventListener("change", loadAttendancePage);
attendanceDate.addEventListener("change", loadAttendancePage); 
reportRoom.addEventListener("change", renderAttendanceMatrix);
reportMonth.addEventListener("change", renderAttendanceMatrix);
searchStudentInput.addEventListener("input", filterStudentRegistryTable);
filterStudentRoom.addEventListener("change", filterStudentRegistryTable);

// ================= [ ระบบลบข้อมูล Modal ] =================
let itemToDelete = null; 
let deleteType = "";     
const customDeleteModal = document.getElementById("customDeleteModal");
const deleteModalText = document.getElementById("deleteModalText");
const btnConfirmDelete = document.getElementById("btnConfirmDelete");
const btnCancelDelete = document.getElementById("btnCancelDelete");

btnCancelDelete.addEventListener("click", () => { customDeleteModal.style.display = "none"; itemToDelete = null; });
btnConfirmDelete.addEventListener("click", async () => {
    customDeleteModal.style.display = "none"; 
    try {
        if (deleteType === "room" && itemToDelete) {
            await deleteDoc(doc(db, "rooms", itemToDelete.id));
            window.showToast(`🗑️ ลบห้องเรียน ${itemToDelete.name} เรียบร้อยแล้ว`);
            loadRoomsDropdownAndTable();
        } else if (deleteType === "student" && itemToDelete) {
            await deleteDoc(doc(db, "students", itemToDelete.id));
            window.showToast(`🗑️ ลบรายชื่อ ${itemToDelete.name} ออกจากระบบแล้ว`);
            loadRoomsDropdownAndTable(); 
        }
    } catch (e) {
        console.error(e);
        window.showToast("❌ เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
    itemToDelete = null;
});

// ================= [ ระบบตั้งค่าทั่วไป และ รูปโลโก้ ] =================
metaSchoolLogoInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 250;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                savedLogoBase64 = canvas.toDataURL("image/jpeg", 0.8);
                metaSchoolLogoPreview.src = savedLogoBase64;
                metaSchoolLogoPreview.style.display = "block";
                metaSchoolLogoText.style.display = "none";
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

btnSaveMeta.addEventListener("click", async () => {
    btnSaveMeta.textContent = "กำลังบันทึก...";
    try {
        await setDoc(doc(db, "metadata", "classroom_info"), {
            schoolName: metaSchoolName.value.trim(),
            schoolLogoBase64: savedLogoBase64,
            teacherName: metaTeacher.value.trim(),
            academicName: metaAcademic.value.trim(),
            directorName: metaDirector.value.trim(),
            semester: metaSemester.value,
            academicYear: metaYear.value.trim()
        });
        window.showToast("💾 บันทึกตั้งค่าโรงเรียนและวิชาทั่วไปสำเร็จ!");
    } catch(e) { console.error(e); } 
    finally { btnSaveMeta.textContent = "💾 บันทึกข้อมูลทั่วไป"; }
});

async function loadMetadata() {
    const docSnap = await getDoc(doc(db, "metadata", "classroom_info"));
    if (docSnap.exists()) {
        const data = docSnap.data();
        metaSchoolName.value = data.schoolName || "";
        metaTeacher.value = data.teacherName || "";
        metaAcademic.value = data.academicName || "";
        metaDirector.value = data.directorName || "";
        metaSemester.value = data.semester || "1";
        metaYear.value = data.academicYear || "";
        
        if (data.schoolLogoBase64) {
            savedLogoBase64 = data.schoolLogoBase64;
            metaSchoolLogoPreview.src = savedLogoBase64;
            metaSchoolLogoPreview.style.display = "block";
            metaSchoolLogoText.style.display = "none";
        }
    }
}

// ================= [ จัดการข้อมูลห้องเรียน และนับจำนวนนักเรียน ] =================
btnAddRoom.addEventListener("click", async () => {
    const room = newRoomName.value.trim();
    if(!room) { window.showToast("⚠️ กรุณากรอกชื่อห้องเรียนก่อนครับ"); return; }
    await addDoc(collection(db, "rooms"), { roomName: room });
    newRoomName.value = "";
    window.showToast("🏫 บันทึกห้องเรียนใหม่เข้าระบบสำเร็จ!");
    loadRoomsDropdownAndTable();
});

async function loadRoomsDropdownAndTable() {
    const querySnapshot = await getDocs(collection(db, "rooms"));
    
    document.querySelectorAll(".room-dropdown").forEach(dropdown => {
        if (dropdown.id === "filterStudentRoom") {
            dropdown.innerHTML = '<option value="">-- ทุกห้องเรียน --</option>';
        } else {
            dropdown.innerHTML = '<option value="">-- กรุณาเลือกห้องเรียน --</option>';
        }
        querySnapshot.forEach(doc => {
            const opt = document.createElement("option");
            opt.value = doc.data().roomName;
            opt.textContent = doc.data().roomName;
            dropdown.appendChild(opt.cloneNode(true));
        });
    });

    const studentSnap = await getDocs(collection(db, "students"));
    const roomStats = {};
    studentSnap.forEach(doc => {
        const s = doc.data();
        if (!roomStats[s.room]) roomStats[s.room] = { total: 0, boy: 0, girl: 0 };
        
        roomStats[s.room].total++;
        if (s.fullName.includes("ด.ช.") || s.fullName.includes("เด็กชาย")) {
            roomStats[s.room].boy++;
        } else if (s.fullName.includes("ด.ญ.") || s.fullName.includes("เด็กหญิง")) {
            roomStats[s.room].girl++;
        }
    });

    settingRoomTableBody.innerHTML = "";
    if(querySnapshot.empty) {
        settingRoomTableBody.innerHTML = "<tr><td colspan='5' style='color:var(--text-muted); text-align:center;'>ยังไม่มีห้องเรียนในระบบ</td></tr>";
    }
    
    querySnapshot.forEach(roomDoc => {
        const rName = roomDoc.data().roomName;
        const stats = roomStats[rName] || { total: 0, boy: 0, girl: 0 };
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight:500; color:var(--blue-pearl);">${rName}</td>
            <td style="text-align:center; font-weight:600; font-size:15px;">${stats.total}</td>
            <td style="text-align:center; color:var(--blue); font-weight:500;">${stats.boy}</td>
            <td style="text-align:center; color:var(--red); font-weight:500;">${stats.girl}</td>
            <td style="text-align:center;"><button class="btn btn-red" style="padding:4px 10px; font-size:12px;" onclick="deleteRoom('${roomDoc.id}', '${rName}')">🗑️ ลบห้อง</button></td>
        `;
        settingRoomTableBody.appendChild(tr);
    });

    loadAttendancePage();
    renderAttendanceMatrix();
    loadAllStudentsToRegistryTable(); 
}

window.deleteRoom = function(roomId, roomName) {
    itemToDelete = { id: roomId, name: roomName };
    deleteType = "room";
    deleteModalText.innerHTML = `คุณครูแน่ใจใช่ไหมครับที่จะลบห้องเรียน <b>"${roomName}"</b>?<br><span style="font-size:13px; color:var(--text-muted);">(การลบห้องจะไม่ลบรายชื่อนักเรียนที่ค้างอยู่ในระบบ)</span>`;
    customDeleteModal.style.display = "flex";
};

// ================= [ จัดการข้อมูลนักเรียน ] =================
addStudentBtn.addEventListener("click", async () => {
    // 🔥 ลบเครื่องหมายคำพูด (") ออกอัตโนมัติ ป้องกันระบบพัง 🔥
    let name = newStudentName.value.replace(/["']/g, '').trim(); 
    const num = parseInt(newStudentNumber.value);
    const room = studentTargetRoom.value;
    
    if(!name || !num || !room) { window.showToast("⚠️ กรุณากรอกข้อมูลนักเรียนให้ครบถ้วนและเลือกห้องเรียนก่อนครับ"); return; }
    try {
        await addDoc(collection(db, "students"), { fullName: name, studentNo: num, room: room });
        newStudentName.value = "";
        newStudentNumber.value = "";
        window.showToast(`👤 บันทึกนักเรียนเลขที่ ${num} เข้าห้อง ${room} สำเร็จ!`);
        loadRoomsDropdownAndTable();
    } catch (e) {
        console.error(e);
        window.showToast("❌ เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง");
    }
});

window.deleteStudent = function(studentId, studentName) {
    itemToDelete = { id: studentId, name: studentName };
    deleteType = "student";
    deleteModalText.innerHTML = `คุณครูต้องการลบรายชื่อ <b>"${studentName}"</b> ออกจากระบบใช่ไหมครับ?`;
    customDeleteModal.style.display = "flex";
};

btnImportFile.addEventListener("click", () => {
    const targetRoom = importTargetRoom.value;
    const file = importFileSelector.files[0];
    if(!targetRoom) { window.showToast("⚠️ กรุณาเลือกห้องเรียนปลายทางก่อนครับ"); return; }
    if(!file) { window.showToast("⚠️ กรุณาเลือกไฟล์ข้อความรายชื่อนักเรียนก่อนกดนำเข้าครับ"); return; }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);
        let importCount = 0;
        btnImportFile.textContent = "กำลังประมวลผลไฟล์...";
        btnImportFile.disabled = true;

        try {
            // 🔥 Firestore writeBatch รองรับสูงสุด 500 รายการต่อ 1 Batch 🔥
            let batch = writeBatch(db);
            let batchCount = 0;
            for (let line of lines) {
                if(!line.trim()) continue;
                const parts = line.split(",");
                let studentNo = importCount + 1;
                
                // 🔥 ป้องกันเครื่องหมายคำพูดจากไฟล์ CSV 🔥
                let fullName = line.trim().replace(/^"|"$/g, '').replace(/["']/g, ''); 
                
                if(parts.length >= 2) {
                    studentNo = parseInt(parts[0].replace(/["']/g, '').trim()) || (importCount + 1);
                    fullName = parts[1].replace(/^"|"$/g, '').replace(/["']/g, '').trim();
                }
                
                const studentDocRef = doc(collection(db, "students"));
                batch.set(studentDocRef, { fullName: fullName, studentNo: studentNo, room: targetRoom });
                importCount++;
                batchCount++;
                
                // ถ้าครบ 500 รายการ ให้ commit แล้วสร้าง batch ใหม่
                if (batchCount >= 500) {
                    await batch.commit();
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
            // commit ส่วนที่เหลือ
            if (batchCount > 0) {
                await batch.commit();
            }
            window.showToast(`📥 นำเข้ารายชื่อนักเรียนห้อง ${targetRoom} จำนวน ${importCount} คนเรียบร้อย!`);
        } catch (error) {
            console.error(error);
            window.showToast("❌ เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
        } finally {
            importFileSelector.value = ""; 
            btnImportFile.textContent = "📥 เริ่มนำเข้าข้อมูลไฟล์";
            btnImportFile.disabled = false;
            loadRoomsDropdownAndTable();
        }
    };
    reader.readAsText(file, "UTF-8");
});

async function loadAllStudentsToRegistryTable() {
    studentRegistryTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>กำลังโหลดข้อมูลทะเบียน...</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        allStudentsCache = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            allStudentsCache.push({ id: doc.id, fullName: data.fullName, studentNo: data.studentNo, room: data.room });
        });
        allStudentsCache.sort((a, b) => {
            if(a.room !== b.room) return a.room.localeCompare(b.room);
            return a.studentNo - b.studentNo;
        });
        filterStudentRegistryTable();
    } catch(e) { console.error(e); }
}

function renderStudentRegistry(studentsArray) {
    studentRegistryTableBody.innerHTML = "";
    if(studentsArray.length === 0) {
        studentRegistryTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:var(--text-muted);'>ไม่พบรายชื่อนักเรียนตามเงื่อนไขที่ค้นหา</td></tr>";
        return;
    }
    studentsArray.forEach(student => {
        // 🔥 แปลงสัญลักษณ์พิเศษให้ปลอดภัยก่อนยัดลงในปุ่มลบ 🔥
        const safeName = student.fullName.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color:var(--text-muted); font-weight:500;">ห้อง ${student.room}</td>
            <td style="font-weight:600; color:var(--gold-luxury);">${student.studentNo}</td>
            <td style="font-weight:500;">${student.fullName}</td>
            <td style="text-align:center;"><button class="btn btn-red" style="padding:4px 10px; font-size:12px;" onclick="deleteStudent('${student.id}', '${safeName}')">🗑️ ลบรายชื่อ</button></td>
        `;
        studentRegistryTableBody.appendChild(tr);
    });
}

function filterStudentRegistryTable() {
    const keyword = searchStudentInput.value.toLowerCase().trim();
    const selectedRoom = filterStudentRoom.value;
    
    let filtered = allStudentsCache;
    if(selectedRoom) {
        filtered = filtered.filter(s => s.room === selectedRoom);
    }
    if(keyword) {
        filtered = filtered.filter(s => 
            s.fullName.toLowerCase().includes(keyword) || s.room.toLowerCase().includes(keyword)
        );
    }
    renderStudentRegistry(filtered);
}

// ================= [ 4. แผงเช็คชื่อบันทึกการเข้าเรียน ] =================
function resetSpecialModesUI() {
    isHolidayMode = false; holidayDot.style.backgroundColor = "#d35400"; holidayBtnText.textContent = "วันหยุดพิเศษ"; btnHolidayAll.style.backgroundColor = "#ffeaa7"; btnHolidayAll.style.borderColor = "#fdcb6e"; btnHolidayAll.style.color = "#d35400";
    isNoClassMode = false; noClassDot.style.backgroundColor = "#64748b"; noClassBtnText.textContent = "ไม่มีคาบเรียน"; btnNoClassAll.style.backgroundColor = "#e2e8f0"; btnNoClassAll.style.borderColor = "#cbd5e1"; btnNoClassAll.style.color = "#475569";
}

async function loadAttendancePage() {
    const currentRoom = attendanceRoom.value;
    resetSpecialModesUI(); 

    if(!currentRoom || currentRoom === "") {
        attendanceCardTable.style.display = "none";
        attendanceBlankState.style.display = "block";
        return;
    }

    attendanceBlankState.style.display = "none";
    attendanceCardTable.style.display = "block";
    attendanceInputBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>กำลังดึงรายชื่อเด็กนักเรียน...</td></tr>";
    
    const selectedDate = new Date(attendanceDate.value);
    const dayOfWeek = selectedDate.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    const q = query(collection(db, "students"), where("room", "==", currentRoom), orderBy("studentNo", "asc"));
    const querySnapshot = await getDocs(q);
    attendanceInputBody.innerHTML = "";

    if (querySnapshot.empty) {
        attendanceInputBody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:var(--text-muted);'>ไม่พบรายชื่อในห้องเรียนนี้</td></tr>";
        return;
    }

    querySnapshot.forEach((doc) => {
        const student = doc.data();
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", doc.id);
        tr.setAttribute("data-name", student.fullName);
        
        let statusContent = '';
        if (isWeekend) {
            statusContent = `<div class="status-wrapper"><div class="special-status-box box-weekend">🌟 วันหยุด (เสาร์-อาทิตย์)</div><input type="hidden" name="status_${doc.id}" value="หยุด"></div>`;
        } else {
            statusContent = `
                <div class="status-wrapper">
                    <div class="radio-group">
                        <label class="radio-label"><input type="radio" name="status_${doc.id}" value="มา" checked><span>มา</span></label>
                        <label class="radio-label"><input type="radio" name="status_${doc.id}" value="ขาด"><span>ขาด</span></label>
                        <label class="radio-label"><input type="radio" name="status_${doc.id}" value="ลา"><span>ลา</span></label>
                        <label class="radio-label"><input type="radio" name="status_${doc.id}" value="ป่วย"><span>ป่วย</span></label>
                    </div>
                </div>
            `;
        }

        tr.innerHTML = `<td style="font-weight:600; color:var(--gold-luxury);">${student.studentNo}</td><td style="font-weight:500;">${student.fullName}</td><td class="status-cell">${statusContent}</td>`;
        attendanceInputBody.appendChild(tr);
    });
}

btnCheckAll.addEventListener("click", () => {
    if(isHolidayMode || isNoClassMode) { window.showToast("⚠️ ไม่สามารถกดเช็ค 'มาทุกคน' ในโหมดนี้ได้ครับ"); return; }
    document.querySelectorAll('#attendanceInputBody input[value="มา"]').forEach(radio => { radio.checked = true; });
});

btnHolidayAll.addEventListener("click", () => {
    if (isNoClassMode) resetSpecialModesUI(); 
    isHolidayMode = !isHolidayMode;
    if(isHolidayMode) { holidayDot.style.backgroundColor = "#fff"; holidayBtnText.textContent = "ยกเลิกวันหยุด"; btnHolidayAll.style.backgroundColor = "#e74c3c"; btnHolidayAll.style.borderColor = "#c0392b"; btnHolidayAll.style.color = "#fff";
    } else { resetSpecialModesUI(); }

    const isWeekend = (new Date(attendanceDate.value).getDay() === 0 || new Date(attendanceDate.value).getDay() === 6);
    document.querySelectorAll("#attendanceInputBody tr").forEach(row => {
        const id = row.getAttribute("data-id"); const statusCell = row.querySelector('.status-cell'); if(!statusCell) return;
        if (isHolidayMode) { 
            statusCell.innerHTML = `<div class="status-wrapper"><div class="special-status-box box-holiday">🌟 วันหยุดพิเศษ</div><input type="hidden" name="status_${id}" value="หยุด"></div>`;
        } else {
            if (isWeekend) {
                statusCell.innerHTML = `<div class="status-wrapper"><div class="special-status-box box-weekend">🌟 วันหยุด (เสาร์-อาทิตย์)</div><input type="hidden" name="status_${id}" value="หยุด"></div>`;
            } else {
                statusCell.innerHTML = `
                    <div class="status-wrapper">
                        <div class="radio-group">
                            <label class="radio-label"><input type="radio" name="status_${id}" value="มา" checked><span>มา</span></label>
                            <label class="radio-label"><input type="radio" name="status_${id}" value="ขาด"><span>ขาด</span></label>
                            <label class="radio-label"><input type="radio" name="status_${id}" value="ลา"><span>ลา</span></label>
                            <label class="radio-label"><input type="radio" name="status_${id}" value="ป่วย"><span>ป่วย</span></label>
                        </div>
                    </div>
                `;
            }
        }
    });
});

btnNoClassAll.addEventListener("click", () => {
    if (isHolidayMode) resetSpecialModesUI(); 
    isNoClassMode = !isNoClassMode;
    if(isNoClassMode) { noClassDot.style.backgroundColor = "#fff"; noClassBtnText.textContent = "ยกเลิกไม่มีคาบ"; btnNoClassAll.style.backgroundColor = "#64748b"; btnNoClassAll.style.borderColor = "#475569"; btnNoClassAll.style.color = "#fff";
    } else { resetSpecialModesUI(); }

    const isWeekend = (new Date(attendanceDate.value).getDay() === 0 || new Date(attendanceDate.value).getDay() === 6);
    document.querySelectorAll("#attendanceInputBody tr").forEach(row => {
        const id = row.getAttribute("data-id"); const statusCell = row.querySelector('.status-cell'); if(!statusCell) return;
        if (isNoClassMode) { 
            statusCell.innerHTML = `<div class="status-wrapper"><div class="special-status-box box-noclass">🚫 ไม่มีคาบเรียน</div><input type="hidden" name="status_${id}" value="ไม่มีคาบ"></div>`;
        } else {
            if (isWeekend) {
                statusCell.innerHTML = `<div class="status-wrapper"><div class="special-status-box box-weekend">🌟 วันหยุด (เสาร์-อาทิตย์)</div><input type="hidden" name="status_${id}" value="หยุด"></div>`;
            } else {
                statusCell.innerHTML = `
                    <div class="status-wrapper">
                        <div class="radio-group">
                            <label class="radio-label"><input type="radio" name="status_${id}" value="มา" checked><span>มา</span></label>
                            <label class="radio-label"><input type="radio" name="status_${id}" value="ขาด"><span>ขาด</span></label>
                            <label class="radio-label"><input type="radio" name="status_${id}" value="ลา"><span>ลา</span></label>
                            <label class="radio-label"><input type="radio" name="status_${id}" value="ป่วย"><span>ป่วย</span></label>
                        </div>
                    </div>
                `;
            }
        }
    });
});

btnSaveAttendance.addEventListener("click", async () => {
    const date = attendanceDate.value; 
    const currentRoom = attendanceRoom.value;
    const rows = document.querySelectorAll("#attendanceInputBody tr");
    
    if(!date) { window.showToast("⚠️ กรุณาเลือกวันที่ก่อนทำการเซฟครับ"); return; }
    if(rows.length === 0 || rows[0].getAttribute("data-id") === null) { window.showToast("⚠️ ไม่มีข้อมูลรายชื่อเพื่อใช้บันทึกครับ"); return; }

    btnSaveAttendance.textContent = "กำลังประมวลผลเซฟ...";
    btnSaveAttendance.disabled = true;

    try {
        const batch = writeBatch(db);
        for (let row of rows) {
            const id = row.getAttribute("data-id");
            const name = row.getAttribute("data-name");
            
            let statusInput = row.querySelector(`input[name="status_${id}"]:checked`);
            if(!statusInput) statusInput = row.querySelector(`input[type="hidden"][name="status_${id}"]`);
            const status = statusInput ? statusInput.value : "มา";

            const attendanceDocRef = doc(db, "attendance", `${id}_${date}`);
            batch.set(attendanceDocRef, { studentId: id, studentName: name, room: currentRoom, date: date, status: status, timestamp: new Date() });
        }
        await batch.commit();
        window.showToast(`💾 บันทึกข้อมูลห้อง ${currentRoom} เรียบร้อยสมบูรณ์!`);
        renderAttendanceMatrix(); 
    } catch (e) { 
        console.error(e); 
        window.showToast("❌ เกิดข้อผิดพลาดในการเซฟลงระบบคลาวด์"); 
    } finally { 
        btnSaveAttendance.textContent = "💾 บันทึกข้อมูลการเช็คชื่อ"; 
        btnSaveAttendance.disabled = false; 
    }
});

// ================= [ 5. ตารางประมวลผลรายงานสถิติ ] =================
async function renderAttendanceMatrix() {
    const selectedRoom = reportRoom.value;
    const selectedMonth = reportMonth.value; 
    
    if(!selectedRoom || selectedRoom === "") {
        reportContentArea.style.display = "none";
        btnShowPreview.style.display = "none";
        reportBlankState.style.display = "block";
        return;
    }

    reportBlankState.style.display = "none";
    reportContentArea.style.display = "block";
    btnShowPreview.style.display = "block";
    
    const year = parseInt(selectedMonth.split("-")[0]);
    const month = parseInt(selectedMonth.split("-")[1]); 
    const daysInMonth = new Date(year, month, 0).getDate();

    const dayClasses = ["bg-sun", "bg-mon", "bg-tue", "bg-wed", "bg-thu", "bg-fri", "bg-sat"];
    const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

    let headerHTML = `<th style="width: 200px; min-width: 200px;">ชื่อ-นามสกุล</th>`;
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d); 
        const dayIdx = dateObj.getDay();
        const dayName = dayNames[dayIdx];
        
        let thClass = "";
        if (dayIdx === 0) thClass = "bg-sun";
        if (dayIdx === 6) thClass = "bg-sat";

        headerHTML += `<th class="${thClass}" style="width: 35px; min-width: 35px; max-width: 35px; text-align:center; font-size:11px; padding:6px 0;">${d}<br><span style="font-size:9px; font-weight:400;">${dayName}</span></th>`;
    }
    
    headerHTML += `
        <th style="width: 45px; min-width: 45px; color:#2ecc71; text-align:center;">มา</th>
        <th style="width: 45px; min-width: 45px; color:#e74c3c; text-align:center;">ขาด</th>
        <th style="width: 45px; min-width: 45px; color:#f1c40f; text-align:center;">ลา</th>
        <th style="width: 45px; min-width: 45px; color:#3498db; text-align:center;">ป่วย</th>
    `;
    matrixHeader.innerHTML = headerHTML;

    matrixBody.innerHTML = "<tr><td colspan='45' style='text-align:center;'>กำลังรวบรวมสถิติ...</td></tr>";
    
    const studentsQuery = query(collection(db, "students"), where("room", "==", selectedRoom), orderBy("studentNo", "asc"));
    const studentsSnapshot = await getDocs(studentsQuery);
    
    const attendanceQuery = query(collection(db, "attendance"), where("room", "==", selectedRoom));
    const attendanceSnapshot = await getDocs(attendanceQuery);

    matrixBody.innerHTML = "";

    const attendanceMap = {};
    const allRecords = [];
    attendanceSnapshot.forEach(doc => { allRecords.push(doc.data()); });

    const getTime = (ts) => { if (!ts) return 0; if (ts.toMillis) return ts.toMillis(); return new Date(ts).getTime(); };
    allRecords.sort((a, b) => getTime(a.timestamp) - getTime(b.timestamp));
    allRecords.forEach(data => { attendanceMap[`${data.studentId}_${data.date}`] = data.status; });

    let grandTotalPresent = 0, grandTotalRecords = 0;
    let totalAbsent = 0, totalLeave = 0, totalSick = 0;
    
    let taughtDays = new Set();
    printCacheData = []; 

    if(studentsSnapshot.empty) {
        matrixBody.innerHTML = `<tr><td colspan="45" style="text-align:center; color:var(--text-muted);">ไม่พบข้อมูลรายงานของห้องเรียนนี้</td></tr>`;
        document.getElementById("stat-total-classes").textContent = "0 คาบ";
        document.getElementById("stat-avg").textContent = "0%"; document.getElementById("stat-absent").textContent = "0 ครั้ง";
        document.getElementById("stat-leave").textContent = "0 ครั้ง"; document.getElementById("stat-sick").textContent = "0 ครั้ง";
        return;
    }

    studentsSnapshot.forEach((studentDoc) => {
        const studentId = studentDoc.id;
        const student = studentDoc.data();
        
        let countPresent = 0, countAbsent = 0, countLeave = 0, countSick = 0;
        let studentRecord = { no: student.studentNo, name: student.fullName, days: [], counts: {} };
        
        let rowHTML = `<td style="font-weight:500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><span style="color:var(--gold-luxury); font-size:11px; margin-right:5px;">เลขที่ ${student.studentNo}</span> ${student.fullName}</td>`;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d); 
            const dayIdx = dateObj.getDay();
            const currentDayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const status = attendanceMap[`${studentId}_${currentDayStr}`];

            let cellClass = ""; let cellText = "-"; let textClass = "text-muted";

            if (dayIdx === 0) cellClass = "bg-sun";
            if (dayIdx === 6) cellClass = "bg-sat";

            if (status === "มา") { cellText = "✔"; textClass = "text-present"; countPresent++; grandTotalPresent++; grandTotalRecords++; taughtDays.add(currentDayStr); }
            else if (status === "ขาด") { cellText = "ข"; textClass = "text-absent"; countAbsent++; totalAbsent++; grandTotalRecords++; taughtDays.add(currentDayStr); }
            else if (status === "ลา") { cellText = "ล"; textClass = "text-leave"; countLeave++; totalLeave++; grandTotalRecords++; taughtDays.add(currentDayStr); }
            else if (status === "ป่วย") { cellText = "ป"; textClass = "text-sick"; countSick++; totalSick++; grandTotalRecords++; taughtDays.add(currentDayStr); }
            else if (status === "หยุด" || status === "ไม่มีคาบ") { cellText = "-"; textClass = "text-muted"; cellClass = dayClasses[dayIdx]; }

            let isInactive = false;
            if (dayIdx === 0 || dayIdx === 6 || status === "หยุด" || status === "ไม่มีคาบ") {
                isInactive = true;
            }

            studentRecord.days.push({ text: cellText, isInactive: isInactive });
            rowHTML += `<td class="${cellClass}" style="width: 35px; min-width: 35px; max-width: 35px; text-align:center; padding: 4px 0;"><span class="${textClass}" style="font-weight:600;">${cellText}</span></td>`;
        }

        const validDays = countPresent + countAbsent + countLeave + countSick;
        const p_percent = validDays > 0 ? ((countPresent / validDays) * 100).toFixed(1) + "%" : "0.0%";
        
        studentRecord.counts = { p: countPresent, a: countAbsent, l: countLeave, s: countSick, pct: p_percent };
        printCacheData.push(studentRecord);

        rowHTML += `
            <td style="text-align:center; color:var(--green); font-weight:600;">${countPresent}</td>
            <td style="text-align:center; color:var(--red); font-weight:600;">${countAbsent}</td>
            <td style="text-align:center; color:var(--yellow); font-weight:600;">${countLeave}</td>
            <td style="text-align:center; color:var(--blue); font-weight:600;">${countSick}</td>
        `;
        
        const tr = document.createElement("tr");
        tr.innerHTML = rowHTML;
        matrixBody.appendChild(tr);
    });

    document.getElementById("stat-total-classes").textContent = `${taughtDays.size} คาบ`;

    const avgPresent = grandTotalRecords > 0 ? Math.round((grandTotalPresent / grandTotalRecords) * 100) : 0;
    document.getElementById("stat-avg").textContent = `${avgPresent}%`;
    document.getElementById("stat-absent").textContent = `${totalAbsent} ครั้ง`;
    document.getElementById("stat-leave").textContent = `${totalLeave} ครั้ง`;
    document.getElementById("stat-sick").textContent = `${totalSick} ครั้ง`;
}

// ================= [ 6. ฟังก์ชันดูตัวอย่างและพิมพ์ (Print Layout) ] =================
btnShowPreview.addEventListener("click", () => {
    document.getElementById("printSchoolTitle").textContent = metaSchoolName.value || "โรงเรียนไม่ได้ระบุชื่อ";
    const logoImg = document.getElementById("printLogo");
    if(savedLogoBase64) {
        logoImg.src = savedLogoBase64;
        logoImg.style.display = "inline-block";
    } else {
        logoImg.style.display = "none";
    }
    
    const monthVal = reportMonth.value; 
    const y = parseInt(monthVal.split('-')[0]);
    const m = parseInt(monthVal.split('-')[1]);
    const thaiMonths = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    document.getElementById("printMonthYear").textContent = `${thaiMonths[m-1]} พ.ศ. ${y + 543}`;
    
    document.getElementById("printRoom").textContent = reportRoom.value.replace('ป.', ''); 
    document.getElementById("printAcademicYear").textContent = metaYear.value || "-";

    const daysInMonth = new Date(y, m, 0).getDate();
    let head1 = `<th rowspan="2" style="width:30px;">ที่</th><th rowspan="2" style="width:150px; text-align:left;">ชื่อ-สกุล</th><th colspan="${daysInMonth}">วันที่</th><th colspan="4">สรุป (วัน)</th><th rowspan="2" style="width:40px;">%</th>`;
    let head2 = '';
    
    for(let d=1; d<=daysInMonth; d++) { head2 += `<th>${d}</th>`; }
    head2 += `<th>มา</th><th>ขาด</th><th>ลา</th><th>ป่วย</th>`;
    
    document.getElementById("printTableHeader1").innerHTML = head1;
    document.getElementById("printTableHeader2").innerHTML = head2;

    const tBody = document.getElementById("printTableBody");
    tBody.innerHTML = '';

    printCacheData.forEach(s => {
        let rHTML = `<td>${s.no}</td><td style="text-align:left;">${s.name}</td>`;
        s.days.forEach(day => {
            const bgClass = day.isInactive ? 'print-bg-weekend' : '';
            rHTML += `<td class="${bgClass}">${day.text}</td>`;
        });
        rHTML += `<td>${s.counts.p}</td><td>${s.counts.a}</td><td>${s.counts.l}</td><td>${s.counts.s}</td><td>${s.counts.pct}</td>`;
        
        let tr = document.createElement("tr");
        tr.innerHTML = rHTML;
        tBody.appendChild(tr);
    });

    document.getElementById("printPreviewModal").style.display = "flex";
});

document.getElementById("btnClosePreview").addEventListener("click", () => {
    document.getElementById("printPreviewModal").style.display = "none";
});

document.getElementById("btnConfirmPrint").addEventListener("click", () => {
    window.print();
});

// เริ่มระบบ
loadRoomsDropdownAndTable();
loadMetadata();
loadAllStudentsToRegistryTable();