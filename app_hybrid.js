// ================= [ Mobile Menu ] =================
(function() {
    // Mobile menu
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var sidebar = document.getElementById('sidebarElement');
    var backdrop = document.getElementById('sidebarBackdrop');
    function openMenu() {
      if (sidebar) sidebar.classList.add('show');
      if (backdrop) backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      if (sidebar) sidebar.classList.remove('show');
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    document.querySelectorAll('.menu-item, .sub-menu-item').forEach(function(item) {
      item.addEventListener('click', function() {
        if (window.innerWidth <= 768) closeMenu();
      });
    });

    // Desktop sidebar toggle is handled later in the file
})();
// ================= [ END Mobile Menu ] =================


      

      

      // ตั้งค่าวันเวลาปัจจุบัน
      const today = new Date();
      const formattedDate =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");
      if (document.getElementById("attendanceDate")) {
        document.getElementById("attendanceDate").value = formattedDate;
      }
      const reportMonthSelect = document.getElementById("reportMonthSelect");

      // ผูกตัวแปรหน้าจอต่างๆ
      const attendanceRoom = document.getElementById("attendanceRoom");
      const attendanceDate = document.getElementById("attendanceDate");
      const attendanceSemester = document.getElementById("attendanceSemester");
      const attendanceInputBody = document.getElementById(
        "attendanceInputBody",
      );
      const attendanceCardTable = document.getElementById(
        "attendanceCardTable",
      );
      const attendanceBlankState = document.getElementById(
        "attendanceBlankState",
      );

      const btnCheckAll = document.getElementById("btnCheckAll");
      const btnSaveAttendance = document.getElementById("btnSaveAttendance");

      const reportRoom = document.getElementById("reportRoom");
      // reportMonth was replaced by selects
      const matrixHeader = document.getElementById("matrixHeader");
      const matrixBody = document.getElementById("matrixBody");
      const reportContentArea = document.getElementById("reportContentArea");
      const reportBlankState = document.getElementById("reportBlankState");
      const btnShowPreview = document.getElementById("btnShowPreview");

      const metaSchoolName = document.getElementById("metaSchoolName");
      const metaSchoolLogoInput = document.getElementById(
        "metaSchoolLogoInput",
      );
      const metaSchoolLogoPreview = document.getElementById(
        "metaSchoolLogoPreview",
      );
      const metaSchoolLogoText = document.getElementById("metaSchoolLogoText");
      let savedLogoBase64 = "";

      // Helper Functions for Dynamic Database Collections
      function getCurrentYear() {
        return (window.classroomMeta && window.classroomMeta.academicYear) ? window.classroomMeta.academicYear.trim() : "default";
      }
      function getRoomsCollection() { 
        let y = getCurrentYear();
        return y === "2569" ? collection(db, "rooms") : collection(db, "rooms_" + y); 
      }
      function getStudentsCollection() { 
        let y = getCurrentYear();
        return y === "2569" ? collection(db, "students") : collection(db, "students_" + y); 
      }
      function getAttendanceCollection() { 
        let y = getCurrentYear();
        return y === "2569" ? collection(db, "attendance") : collection(db, "attendance_" + y); 
      }
      const metaTeacher = document.getElementById("metaTeacher");

      const metaAcademic = document.getElementById("metaAcademic");
      const metaDirector = document.getElementById("metaDirector");
      const metaSemester = document.getElementById("metaSemester");
      const metaYear = document.getElementById("metaYear");
      const metaTerm1Start = document.getElementById("metaTerm1Start");
      const metaTerm1End = document.getElementById("metaTerm1End");
      const metaTerm2Start = document.getElementById("metaTerm2Start");
      const metaTerm2End = document.getElementById("metaTerm2End");
      const btnSaveMeta = document.getElementById("btnSaveMeta");

      const newRoomName = document.getElementById("newRoomName");
      const btnAddRoom = document.getElementById("btnAddRoom");
      const settingRoomTableBody = document.getElementById(
        "settingRoomTableBody",
      );

      const studentTargetRoom = document.getElementById("studentTargetRoom");
      const newStudentNumber = document.getElementById("newStudentNumber");
      const newStudentName = document.getElementById("newStudentName");
      const addStudentBtn = document.getElementById("addStudentBtn");

      const importTargetRoom = document.getElementById("importTargetRoom");
      const importFileSelector = document.getElementById("importFileSelector");
      const btnImportFile = document.getElementById("btnImportFile");

      const filterStudentRoom = document.getElementById("filterStudentRoom");
      const searchStudentInput = document.getElementById("searchStudentInput");
      const studentRegistryTableBody = document.getElementById(
        "studentRegistryTableBody",
      );

      let allStudentsCache = [];
      let printCacheData = [];



      attendanceRoom.addEventListener("change", loadAttendancePage);
      attendanceDate.addEventListener("change", loadAttendancePage);
      reportRoom.addEventListener("change", renderAttendanceMatrix);
      reportMonthSelect.addEventListener("change", renderAttendanceMatrix);
      searchStudentInput.addEventListener("input", filterStudentRegistryTable);
      filterStudentRoom.addEventListener("change", filterStudentRegistryTable);

      // ================= [ ระบบลบข้อมูล Modal ] =================
      let itemToDelete = null;
      let deleteType = "";
      const customDeleteModal = document.getElementById("customDeleteModal");
      const deleteModalText = document.getElementById("deleteModalText");
      const btnConfirmDelete = document.getElementById("btnConfirmDelete");
      const btnCancelDelete = document.getElementById("btnCancelDelete");
      
      const editStudentModal = document.getElementById("editStudentModal");
      const editStudentNo = document.getElementById("editStudentNo");
      const editStudentName = document.getElementById("editStudentName");
      const editStudentRoom = document.getElementById("editStudentRoom");
      const btnCancelEditStudent = document.getElementById("btnCancelEditStudent");
      const btnConfirmEditStudent = document.getElementById("btnConfirmEditStudent");
      let currentEditStudentId = null;

      btnCancelDelete.addEventListener("click", () => {
        customDeleteModal.style.display = "none";
        itemToDelete = null;
      });
      btnConfirmDelete.addEventListener("click", async () => {
        customDeleteModal.style.display = "none";
        try {
          if (deleteType === "room" && itemToDelete) {
            // Delete room
            await deleteDoc(doc(db, "rooms", itemToDelete.id));
            
            // Delete all students in this room
            const qStudents = query(getStudentsCollection(), where("room", "==", itemToDelete.name));
            const snapshotStudents = await getDocs(qStudents);
            const delPromises = [];
            snapshotStudents.forEach((sDoc) => {
              delPromises.push(deleteDoc(sDoc.ref));
            });
            await Promise.all(delPromises);

            window.showToast(`🗑️ ลบห้องเรียน ${itemToDelete.name} และนักเรียนทั้งหมดเรียบร้อยแล้ว`);
            
            // Instantly remove students from memory cache to prevent UI jerk
            if(typeof allStudentsCache !== 'undefined') {
                allStudentsCache = allStudentsCache.filter(s => s.room !== itemToDelete.name);
            }
            if(typeof window.currentStudentsList !== 'undefined') {
                window.currentStudentsList = window.currentStudentsList.filter(s => s.room !== itemToDelete.name);
            }
            if (window.currentClass === itemToDelete.name) {
                window.currentClass = "";
                if(document.getElementById("dashboardRoomSelect")) document.getElementById("dashboardRoomSelect").value = "";
                if(document.getElementById("dashboardStudentsTableBody")) document.getElementById("dashboardStudentsTableBody").innerHTML = "";
            }

            // Refresh room table smoothly
            loadRoomsDropdownAndTable();
            
            // Re-render student registry smoothly without re-fetching everything
            if(typeof filterStudentRegistryTable === "function") {
                filterStudentRegistryTable();
            }
          } else if (deleteType === "student" && itemToDelete) {
            await deleteDoc(doc(db, "students", itemToDelete.id));
            window.showToast(
              `🗑️ ลบรายชื่อ ${itemToDelete.name} ออกจากระบบแล้ว`,
            );
            loadRoomsDropdownAndTable();
          }
        } catch (e) {
          console.error(e);
          window.showToast(
            "❌ เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง",
          );
        }
        itemToDelete = null;
      });

      // ================= [ ระบบตั้งค่าทั่วไป และ รูปโลโก้ ] =================
      metaSchoolLogoInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
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
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      function applyAttendanceCalendarLimits() {
        if (typeof attendanceFp === "undefined" || !attendanceFp || !window.classroomMeta) return;
        let inst = Array.isArray(attendanceFp) ? attendanceFp[0] : attendanceFp;
        if (!inst) return;
        
        const sem = document.getElementById("attendanceSemester").value;
        let tStart = sem === "1" ? window.classroomMeta.term1Start : window.classroomMeta.term2Start;
        let tEnd = sem === "1" ? window.classroomMeta.term1End : window.classroomMeta.term2End;
        
        function normalize(d) {
          if (!d) return "";
          let p = d.split("-");
          if (p.length === 3 && parseInt(p[0]) > 2500) {
            p[0] = (parseInt(p[0]) - 543).toString();
            return p.join("-");
          }
          return d;
        }
        
        let minStr = tStart ? normalize(tStart) : null;
        let maxStr = tEnd ? normalize(tEnd) : null;

        // Auto-fix inverted dates (e.g. user forgot to change the year for Term 2 End)
        if (minStr && maxStr) {
           let d1 = new Date(minStr);
           let d2 = new Date(maxStr);
           if (d1 > d2) {
              d2.setFullYear(d2.getFullYear() + 1);
              let y = d2.getFullYear();
              let m = String(d2.getMonth() + 1).padStart(2, '0');
              let d = String(d2.getDate()).padStart(2, '0');
              maxStr = `${y}-${m}-${d}`;
           }
        }
        
        inst.set("minDate", minStr);
        inst.set("maxDate", maxStr);
      }

      btnSaveMeta.addEventListener("click", async () => {
        btnSaveMeta.textContent = "กำลังบันทึก...";
        try {
          const newAcademicYear = metaYear.value.trim() || "default";
          const currentAcademicYear = getCurrentYear();
          
          await setDoc(doc(db, "metadata", "classroom_info"), {
            schoolName: metaSchoolName.value.trim(),
            schoolLogoBase64: savedLogoBase64,
            teacherName: metaTeacher.value.trim(),
            academicName: metaAcademic.value.trim(),
            directorName: metaDirector.value.trim(),
            semester: metaSemester.value,
            academicYear: metaYear.value.trim(),
            term1Start: metaTerm1Start.value,
            term1End: metaTerm1End.value,
            term2Start: metaTerm2Start.value,
            term2End: metaTerm2End.value,
            holidays: window.classroomMeta?.holidays || [],
            noClassSchedules: window.classroomMeta?.noClassSchedules || [],
            makeupDays: window.classroomMeta?.makeupDays || []
          });

          window.classroomMeta = {
            schoolName: metaSchoolName.value.trim(),
            schoolLogoBase64: savedLogoBase64,
            teacherName: metaTeacher.value.trim(),
            academicName: metaAcademic.value.trim(),
            directorName: metaDirector.value.trim(),
            semester: metaSemester.value,
            academicYear: metaYear.value.trim(),
            term1Start: metaTerm1Start.value,
            term1End: metaTerm1End.value,
            term2Start: metaTerm2Start.value,
            term2End: metaTerm2End.value,
            holidays: window.classroomMeta?.holidays || [],
            noClassSchedules: window.classroomMeta?.noClassSchedules || [],
            makeupDays: window.classroomMeta?.makeupDays || []
          };

          window.showToast("💾 บันทึกตั้งค่าโรงเรียนและวิชาทั่วไปสำเร็จ!");
          applyAttendanceCalendarLimits();
          
          // Re-load metadata to trigger the auto-detect semester logic immediately
          await loadMetadata();

          if (currentAcademicYear !== "default" && currentAcademicYear !== newAcademicYear) {
             window.showToast("🔁 มีการเปลี่ยนปีการศึกษา ระบบกำลังโหลดกระดานใหม่...");
             setTimeout(() => window.location.reload(), 1500);
          }
        } catch (e) {
          console.error(e);
        } finally {
          btnSaveMeta.textContent = "💾 บันทึกข้อมูลทั้งหมด";
        }
      });

      function populateReportMonthDropdown() {
        const select = document.getElementById("reportMonthSelect");
        if(!select) return;
        select.innerHTML = "";
        
        const thaiMonths = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
        let monthSet = new Set();
        let optionsHtml = "";
        
        function addMonths(startStr, endStr) {
          if(!startStr || !endStr) return;
          function normalize(d) {
            let p = d.split("-");
            if (p.length === 3 && parseInt(p[0]) > 2500) {
              p[0] = (parseInt(p[0]) - 543).toString();
              return p.join("-");
            }
            return d;
          }
          let d1 = new Date(normalize(startStr));
          let d2 = new Date(normalize(endStr));
          if(isNaN(d1) || isNaN(d2)) return;
          if(d1 > d2) d2.setFullYear(d2.getFullYear() + 1);
          
          let current = new Date(d1.getFullYear(), d1.getMonth(), 1);
          let endLimit = new Date(d2.getFullYear(), d2.getMonth(), 1);
          
          while(current <= endLimit) {
            let y = current.getFullYear();
            let m = String(current.getMonth() + 1).padStart(2, "0");
            let key = `${y}-${m}`;
            if(!monthSet.has(key)) {
              monthSet.add(key);
              let thYear = y + 543;
              let thMonth = thaiMonths[current.getMonth()];
              let isCurrent = (y === new Date().getFullYear() && current.getMonth() === new Date().getMonth());
              optionsHtml += `<option value="${key}" ${isCurrent ? "selected" : ""}>${thMonth} ${thYear}</option>`;
            }
            current.setMonth(current.getMonth() + 1);
          }
        }
        
        if (window.classroomMeta) {
          addMonths(window.classroomMeta.term1Start, window.classroomMeta.term1End);
          addMonths(window.classroomMeta.term2Start, window.classroomMeta.term2End);
        }
        
        if(monthSet.size === 0) {
           const today = new Date();
           let y = today.getFullYear();
           let m = String(today.getMonth() + 1).padStart(2, "0");
           let thYear = y + 543;
           let thMonth = thaiMonths[today.getMonth()];
           optionsHtml = `<option value="${y}-${m}">${thMonth} ${thYear}</option>`;
        }
        
        select.innerHTML = optionsHtml;
      }

      async function loadMetadata() {
        const docSnap = await getDoc(doc(db, "metadata", "classroom_info"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          metaSchoolName.value = data.schoolName || "";
          metaTeacher.value = data.teacherName || "";
          metaAcademic.value = data.academicName || "";
          metaDirector.value = data.directorName || "";
          const t1s = data.term1Start || data.termStart || "";
          if (metaTerm1Start._flatpickr) metaTerm1Start._flatpickr.setDate(t1s); else metaTerm1Start.value = t1s;

          const t1e = data.term1End || data.termEnd || "";
          if (metaTerm1End._flatpickr) metaTerm1End._flatpickr.setDate(t1e); else metaTerm1End.value = t1e;

          const t2s = data.term2Start || "";
          if (metaTerm2Start._flatpickr) metaTerm2Start._flatpickr.setDate(t2s); else metaTerm2Start.value = t2s;

          const t2e = data.term2End || "";
          if (metaTerm2End._flatpickr) metaTerm2End._flatpickr.setDate(t2e); else metaTerm2End.value = t2e;

          // Auto-detect semester (Sticky Logic)
          const today = new Date();
          let yy = today.getFullYear();
          let mm = String(today.getMonth() + 1).padStart(2, '0');
          let dd = String(today.getDate()).padStart(2, '0');
          let todayStr = `${yy}-${mm}-${dd}`;

          function normalize(dStr) {
             if (!dStr) return "";
             let p = dStr.split("-");
             if (p.length === 3 && parseInt(p[0]) > 2500) {
               p[0] = (parseInt(p[0]) - 543).toString();
               return p.join("-");
             }
             return dStr;
          }

          let nT2s = normalize(t2s);

          let detectedSem = "1";
          if (nT2s !== "" && todayStr >= nT2s) {
             detectedSem = "2";
          }

          metaSemester.value = detectedSem;
          metaYear.value = data.academicYear || "";
          window.classroomMeta = {
            ...data,
            term1Start: metaTerm1Start.value,
            term1End: metaTerm1End.value,
            term2Start: metaTerm2Start.value,
            term2End: metaTerm2End.value,
            holidays: data.holidays || [],
            noClassSchedules: data.noClassSchedules || [],
            makeupDays: data.makeupDays || []
          };
          renderHolidaysList();
          renderNoClassList();
          renderMakeupDaysList();

          if (data.schoolLogoBase64) {
            savedLogoBase64 = data.schoolLogoBase64;
            metaSchoolLogoPreview.src = savedLogoBase64;
            metaSchoolLogoPreview.style.display = "block";
            metaSchoolLogoText.style.display = "none";
          }
          applyAttendanceCalendarLimits();
          populateReportMonthDropdown();
        } else {
          populateReportMonthDropdown();
        }
      }

      // ================= [ จัดการข้อมูลห้องเรียน และนับจำนวนนักเรียน ] =================
      btnAddRoom.addEventListener("click", async () => {
        const room = newRoomName.value.trim();
        if (!room) {
          window.showToast("⚠️ กรุณากรอกชื่อห้องเรียนก่อนครับ");
          return;
        }
        await addDoc(getRoomsCollection(), { roomName: room });
        newRoomName.value = "";
        window.showToast("🏫 บันทึกห้องเรียนใหม่เข้าระบบสำเร็จ!");
        loadRoomsDropdownAndTable();
      });

      
      // Auto-cleanup orphaned students (runs 3 seconds after load to ensure Firebase is ready)
      setTimeout(async () => {
          try {
              const roomsSnap = await getDocs(getRoomsCollection());
              const validRooms = new Set();
              roomsSnap.forEach(doc => validRooms.add(doc.data().roomName));
              
              const studentsSnap = await getDocs(getStudentsCollection());
              const delPromises = [];
              let cleanedRooms = new Set();
              studentsSnap.forEach(sDoc => {
                  if(!validRooms.has(sDoc.data().room)) {
                      delPromises.push(deleteDoc(sDoc.ref));
                      cleanedRooms.add(sDoc.data().room);
                  }
              });
              if(delPromises.length > 0) {
                  await Promise.all(delPromises);
                  console.log(`Cleaned up ${delPromises.length} orphaned students from rooms: ${Array.from(cleanedRooms).join(', ')}`);
                  if(typeof loadAllStudentsToRegistryTable === "function") loadAllStudentsToRegistryTable();
                  if(typeof loadRoomsDropdownAndTable === "function") loadRoomsDropdownAndTable();
                  window.showToast(`🧹 ล้างข้อมูลนักเรียนที่ตกค้างจากห้องที่ถูกลบไปแล้ว (${delPromises.length} รายการ)`);
              }
          } catch(e) {
              console.error("Cleanup failed", e);
          }
      }, 3000);
async function loadRoomsDropdownAndTable() {
        const querySnapshot = await getDocs(getRoomsCollection());
        let sortedRooms = [];
        querySnapshot.forEach((doc) => {
            sortedRooms.push({ id: doc.id, ...doc.data() });
        });
        
        sortedRooms.sort((a, b) => {
            const getParts = (str) => {
                const match = str.match(/([^\d]*)(\d+)(?:\/(\d+))?/);
                if(match) {
                    return { prefix: match[1] || "", grade: parseInt(match[2]) || 0, room: parseInt(match[3]) || 0 };
                }
                return { prefix: str, grade: 0, room: 0 };
            };
            const pA = getParts(a.roomName);
            const pB = getParts(b.roomName);
            
            if(pA.prefix !== pB.prefix) return pB.prefix.localeCompare(pA.prefix, 'th');
            if(pA.grade !== pB.grade) return pB.grade - pA.grade;
            return pA.room - pB.room;
        });

        document.querySelectorAll(".room-dropdown").forEach((dropdown) => {
          if (dropdown.id === "filterStudentRoom") {
            dropdown.innerHTML = '<option value="">-- ทุกห้องเรียน --</option>';
          } else {
            dropdown.innerHTML =
              '<option value="">-- กรุณาเลือกห้องเรียน --</option>';
          }
          sortedRooms.forEach((r) => {
            const opt = document.createElement("option");
            opt.value = r.roomName;
            opt.textContent = r.roomName;
            dropdown.appendChild(opt.cloneNode(true));
          });
        });

        if (typeof renderGradeEntryRoomTabs === "function") renderGradeEntryRoomTabs();
        if (typeof renderEvaluationRoomTabs === "function") renderEvaluationRoomTabs();
        if (typeof renderFolderTabs === "function") renderFolderTabs();

        const studentSnap = await getDocs(getStudentsCollection());
        const roomStats = {};
        studentSnap.forEach((doc) => {
          const s = doc.data();
          if (!roomStats[s.room])
            roomStats[s.room] = { total: 0, boy: 0, girl: 0 };

          roomStats[s.room].total++;
          if (s.fullName.includes("ด.ช.") || s.fullName.includes("เด็กชาย")) {
            roomStats[s.room].boy++;
          } else if (
            s.fullName.includes("ด.ญ.") ||
            s.fullName.includes("เด็กหญิง")
          ) {
            roomStats[s.room].girl++;
          }
        });

        settingRoomTableBody.innerHTML = "";
        if (querySnapshot.empty) {
          settingRoomTableBody.innerHTML =
            "<tr><td colspan='5' style='color:var(--text-muted); text-align:center;'>ยังไม่มีห้องเรียนในระบบ</td></tr>";
        }

        sortedRooms.forEach((r) => {
          const rName = r.roomName;
          const stats = roomStats[rName] || { total: 0, boy: 0, girl: 0 };

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="font-weight:500; color:var(--blue-pearl);">${rName}</td>
            <td style="text-align:center; font-weight:600; font-size:15px;">${stats.total}</td>
            <td style="text-align:center; color:var(--blue); font-weight:500;">${stats.boy}</td>
            <td style="text-align:center; color:var(--red); font-weight:500;">${stats.girl}</td>
            <td style="text-align:center; white-space: nowrap;">
              <button class="btn btn-primary" style="width:36px; height:36px; padding:0; margin-right:8px; font-size:16px; background:linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border:none; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.2); display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; cursor:pointer;" onclick="editRoomName('${r.id}', '${rName}')" title="แก้ไขชื่อห้อง">✏️</button>
              <button class="btn btn-red" style="width:36px; height:36px; padding:0; font-size:16px; color: #ffffff; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.2); display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; cursor:pointer;" onclick="deleteRoom('${r.id}', '${rName}')" title="ลบห้อง">🗑️</button>
            </td>
        `;
          settingRoomTableBody.appendChild(tr);
        });

        loadAttendancePage();
        renderAttendanceMatrix();
        loadAllStudentsToRegistryTable();
      }




      

      window.deleteRoom = function (roomId, roomName) {
        itemToDelete = { id: roomId, name: roomName };
        deleteType = "room";
        deleteModalText.innerHTML = `คุณครูแน่ใจใช่ไหมครับที่จะลบห้องเรียน <b>"${roomName}"</b>?<br><span style="font-size:13px; color:var(--red-pastel);">(⚠️ คำเตือน: ข้อมูลนักเรียนทั้งหมดในห้องนี้จะถูกลบไปด้วย)</span>`;
        customDeleteModal.style.display = "flex";
      };

      
      let currentEditRoomId = null;
      let currentEditOldName = null;

      const customEditModal = document.getElementById("customEditModal");
      const editRoomNameInput = document.getElementById("editRoomNameInput");
      const btnCancelEdit = document.getElementById("btnCancelEdit");
      const btnConfirmEdit = document.getElementById("btnConfirmEdit");
      const editModalText = document.getElementById("editModalText");

      window.editRoomName = function(roomId, oldRoomName) {
          currentEditRoomId = roomId;
          currentEditOldName = oldRoomName;
          if (editModalText) editModalText.innerHTML = `กรุณาระบุชื่อห้องเรียนใหม่ (เดิม: <b>${oldRoomName}</b>):`;
          if (editRoomNameInput) {
              editRoomNameInput.value = oldRoomName;
              setTimeout(() => editRoomNameInput.focus(), 100);
          }
          if (customEditModal) customEditModal.style.display = "flex";
      };

      if (btnCancelEdit) {
          btnCancelEdit.addEventListener("click", () => {
              customEditModal.style.display = "none";
          });
      }

      if (btnConfirmEdit) {
          btnConfirmEdit.addEventListener("click", async () => {
              const newRoomName = editRoomNameInput.value.trim();
              if (!newRoomName || newRoomName === currentEditOldName) {
                  customEditModal.style.display = "none";
                  return;
              }

              customEditModal.style.display = "none";
              const trimmedName = newRoomName;
              
              const roomsSnap = await getDocs(getRoomsCollection());
              let isDuplicate = false;
              roomsSnap.forEach(docSnap => {
                  if (docSnap.data().roomName === trimmedName) isDuplicate = true;
              });
              
              if (isDuplicate) {
                  window.showToast("⚠️ ชื่อห้องเรียนนี้มีอยู่ในระบบแล้วครับ", "error");
                  return;
              }

              window.showToast("🔄 กำลังอัปเดตข้อมูลทั้งหมด กรุณารอสักครู่...", "info");

              try {
                  await updateDoc(doc(getRoomsCollection(), currentEditRoomId), { roomName: trimmedName });

                  const updateCollectionRoom = async (colRef) => {
                      const q = query(colRef, where("room", "==", currentEditOldName));
                      const snap = await getDocs(q);
                      let batch = writeBatch(db);
                      let count = 0;
                      for(let d of snap.docs) {
                          batch.update(d.ref, { room: trimmedName });
                          count++;
                          if(count === 490) { await batch.commit(); batch = writeBatch(db); count = 0; }
                      }
                      if(count > 0) await batch.commit();
                  };

                  await updateCollectionRoom(getStudentsCollection());
                  await updateCollectionRoom(getAttendanceCollection());
                  await updateCollectionRoom(collection(db, "grade_scores"));
                  await updateCollectionRoom(collection(db, "evaluations"));
                  await updateCollectionRoom(collection(db, "subjects"));

                  const oldStructId = currentEditOldName.replace(/\//g, "_");
                  const newStructId = trimmedName.replace(/\//g, "_");
                  const oldStructRef = doc(db, "grade_structure", oldStructId);
                  const oldStructSnap = await getDoc(oldStructRef);
                  if(oldStructSnap.exists()) {
                      const newStructRef = doc(db, "grade_structure", newStructId);
                      await setDoc(newStructRef, oldStructSnap.data());
                      await deleteDoc(oldStructRef);
                  }

                  window.showToast(`✅ แก้ไขชื่อห้องเป็น ${trimmedName} สำเร็จ!`);
                  loadRoomsDropdownAndTable();
              } catch (error) {
                  console.error("Error renaming room:", error);
                  window.showToast("❌ เกิดข้อผิดพลาดในการแก้ไขชื่อห้อง", "error");
              }
          });
      }

      // ================= [ จัดการข้อมูลนักเรียน ] =================
      addStudentBtn.addEventListener("click", async () => {
        // 🔥 ลบเครื่องหมายคำพูด (") ออกอัตโนมัติ ป้องกันระบบพัง 🔥
        let name = newStudentName.value.replace(/["']/g, "").trim();
        const num = parseInt(newStudentNumber.value);
        const room = studentTargetRoom.value;

        if (!name || !num || !room) {
          window.showToast(
            "⚠️ กรุณากรอกข้อมูลนักเรียนให้ครบถ้วนและเลือกห้องเรียนก่อนครับ",
          );
          return;
        }

        const isDuplicate = allStudentsCache.some(s => s.room === room && s.studentNo === num);
        if (isDuplicate) {
          window.showToast(`❌ เลขที่ ${num} ในห้อง ${room} มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง`);
          return;
        }

        try {
          await addDoc(getStudentsCollection(), {
            fullName: name,
            studentNo: num,
            room: room,
          });
          newStudentName.value = "";
          newStudentNumber.value = "";
          window.showToast(
            `👤 บันทึกนักเรียนเลขที่ ${num} เข้าห้อง ${room} สำเร็จ!`,
          );
          loadRoomsDropdownAndTable();
        } catch (e) {
          console.error(e);
          window.showToast("❌ เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง");
        }
      });

      window.deleteStudent = function (studentId, studentName) {
        itemToDelete = { id: studentId, name: studentName };
        deleteType = "student";
        deleteModalText.innerHTML = `คุณครูต้องการลบรายชื่อ <b>"${studentName}"</b> ออกจากระบบใช่ไหมครับ?`;
        customDeleteModal.style.display = "flex";
      };

      window.editStudent = function (id, num, name, room) {
        currentEditStudentId = id;
        editStudentNo.value = num;
        editStudentName.value = name;
        editStudentRoom.value = room;
        editStudentModal.style.display = "flex";
      };

      btnCancelEditStudent.addEventListener("click", () => {
        editStudentModal.style.display = "none";
        currentEditStudentId = null;
      });

      btnConfirmEditStudent.addEventListener("click", async () => {
        const num = parseInt(editStudentNo.value);
        const name = editStudentName.value.replace(/["']/g, "").trim();
        const room = editStudentRoom.value;

        if (!name || !num || !room) {
          window.showToast("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
          return;
        }

        const isDuplicate = allStudentsCache.some(
          (s) => s.room === room && parseInt(s.studentNo) === num && s.id !== currentEditStudentId
        );
        if (isDuplicate) {
          window.showToast(`❌ เลขที่ ${num} ในห้อง ${room} มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง`);
          return;
        }

        try {
          await updateDoc(doc(db, "students", currentEditStudentId), {
            studentNo: num,
            fullName: name,
            room: room,
          });
          window.showToast("✅ บันทึกการแก้ไขข้อมูลนักเรียนเรียบร้อยแล้ว");
          editStudentModal.style.display = "none";
          loadAllStudentsToRegistryTable();
        } catch (e) {
          console.error(e);
          window.showToast("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
      });

      btnImportFile.addEventListener("click", () => {
        const targetRoom = importTargetRoom.value;
        const file = importFileSelector.files[0];
        if (!targetRoom) {
          window.showToast("⚠️ กรุณาเลือกห้องเรียนปลายทางก่อนครับ");
          return;
        }
        if (!file) {
          window.showToast(
            "⚠️ กรุณาเลือกไฟล์ข้อความรายชื่อนักเรียนก่อนกดนำเข้าครับ",
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
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
              if (!line.trim()) continue;
              const parts = line.split(",");
              let studentNo = importCount + 1;

              // 🔥 ป้องกันเครื่องหมายคำพูดจากไฟล์ CSV 🔥
              let fullName = line
                .trim()
                .replace(/^"|"$/g, "")
                .replace(/["']/g, "");

              if (parts.length >= 2) {
                studentNo =
                  parseInt(parts[0].replace(/["']/g, "").trim()) ||
                  importCount + 1;
                fullName = parts[1]
                  .replace(/^"|"$/g, "")
                  .replace(/["']/g, "")
                  .trim();
              }

              const studentDocRef = doc(getStudentsCollection());
              batch.set(studentDocRef, {
                fullName: fullName,
                studentNo: studentNo,
                room: targetRoom,
              });
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
            window.showToast(
              `📥 นำเข้ารายชื่อนักเรียนห้อง ${targetRoom} จำนวน ${importCount} คนเรียบร้อย!`,
            );
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
        studentRegistryTableBody.innerHTML =
          "<tr><td colspan='4' style='text-align:center;'>กำลังโหลดข้อมูลทะเบียน...</td></tr>";
        try {
          const querySnapshot = await getDocs(getStudentsCollection());
          allStudentsCache = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            allStudentsCache.push({
              id: doc.id,
              fullName: data.fullName,
              studentNo: data.studentNo,
              room: data.room,
            });
          });
          allStudentsCache.sort((a, b) => {
            if (a.room !== b.room) return a.room.localeCompare(b.room);
            return a.studentNo - b.studentNo;
          });
          filterStudentRegistryTable();
        } catch (e) {
          console.error(e);
        }
      }

      function renderStudentRegistry(studentsArray) {
        studentRegistryTableBody.innerHTML = "";
        if (studentsArray.length === 0) {
          studentRegistryTableBody.innerHTML =
            "<tr><td colspan='4' style='text-align:center; color:var(--text-muted);'>ไม่พบรายชื่อนักเรียนตามเงื่อนไขที่ค้นหา</td></tr>";
          return;
        }
        studentsArray.forEach((student) => {
          // 🔥 แปลงสัญลักษณ์พิเศษให้ปลอดภัยก่อนยัดลงในปุ่มลบ 🔥
          const safeName = student.fullName
            .replace(/'/g, "\\'")
            .replace(/"/g, "&quot;");

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="color:var(--text-muted); font-weight:500;">ห้อง ${student.room}</td>
            <td style="font-weight:600; color:var(--gold-luxury);">${student.studentNo}</td>
            <td style="font-weight:500;">${student.fullName}</td>
            <td style="text-align:center;">
              <button class="btn btn-gold" style="padding:4px 10px; font-size:12px; margin-right:5px; background:var(--blue-pearl); border-color:var(--blue-pearl); color:#fff;" onclick="editStudent('${student.id}', ${student.studentNo}, '${safeName}', '${student.room}')">✏️ แก้ไข</button>
              <button class="btn btn-red" style="padding:4px 10px; font-size:12px;" onclick="deleteStudent('${student.id}', '${safeName}')">🗑️ ลบ</button>
            </td>
        `;
          studentRegistryTableBody.appendChild(tr);
        });
      }

      function filterStudentRegistryTable() {
        const keyword = searchStudentInput.value.toLowerCase().trim();
        const selectedRoom = filterStudentRoom.value;

        let filtered = allStudentsCache;
        if (selectedRoom) {
          filtered = filtered.filter((s) => s.room === selectedRoom);
        }
        if (keyword) {
          filtered = filtered.filter(
            (s) =>
              s.fullName.toLowerCase().includes(keyword) ||
              s.room.toLowerCase().includes(keyword),
          );
        }
        renderStudentRegistry(filtered);
      }

      // ================= [ 4. แผงเช็คชื่อบันทึกการเข้าเรียน ] =================

      function getSemesterOfDate(dObj) {
         if(!window.classroomMeta) return "all";
         function parseD(dStr) {
            if(!dStr) return null;
            let p = dStr.split("-");
            if(p.length===3) {
               let yr = parseInt(p[0]);
               if(yr > 2500) yr -= 543;
               return new Date(yr, parseInt(p[1])-1, parseInt(p[2]));
            }
            return null;
         }
         let t1s = parseD(window.classroomMeta.term1Start);
         let t1e = parseD(window.classroomMeta.term1End);
         let t2s = parseD(window.classroomMeta.term2Start);
         let t2e = parseD(window.classroomMeta.term2End);
         
         if(t1s && t1e && t1s > t1e) t1e.setFullYear(t1e.getFullYear()+1);
         if(t2s && t2e && t2s > t2e) t2e.setFullYear(t2e.getFullYear()+1);
         
         if (t1s && t1e && dObj >= t1s && dObj <= t1e) return "1";
         if (t2s && t2e && dObj >= t2s && dObj <= t2e) return "2";
         
         return document.getElementById("metaSemester")?.value || "all";
      }

      async function loadAttendancePage() {
        const currentRoom = attendanceRoom.value;

        if (!currentRoom || currentRoom === "") {
          attendanceCardTable.style.display = "none";
          attendanceBlankState.style.display = "block";
          return;
        }

        attendanceBlankState.style.display = "none";
        attendanceCardTable.style.display = "block";
        attendanceInputBody.innerHTML =
          "<tr><td colspan='3' style='text-align:center;'>กำลังดึงรายชื่อเด็กนักเรียน...</td></tr>";

        const dateStr = attendanceDate.value;
        const selectedDate = new Date(dateStr);
        let dayOfWeek = selectedDate.getDay();
        let isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const makeupDays = window.classroomMeta?.makeupDays || [];
        const makeupConfig = makeupDays.find(m => m.date === dateStr);
        if (makeupConfig) {
            dayOfWeek = parseInt(makeupConfig.substituteDayOfWeek);
            isWeekend = false;
        }

        const q = query(
          getStudentsCollection(),
          where("room", "==", currentRoom),
          orderBy("studentNo", "asc"),
        );
        const querySnapshot = await getDocs(q);

        const attQ = query(
          getAttendanceCollection(),
          where("room", "==", currentRoom),
          where("date", "==", attendanceDate.value)
        );
        const attSnap = await getDocs(attQ);
        
        const holidays = window.classroomMeta?.holidays || [];
        const configuredHoliday = holidays.find(h => h.date === attendanceDate.value);
        
        const noClassSchedules = window.classroomMeta?.noClassSchedules || [];
        const curSem = getSemesterOfDate(selectedDate);
        const configuredNoClass = noClassSchedules.find(s => currentRoom.startsWith(s.room) && parseInt(s.dayOfWeek) === dayOfWeek && (s.semester === "all" || !s.semester || s.semester === curSem));

        let hasSavedData = !attSnap.empty;
        const badge = document.getElementById("attendanceStatusBadge");
        if (configuredHoliday) {
            badge.style.display = "inline-flex";
            badge.style.backgroundColor = "rgba(231, 76, 60, 0.15)";
            badge.style.color = "var(--red)";
            badge.style.border = "1px solid var(--red)";
            badge.innerHTML = "🌟 ล็อกตามระบบ (วันหยุด)";
        } else if (configuredNoClass) {
            badge.style.display = "inline-flex";
            badge.style.backgroundColor = "rgba(100, 116, 139, 0.15)";
            badge.style.color = "var(--text-muted)";
            badge.style.border = "1px solid var(--text-muted)";
            badge.innerHTML = "🚫 ล็อกตามระบบ (ไม่มีคาบ)";
        } else if (isWeekend) {
            badge.style.display = "inline-flex";
            badge.style.backgroundColor = "rgba(100, 116, 139, 0.15)";
            badge.style.color = "var(--text-muted)";
            badge.style.border = "1px solid var(--text-muted)";
            badge.innerHTML = "💤 วันหยุดสุดสัปดาห์";
        } else if (hasSavedData) {
            badge.style.display = "inline-flex";
            badge.style.backgroundColor = "rgba(46, 204, 113, 0.15)";
            badge.style.color = "var(--green)";
            badge.style.border = "1px solid var(--green)";
            badge.innerHTML = "✅ บันทึกข้อมูลแล้ว";
        } else {
            badge.style.display = "inline-flex";
            badge.style.backgroundColor = "rgba(241, 196, 15, 0.15)";
            badge.style.color = "var(--gold-luxury)";
            badge.style.border = "1px solid var(--gold-luxury)";
            badge.innerHTML = "⏳ ยังไม่ได้บันทึกข้อมูล";
        }

        const savedStatusMap = {};
        attSnap.forEach(d => {
          savedStatusMap[d.data().studentId] = d.data().status;
        });

        attendanceInputBody.innerHTML = "";

        if (querySnapshot.empty) {
          attendanceInputBody.innerHTML =
            "<tr><td colspan='3' style='text-align:center; color:var(--text-muted);'>ไม่พบรายชื่อในห้องเรียนนี้</td></tr>";
          return;
        }

        querySnapshot.forEach((doc) => {
          const student = doc.data();
          const tr = document.createElement("tr");
          tr.setAttribute("data-id", doc.id);
          tr.setAttribute("data-name", student.fullName);

          let statusContent = "";
          const savedStatus = savedStatusMap[doc.id];

          if (configuredHoliday) {
             statusContent = `<div class="status-wrapper"><div class="special-status-box box-holiday" style="background: rgba(231, 76, 60, 0.1); color: var(--red); border-color: var(--red);">🌟 วันหยุด: ${configuredHoliday.name}</div><input type="hidden" name="status_${doc.id}" value="หยุด"></div>`;
          } else if (configuredNoClass) {
             statusContent = `<div class="status-wrapper"><div class="special-status-box box-noclass" style="background: rgba(100, 116, 139, 0.1); color: var(--text-muted); border-color: var(--text-muted);">🚫 ไม่มีคาบเรียน (ตามตาราง)</div><input type="hidden" name="status_${doc.id}" value="ไม่มีคาบ"></div>`;
          } else if (savedStatus === "หยุด") {
             statusContent = `<div class="status-wrapper"><div class="special-status-box box-holiday">🌟 วันหยุด</div><input type="hidden" name="status_${doc.id}" value="หยุด"></div>`;
          } else if (savedStatus === "ไม่มีคาบ") {
             statusContent = `<div class="status-wrapper"><div class="special-status-box box-noclass">🚫 ไม่มีคาบเรียน</div><input type="hidden" name="status_${doc.id}" value="ไม่มีคาบ"></div>`;
          } else if (isWeekend && !savedStatus) {
             statusContent = `<div class="status-wrapper"><div class="special-status-box box-weekend">🌟 วันหยุด (เสาร์-อาทิตย์)</div><input type="hidden" name="status_${doc.id}" value="หยุด"></div>`;
          } else {
             const stat = savedStatus || "มา";
             statusContent = `
                 <div class="status-wrapper">
                     <div class="radio-group">
                         <label class="radio-label"><input type="radio" name="status_${doc.id}" value="มา" ${stat === "มา" ? "checked" : ""}><span>มา</span></label>
                         <label class="radio-label"><input type="radio" name="status_${doc.id}" value="ขาด" ${stat === "ขาด" ? "checked" : ""}><span>ขาด</span></label>
                         <label class="radio-label"><input type="radio" name="status_${doc.id}" value="ลา" ${stat === "ลา" ? "checked" : ""}><span>ลา</span></label>
                         <label class="radio-label"><input type="radio" name="status_${doc.id}" value="ป่วย" ${stat === "ป่วย" ? "checked" : ""}><span>ป่วย</span></label>
                     </div>
                 </div>
             `;
          }

          tr.innerHTML = `<td style="font-weight:600; color:var(--gold-luxury);">${student.studentNo}</td><td style="font-weight:500;">${student.fullName}</td><td class="status-cell">${statusContent}</td>`;
          attendanceInputBody.appendChild(tr);
        });
      }

      btnCheckAll.addEventListener("click", () => {
        document
          .querySelectorAll('#attendanceInputBody input[value="มา"]')
          .forEach((radio) => {
            radio.checked = true;
          });
      });

      btnSaveAttendance.addEventListener("click", async () => {
        const date = attendanceDate.value;
        const currentRoom = attendanceRoom.value;
        const rows = document.querySelectorAll("#attendanceInputBody tr");

        if (!date) {
          window.showToast("⚠️ กรุณาเลือกวันที่ก่อนทำการเซฟครับ");
          return;
        }
        if (rows.length === 0 || rows[0].getAttribute("data-id") === null) {
          window.showToast("⚠️ ไม่มีข้อมูลรายชื่อเพื่อใช้บันทึกครับ");
          return;
        }

        btnSaveAttendance.textContent = "กำลังประมวลผลเซฟ...";
        btnSaveAttendance.disabled = true;

        try {
          const batch = writeBatch(db);
          for (let row of rows) {
            const id = row.getAttribute("data-id");
            const name = row.getAttribute("data-name");

            let statusInput = row.querySelector(
              `input[name="status_${id}"]:checked`,
            );
            if (!statusInput)
              statusInput = row.querySelector(
                `input[type="hidden"][name="status_${id}"]`,
              );
            const status = statusInput ? statusInput.value : "มา";

            const attendanceDocRef = doc(db, "attendance", `${id}_${date}`);
            batch.set(attendanceDocRef, {
              studentId: id,
              studentName: name,
              room: currentRoom,
              date: date,
              status: status,
              timestamp: new Date(),
            });
          }
          await batch.commit();
          window.showToast(
            `💾 บันทึกข้อมูลห้อง ${currentRoom} เรียบร้อยสมบูรณ์!`,
          );
          
          const badge = document.getElementById("attendanceStatusBadge");
          if (badge) {
              badge.style.display = "inline-flex";
              badge.style.backgroundColor = "rgba(46, 204, 113, 0.15)";
              badge.style.color = "var(--green)";
              badge.style.border = "1px solid var(--green)";
              badge.innerHTML = "✅ บันทึกข้อมูลแล้ว";
          }
          
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
        const selectedMonth = reportMonthSelect.value;

        if (!selectedRoom || selectedRoom === "") {
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

        const holidays = window.classroomMeta?.holidays || [];
        const noClassSchedules = window.classroomMeta?.noClassSchedules || [];
        const makeupDays = window.classroomMeta?.makeupDays || [];
        
        const holidaysInMonth = holidays.filter(h => h.date.startsWith(`${year}-${String(month).padStart(2, "0")}`));
        const holidayDates = new Map(holidaysInMonth.map(h => [h.date, h.name]));
        
        const makeupInMonth = makeupDays.filter(m => m.date.startsWith(`${year}-${String(month).padStart(2, "0")}`));
        const makeupDates = new Map(makeupInMonth.map(m => [m.date, m.substituteDayOfWeek]));

        function isSchoolOpen(dObj) {
           if(!window.classroomMeta) return true;
           function parseD(dStr) {
              if(!dStr) return null;
              let p = dStr.split("-");
              if(p.length===3) {
                 let yr = parseInt(p[0]);
                 if(yr > 2500) yr -= 543;
                 return new Date(yr, parseInt(p[1])-1, parseInt(p[2]));
              }
              return null;
           }
           let t1s = parseD(window.classroomMeta.term1Start);
           let t1e = parseD(window.classroomMeta.term1End);
           let t2s = parseD(window.classroomMeta.term2Start);
           let t2e = parseD(window.classroomMeta.term2End);
           
           if(t1s && t1e && t1s > t1e) t1e.setFullYear(t1e.getFullYear()+1);
           if(t2s && t2e && t2s > t2e) t2e.setFullYear(t2e.getFullYear()+1);
           
           let inT1 = (t1s && t1e) ? (dObj >= t1s && dObj <= t1e) : false;
           let inT2 = (t2s && t2e) ? (dObj >= t2s && dObj <= t2e) : false;
           
           if(!t1s && !t2s) return true; // fallback
           return inT1 || inT2;
        }

        const dayClasses = [
          "bg-sun",
          "bg-mon",
          "bg-tue",
          "bg-wed",
          "bg-thu",
          "bg-fri",
          "bg-sat",
        ];
        const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

        let headerHTML = `<th style="width: 250px; min-width: 200px;">ชื่อ-นามสกุล</th>`;

        for (let d = 1; d <= daysInMonth; d++) {
          const dateObj = new Date(year, month - 1, d);
          const dayIdx = dateObj.getDay();
          const currentDayStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayName = dayNames[dayIdx];

          let thClass = "";
          let dnLabel = dayName;
          let extraStyle = "";
          
          const substituteDay = makeupDates.get(currentDayStr);
          
          if (holidayDates.has(currentDayStr)) {
             thClass = "bg-holiday";
             dnLabel = "🌟";
             extraStyle = "color:var(--red); background:rgba(231,76,60,0.1);";
          } else if (substituteDay) {
             const subDayNames = { "1":"จ(ชดเชย)", "2":"อ(ชดเชย)", "3":"พ(ชดเชย)", "4":"พฤ(ชดเชย)", "5":"ศ(ชดเชย)" };
             const subClasses = { "1":"bg-mon", "2":"bg-tue", "3":"bg-wed", "4":"bg-thu", "5":"bg-fri" };
             thClass = subClasses[substituteDay];
             dnLabel = subDayNames[substituteDay];
          } else {
             if (dayIdx === 0) thClass = "bg-sun";
             if (dayIdx === 6) thClass = "bg-sat";
          }

          headerHTML += `<th class="${thClass}" style="width: 35px; min-width: 35px; max-width: 35px; text-align:center; font-size:11px; padding:6px 0; ${extraStyle}">${d}<br><span style="font-size:9px; font-weight:400;">${dnLabel}</span></th>`;
        }

        headerHTML += `
        <th style="width: 45px; min-width: 45px; color:#2ecc71; text-align:center;">มา</th>
        <th style="width: 45px; min-width: 45px; color:#e74c3c; text-align:center;">ขาด</th>
        <th style="width: 45px; min-width: 45px; color:#f1c40f; text-align:center;">ลา</th>
        <th style="width: 45px; min-width: 45px; color:#3498db; text-align:center;">ป่วย</th>
    `;
        matrixHeader.innerHTML = headerHTML;

        matrixBody.innerHTML =
          "<tr><td colspan='45' style='text-align:center;'>กำลังรวบรวมสถิติ...</td></tr>";

        const studentsQuery = query(
          getStudentsCollection(),
          where("room", "==", selectedRoom),
          orderBy("studentNo", "asc"),
        );
        const studentsSnapshot = await getDocs(studentsQuery);

        const attendanceQuery = query(
          getAttendanceCollection(),
          where("room", "==", selectedRoom),
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);

        matrixBody.innerHTML = "";

        const attendanceMap = {};
        const allRecords = [];
        attendanceSnapshot.forEach((doc) => {
          allRecords.push(doc.data());
        });

        const getTime = (ts) => {
          if (!ts) return 0;
          if (ts.toMillis) return ts.toMillis();
          return new Date(ts).getTime();
        };
        allRecords.sort((a, b) => getTime(a.timestamp) - getTime(b.timestamp));
        allRecords.forEach((data) => {
          attendanceMap[`${data.studentId}_${data.date}`] = data.status;
        });

        let grandTotalPresent = 0,
          grandTotalRecords = 0;
        let totalAbsent = 0,
          totalLeave = 0,
          totalSick = 0;

        let taughtDays = new Set();
        printCacheData = [];

        if (studentsSnapshot.empty) {
          matrixBody.innerHTML = `<tr><td colspan="45" style="text-align:center; color:var(--text-muted);">ไม่พบข้อมูลรายงานของห้องเรียนนี้</td></tr>`;
          document.getElementById("stat-total-classes").textContent = "0 คาบ";
          document.getElementById("stat-avg").textContent = "0%";
          document.getElementById("stat-absent").textContent = "0 ครั้ง";
          document.getElementById("stat-leave").textContent = "0 ครั้ง";
          document.getElementById("stat-sick").textContent = "0 ครั้ง";
          return;
        }

        studentsSnapshot.forEach((studentDoc) => {
          const studentId = studentDoc.id;
          const student = studentDoc.data();

          let countPresent = 0,
            countAbsent = 0,
            countLeave = 0,
            countSick = 0;
          let studentRecord = {
            no: student.studentNo,
            name: student.fullName,
            days: [],
            counts: {},
          };

          let rowHTML = `<td style="font-weight:500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><span style="color:var(--gold-luxury); font-size:11px; margin-right:5px;">เลขที่ ${student.studentNo}</span> ${student.fullName}</td>`;

          for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const dayIdx = dateObj.getDay();
            const currentDayStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const status = attendanceMap[`${studentId}_${currentDayStr}`];
            const isClosed = !isSchoolOpen(dateObj);
            const isHoliday = holidayDates.has(currentDayStr);
            const substituteDay = makeupDates.get(currentDayStr);
            let effectiveDayIdx = substituteDay ? parseInt(substituteDay) : dayIdx;

            const curSem = getSemesterOfDate(dateObj);
            const isScheduledNoClass = noClassSchedules.some(s => selectedRoom.startsWith(s.room) && parseInt(s.dayOfWeek) === effectiveDayIdx && (s.semester === "all" || !s.semester || s.semester === curSem));

            let cellClass = "";
            let cellText = "-";
            let textClass = "text-muted";
            let bgStyle = (isClosed || isHoliday || isScheduledNoClass) ? "background-color: #f1f3f5;" : "";

            if (isHoliday) {
               cellText = "🌟";
               textClass = "text-muted";
               bgStyle = "background-color: rgba(231,76,60,0.05);";
            } else if (substituteDay) {
               const subClasses = { "1":"bg-mon", "2":"bg-tue", "3":"bg-wed", "4":"bg-thu", "5":"bg-fri" };
               cellClass = subClasses[substituteDay];
            } else if (dayIdx === 0) {
               cellClass = "bg-sun";
            } else if (dayIdx === 6) {
               cellClass = "bg-sat";
            }

            if (isHoliday) {
               // Handled
            } else if (isScheduledNoClass) {
               cellText = "🚫";
               textClass = "text-muted";
               bgStyle = "background-color: rgba(100, 116, 139, 0.05);";
            } else if (isClosed) {
               // Ignore status and show as closed
               cellText = "-";
               textClass = "text-muted";
            } else if (status === "มา") {
              cellText = "✔";
              textClass = "text-present";
              countPresent++;
              grandTotalPresent++;
              grandTotalRecords++;
              taughtDays.add(currentDayStr);
            } else if (status === "ขาด") {
              cellText = "ข";
              textClass = "text-absent";
              countAbsent++;
              totalAbsent++;
              grandTotalRecords++;
              taughtDays.add(currentDayStr);
            } else if (status === "ลา") {
              cellText = "ล";
              textClass = "text-leave";
              countLeave++;
              totalLeave++;
              grandTotalRecords++;
              taughtDays.add(currentDayStr);
            } else if (status === "ป่วย") {
              cellText = "ป";
              textClass = "text-sick";
              countSick++;
              totalSick++;
              grandTotalRecords++;
              taughtDays.add(currentDayStr);
            } else if (status === "หยุด" || status === "ไม่มีคาบ") {
              cellText = "-";
              textClass = "text-muted";
            }

            let isInactive = false;
            if (
              (!substituteDay && (dayIdx === 0 || dayIdx === 6)) ||
              isClosed ||
              isHoliday ||
              isScheduledNoClass ||
              status === "หยุด" ||
              status === "ไม่มีคาบ"
            ) {
              isInactive = true;
            }

            studentRecord.days.push({ text: cellText, isInactive: isInactive });
            rowHTML += `<td class="${cellClass}" style="width: 35px; min-width: 35px; max-width: 35px; text-align:center; padding: 4px 0; ${bgStyle}"><span class="${textClass}" style="font-weight:600;">${cellText}</span></td>`;
          }

          const validDays = countPresent + countAbsent + countLeave + countSick;
          const p_percent =
            validDays > 0
              ? ((countPresent / validDays) * 100).toFixed(1) + "%"
              : "0.0%";

          studentRecord.counts = {
            p: countPresent,
            a: countAbsent,
            l: countLeave,
            s: countSick,
            pct: p_percent,
          };
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

        document.getElementById("stat-total-classes").textContent =
          `${taughtDays.size} คาบ`;

        const avgPresent =
          grandTotalRecords > 0
            ? Math.round((grandTotalPresent / grandTotalRecords) * 100)
            : 0;
        document.getElementById("stat-avg").textContent = `${avgPresent}%`;
        document.getElementById("stat-absent").textContent =
          `${totalAbsent} ครั้ง`;
        document.getElementById("stat-leave").textContent =
          `${totalLeave} ครั้ง`;
        document.getElementById("stat-sick").textContent = `${totalSick} ครั้ง`;

        let existingNote = document.getElementById("holidayReportNote");
        if (existingNote) existingNote.remove();

        if (holidaysInMonth.length > 0) {
           let sortedH = [...holidaysInMonth].sort((a,b) => a.date.localeCompare(b.date));
           const mNamesFull = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
           let noteHtml = `<div id="holidayReportNote" style="margin-top: 20px; padding: 15px; background: rgba(231, 76, 60, 0.05); border-left: 4px solid var(--red); border-radius: 8px; font-size: 14px; color: var(--text-muted);">
              <div style="font-weight: 600; color: var(--red); margin-bottom: 8px;">📌 หมายเหตุ: วันหยุดพิเศษในเดือนนี้</div>
              <ul style="margin:0; padding-left: 20px;">
                 ${sortedH.map(h => {
                    let d = parseInt(h.date.split("-")[2]);
                    let m = parseInt(h.date.split("-")[1]);
                    return `<li style="margin-bottom:4px;">วันที่ ${d} ${mNamesFull[m-1]}: <strong>${h.name}</strong></li>`;
                 }).join('')}
              </ul>
           </div>`;
           reportContentArea.insertAdjacentHTML('beforeend', noteHtml);
        }
      }

      // ================= [ 6. ฟังก์ชันดูตัวอย่างและพิมพ์ (Print Layout) ] =================
      btnShowPreview.addEventListener("click", () => {
        document.getElementById("printSchoolTitle").textContent =
          metaSchoolName.value || "โรงเรียนไม่ได้ระบุชื่อ";
        const logoImg = document.getElementById("printLogo");
        if (savedLogoBase64) {
          logoImg.src = savedLogoBase64;
          logoImg.style.display = "inline-block";
        } else {
          logoImg.style.display = "none";
        }

        const monthVal = reportMonthSelect.value;
        const y = parseInt(monthVal.split("-")[0]);
        const m = parseInt(monthVal.split("-")[1]);
        const thaiMonths = [
          "มกราคม",
          "กุมภาพันธ์",
          "มีนาคม",
          "เมษายน",
          "พฤษภาคม",
          "มิถุนายน",
          "กรกฎาคม",
          "สิงหาคม",
          "กันยายน",
          "ตุลาคม",
          "พฤศจิกายน",
          "ธันวาคม",
        ];
        document.getElementById("printMonthYear").textContent =
          `${thaiMonths[m - 1]} พ.ศ. ${y + 543}`;

        document.getElementById("printRoom").textContent =
          reportRoom.value.replace("ป.", "");
        document.getElementById("printAcademicYear").textContent =
          metaYear.value || "-";

        const daysInMonth = new Date(y, m, 0).getDate();
        let head1 = `<th rowspan="2" style="width:30px;">ที่</th><th rowspan="2" style="width:150px; text-align:left;">ชื่อ-สกุล</th><th colspan="${daysInMonth}">วันที่</th><th colspan="4">สรุป (วัน)</th><th rowspan="2" style="width:40px;">%</th>`;
        let head2 = "";

        for (let d = 1; d <= daysInMonth; d++) {
          head2 += `<th>${d}</th>`;
        }
        head2 += `<th>มา</th><th>ขาด</th><th>ลา</th><th>ป่วย</th>`;

        document.getElementById("printTableHeader1").innerHTML = head1;
        document.getElementById("printTableHeader2").innerHTML = head2;

        const tBody = document.getElementById("printTableBody");
        tBody.innerHTML = "";

        printCacheData.forEach((s) => {
          let rHTML = `<td>${s.no}</td><td style="text-align:left;">${s.name}</td>`;
          s.days.forEach((day) => {
            const bgClass = day.isInactive ? "print-bg-weekend" : "";
            rHTML += `<td class="${bgClass}">${day.text}</td>`;
          });
          rHTML += `<td>${s.counts.p}</td><td>${s.counts.a}</td><td>${s.counts.l}</td><td>${s.counts.s}</td><td>${s.counts.pct}</td>`;

          let tr = document.createElement("tr");
          tr.innerHTML = rHTML;
          tBody.appendChild(tr);
        });

        document.getElementById("printPreviewModal").style.display = "flex";
      });

      document
        .getElementById("btnClosePreview")
        .addEventListener("click", () => {
          document.getElementById("printPreviewModal").style.display = "none";
        });
      document
        .getElementById("btnConfirmPrint")
        .addEventListener("click", () => {
          window.print();
        });

      // Flatpickr Setup
      let attendanceFp;
      const thConfig = {
        locale: "th",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "j M Y",
        formatDate: function (date, format, locale) {
          if (format === "Y-m-d") {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return y + "-" + m + "-" + d;
          }
          const year = date.getFullYear() + 543;
          const d = date.getDate();
          const mNames = [
            "ม.ค.",
            "ก.พ.",
            "มี.ค.",
            "เม.ย.",
            "พ.ค.",
            "มิ.ย.",
            "ก.ค.",
            "ส.ค.",
            "ก.ย.",
            "ต.ค.",
            "พ.ย.",
            "ธ.ค.",
          ];
          const m = mNames[date.getMonth()];
          return d + " " + m + " " + year;
        },
        onOpen: function (selectedDates, dateStr, instance) {
          if (instance.element && instance.element.id === "attendanceDate") {
            const sem = document.getElementById("attendanceSemester").value;
            if (!window.classroomMeta) {
              window.showToast(
                "⚠️ กรุณาตั้งค่าวันเปิด-ปิดภาคเรียนในเมนูข้อมูลทั่วไปก่อนครับ",
              );
              setTimeout(() => instance.close(), 10);
              return;
            }
            let tStart =
              sem === "1"
                ? window.classroomMeta.term1Start
                : window.classroomMeta.term2Start;
            let tEnd =
              sem === "1"
                ? window.classroomMeta.term1End
                : window.classroomMeta.term2End;

            if (!tStart || !tEnd) {
              window.showToast(
                `⚠️ ยังไม่ได้ตั้งค่าวันเปิด-ปิด ภาคเรียนที่ ${sem}`,
              );
              setTimeout(() => instance.close(), 10);
              return;
            }

            function normalize(d) {
              if (!d) return "";
              let p = d.split("-");
              if (p.length === 3 && parseInt(p[0]) > 2500) {
                p[0] = (parseInt(p[0]) - 543).toString();
                return p.join("-");
              }
              return d;
            }

            instance.set("minDate", normalize(tStart));
            instance.set("maxDate", normalize(tEnd));
          }
        },
        onReady: function (d, s, instance) {
          let yearSelect = document.createElement("select");
          yearSelect.className = "cur-year-dropdown";
          yearSelect.style.marginLeft = "5px";
          yearSelect.style.background = "transparent";
          yearSelect.style.border = "none";
          yearSelect.style.fontWeight = "bold";
          yearSelect.style.color = "inherit";
          yearSelect.style.cursor = "pointer";

          const currentY = instance.currentYear;
          for (let y = currentY - 50; y <= currentY + 10; y++) {
            let opt = document.createElement("option");
            opt.value = y;
            opt.text = (y + 543).toString();
            opt.style.color = "black";
            if (y === currentY) opt.selected = true;
            yearSelect.appendChild(opt);
          }

          yearSelect.addEventListener("change", function () {
            instance.changeYear(parseInt(this.value));
          });

          let monthElem = instance.currentMonthElement 
            || (instance.monthElements && instance.monthElements[0] ? instance.monthElements[0].parentNode : null)
            || (instance.calendarContainer ? instance.calendarContainer.querySelector(".flatpickr-current-month") : null);
          
          if (monthElem) {
            monthElem.appendChild(yearSelect);
          }
        },
        onMonthChange: function (d, s, instance) {
          let monthElem = instance.currentMonthElement 
            || (instance.monthElements && instance.monthElements[0] ? instance.monthElements[0].parentNode : null)
            || (instance.calendarContainer ? instance.calendarContainer.querySelector(".flatpickr-current-month") : null);
          if (!monthElem) return;

          let yearSelect = monthElem.querySelector(".cur-year-dropdown");
          if (!yearSelect) return;
          let opt = yearSelect.querySelector(`option[value="${instance.currentYear}"]`);
          if (!opt) {
            opt = document.createElement("option");
            opt.value = instance.currentYear;
            opt.text = (instance.currentYear + 543).toString();
            opt.style.color = "black";
            yearSelect.appendChild(opt);
          }
          yearSelect.value = instance.currentYear;
        },
        onYearChange: function (d, s, instance) {
          let monthElem = instance.currentMonthElement 
            || (instance.monthElements && instance.monthElements[0] ? instance.monthElements[0].parentNode : null)
            || (instance.calendarContainer ? instance.calendarContainer.querySelector(".flatpickr-current-month") : null);
          if (!monthElem) return;

          let yearSelect = monthElem.querySelector(".cur-year-dropdown");
          if (!yearSelect) return;
          let opt = yearSelect.querySelector(`option[value="${instance.currentYear}"]`);
          if (!opt) {
            opt = document.createElement("option");
            opt.value = instance.currentYear;
            opt.text = (instance.currentYear + 543).toString();
            opt.style.color = "black";
            yearSelect.appendChild(opt);
          }
          yearSelect.value = instance.currentYear;
        },
        onChange: function (selectedDates, dateStr, instance) {
          if (instance.element && instance.element.id === "attendanceDate") {
            loadAttendancePage();
          }
        },
      };

      try {
        attendanceFp = flatpickr(".thai-date-attendance", thConfig);
        flatpickr(".thai-date-setting", thConfig);
      } catch (e) {
        console.error("Flatpickr error:", e);
      }

      document
        .getElementById("attendanceSemester")
        .addEventListener("change", () => {
          document.getElementById("attendanceDate").value = "";
          if (typeof attendanceFp !== "undefined" && attendanceFp) {
            let inst = Array.isArray(attendanceFp)
              ? attendanceFp[0]
              : attendanceFp;
            if (inst) {
              inst.clear();
            }
          }
          applyAttendanceCalendarLimits();
          loadAttendancePage();
        });

      // ================= [ แดชบอร์ดสรุปภาพรวม ] =================
      async function loadDashboardData() {
        try {
           const roomsSnap = await getDocs(getRoomsCollection());
           const studentsSnap = await getDocs(getStudentsCollection());
           
           const validStudentIds = new Set();
           const roomCounts = {};
           studentsSnap.forEach(doc => {
              validStudentIds.add(doc.id);
              let r = doc.data().room || "ไม่ระบุ";
              roomCounts[r] = (roomCounts[r] || 0) + 1;
           });

           document.getElementById("dashTotalRooms").innerText = roomsSnap.size;
           document.getElementById("dashTotalStudents").innerText = studentsSnap.size;



           let today = new Date();
           let yy = today.getFullYear();
           let mm = String(today.getMonth() + 1).padStart(2, '0');
           let dd = String(today.getDate()).padStart(2, '0');
           let todayStr = `${yy}-${mm}-${dd}`;
           
           const mNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
           let dashDateStr = `${parseInt(dd)} ${mNames[today.getMonth()]} ${today.getFullYear() + 543}`;
           const dashTodayDateEl = document.getElementById("dashTodayDate");
           if (dashTodayDateEl) dashTodayDateEl.innerText = `ประจำวันที่: ${dashDateStr}`;

           const attSnap = await getDocs(getAttendanceCollection());
           let todayMa = 0, todayKhad = 0, todayLa = 0, todayPuay = 0;
           let termMa = 0, termKhad = 0, termLa = 0, termPuay = 0;
           const noClassRooms = new Set();
           const checkedRoomsToday = new Set();

           let currentSem = document.getElementById("metaSemester")?.value || "1";
           let tStart = currentSem === "1" ? window.classroomMeta?.term1Start : window.classroomMeta?.term2Start;
           let tEnd = currentSem === "1" ? window.classroomMeta?.term1End : window.classroomMeta?.term2End;
           
           function normalize(dStr) {
             if (!dStr) return "";
             let p = dStr.split("-");
             if (p.length === 3 && parseInt(p[0]) > 2500) {
               p[0] = (parseInt(p[0]) - 543).toString();
               return p.join("-");
             }
             return dStr;
           }
           let nStart = normalize(tStart);
           let nEnd = normalize(tEnd);
           if (currentSem === "2" && nStart && nEnd) {
             let d1 = new Date(nStart);
             let d2 = new Date(nEnd);
             if (d1 > d2) {
                d2.setFullYear(d2.getFullYear() + 1);
                let y = d2.getFullYear();
                let m = String(d2.getMonth() + 1).padStart(2, '0');
                let d = String(d2.getDate()).padStart(2, '0');
                nEnd = `${y}-${m}-${d}`;
             }
           }

           attSnap.forEach(doc => {
              let data = doc.data();
              if (!validStudentIds.has(data.studentId)) return;

              if (data.date === todayStr) {
                 checkedRoomsToday.add(data.room || "ไม่ระบุ");
                 if (data.status === "ไม่มีคาบ" || data.status === "หยุด") {
                    noClassRooms.add(data.room || "ไม่ระบุ");
                 } else if(data.status === "มา") {
                    todayMa++;
                 } else if(data.status === "ขาด") {
                    todayKhad++;
                 } else if(data.status === "ลา") {
                    todayLa++;
                 } else if(data.status === "ป่วย") {
                    todayPuay++;
                 }
              }

              if (!data.status || data.status === "ไม่มีคาบ" || data.status === "หยุด") return;

              if (nStart && nEnd && data.date >= nStart && data.date <= nEnd) {
                 if(data.status === "มา") termMa++;
                 else if(data.status === "ขาด") termKhad++;
                 else if(data.status === "ลา") termLa++;
                 else if(data.status === "ป่วย") termPuay++;
              }
           });

           let todayTotal = todayMa + todayKhad + todayLa + todayPuay;
           let todayPct = todayTotal > 0 ? ((todayMa / todayTotal)*100).toFixed(1) : 0;
           document.getElementById("dashTodayPercent").innerText = todayPct + "%";
           
           const dashTodayTotalEl = document.getElementById("dashTodayTotal");
           if (dashTodayTotalEl) {
               dashTodayTotalEl.innerText = `เช็คแล้ว ${todayTotal} คน`;
           }

           document.getElementById("dashTodayMaCount").innerText = todayMa + " คน";
           document.getElementById("dashTodayMaBar").style.width = (todayTotal > 0 ? (todayMa/todayTotal)*100 : 0) + "%";

           document.getElementById("dashTodayKhadCount").innerText = todayKhad + " คน";
           document.getElementById("dashTodayKhadBar").style.width = (todayTotal > 0 ? (todayKhad/todayTotal)*100 : 0) + "%";

           document.getElementById("dashTodayLaCount").innerText = todayLa + " คน";
           document.getElementById("dashTodayLaBar").style.width = (todayTotal > 0 ? (todayLa/todayTotal)*100 : 0) + "%";

           document.getElementById("dashTodayPuayCount").innerText = todayPuay + " คน";
           document.getElementById("dashTodayPuayBar").style.width = (todayTotal > 0 ? (todayPuay/todayTotal)*100 : 0) + "%";

           let termTotal = termMa + termKhad + termLa + termPuay;
           let termPct = termTotal > 0 ? ((termMa / termTotal)*100).toFixed(1) : 0;
           document.getElementById("dashTermPercent").innerText = termPct + "%";

           const noClassContainer = document.getElementById("dashTodayNoClassContainer");
           if (noClassContainer) {
              if (noClassRooms.size > 0) {
                 noClassContainer.style.display = "block";
                 let sortedNoClass = Array.from(noClassRooms).sort((a,b) => a.localeCompare(b, 'th', {numeric: true}));
                 document.getElementById("dashTodayNoClassRooms").innerText = sortedNoClass.map(r => `ชั้น ${r}`).join(', ');
              } else {
                 noClassContainer.style.display = "none";
              }
           }

           const classListEl = document.getElementById("dashClassStatsList");
           if (Object.keys(roomCounts).length === 0) {
              classListEl.innerHTML = `<div style="color:var(--text-muted); text-align:center; width:100%;">ไม่มีข้อมูลห้องเรียน</div>`;
           } else {
              let html = "";
              let sortedRooms = Object.keys(roomCounts).sort((a,b) => a.localeCompare(b, 'th', {numeric: true}));
              for (let room of sortedRooms) {
                 let statusHtml = "";
                 const isWeekend = (today.getDay() === 0 || today.getDay() === 6);
                 let isHolidayToday = false;
                 if (window.classroomMeta && window.classroomMeta.holidays) {
                     isHolidayToday = window.classroomMeta.holidays.some(h => h.date === todayStr);
                 }

                 if (checkedRoomsToday.has(room)) {
                    statusHtml = `<div style="font-size: 11.5px; color: var(--green); margin-top: 8px; font-weight: 600; background: rgba(74, 222, 128, 0.1); padding: 4px; border-radius: 4px; border: 1px solid rgba(74,222,128,0.3);">✅ เช็คชื่อแล้ว</div>`;
                 } else if (isWeekend || isHolidayToday) {
                    statusHtml = `<div style="font-size: 11.5px; color: #a855f7; margin-top: 8px; font-weight: 500; background: rgba(168, 85, 247, 0.1); padding: 4px; border-radius: 4px; border: 1px solid rgba(168,85,247,0.3);">🏖️ วันหยุด</div>`;
                 } else {
                    statusHtml = `<div style="font-size: 11.5px; color: var(--red); margin-top: 8px; font-weight: 500; background: rgba(248, 113, 113, 0.1); padding: 4px; border-radius: 4px; border: 1px solid rgba(248,113,113,0.3);">❌ ยังไม่เช็คชื่อ</div>`;
                 }

                 html += `
                   <div class="class-stat-item">
                     <div class="class-stat-room">ชั้น ${room}</div>
                     <div class="class-stat-count">${roomCounts[room]}</div>
                     ${statusHtml}
                   </div>
                 `;
              }
              classListEl.innerHTML = html;
           }

        } catch (err) {
           console.error("Dashboard error:", err);
        }
      }

      function renderHolidaysList() {
        const tbody = document.getElementById("holidayListBody");
        const holidays = window.classroomMeta?.holidays || [];
        if (holidays.length === 0) {
           tbody.innerHTML = `<tr><td colspan="3" style="padding: 15px; text-align: center; color: var(--text-muted);">ยังไม่มีข้อมูลวันหยุด</td></tr>`;
           return;
        }

        const mNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
        const sorted = [...holidays].sort((a,b) => a.date.localeCompare(b.date));
        
        let html = "";
        sorted.forEach((h, index) => {
           let dObj = new Date(h.date);
           let dStr = `${dObj.getDate()} ${mNames[dObj.getMonth()]} ${dObj.getFullYear() + 543}`;
           html += `
             <tr>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--gold-luxury);">${dStr}</td>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">${h.name}</td>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
                 <button class="btn btn-outline-gray" style="padding: 4px 8px; font-size: 12px; color: var(--red); border-color: var(--red);" onclick="deleteHoliday(${index})">ลบ</button>
               </td>
             </tr>
           `;
        });
        tbody.innerHTML = html;
      }

      window.deleteHoliday = async function(index) {
         if (!window.classroomMeta) return;
         const holidays = window.classroomMeta.holidays || [];
         
         const sorted = [...holidays].sort((a,b) => a.date.localeCompare(b.date));
         const toDelete = sorted[index];
         const realIndex = holidays.findIndex(h => h.date === toDelete.date && h.name === toDelete.name);
         
         if (realIndex > -1) {
             holidays.splice(realIndex, 1);
             window.classroomMeta.holidays = holidays;
             renderHolidaysList();
             
             try {
                await setDoc(doc(db, "metadata", "classroom_info"), {
                   ...window.classroomMeta
                });
                window.showToast("🗑️ ลบวันหยุดเรียบร้อยแล้ว");
             } catch(e) {
                console.error(e);
                window.showToast("❌ เกิดข้อผิดพลาดในการลบวันหยุด");
             }
         }
      };

      document.getElementById("btnAddHoliday").addEventListener("click", async () => {
         const dInput = document.getElementById("holidayDateInput").value;
         const nInput = document.getElementById("holidayNameInput").value.trim();

         if (!dInput || !nInput) {
            window.showToast("⚠️ กรุณาเลือกวันที่ และพิมพ์ชื่อวันหยุดให้ครบถ้วนครับ");
            return;
         }

         if (!window.classroomMeta) window.classroomMeta = {};
         if (!window.classroomMeta.holidays) window.classroomMeta.holidays = [];

         if (window.classroomMeta.holidays.some(h => h.date === dInput)) {
            window.showToast("⚠️ วันหยุดวันนี้มีอยู่ในระบบแล้วครับ");
            return;
         }

         window.classroomMeta.holidays.push({ date: dInput, name: nInput });
         document.getElementById("holidayDateInput").value = "";
         if (document.getElementById("holidayDateInput")._flatpickr) {
            document.getElementById("holidayDateInput")._flatpickr.clear();
         }
         document.getElementById("holidayNameInput").value = "";
         
         renderHolidaysList();
         renderHolidaysList();
      });
      function renderNoClassList() {
        const tbody = document.getElementById("noClassListBody");
        const schedules = window.classroomMeta?.noClassSchedules || [];
        if (schedules.length === 0) {
           tbody.innerHTML = `<tr><td colspan="4" style="padding: 15px; text-align: center; color: var(--text-muted);">ยังไม่มีข้อมูลตาราง</td></tr>`;
           return;
        }

        const dayNames = { "1":"วันจันทร์", "2":"วันอังคาร", "3":"วันพุธ", "4":"วันพฤหัสบดี", "5":"วันศุกร์" };
        const dayColors = { "1":"#f1c40f", "2":"#e84393", "3":"#2ecc71", "4":"#e67e22", "5":"#3498db" };
        const semNames = { "1":"ภาคเรียนที่ 1", "2":"ภาคเรียนที่ 2", "all":"ทุกภาคเรียน" };
        
        let html = "";
        schedules.forEach((s, index) => {
           let semText = s.semester ? semNames[s.semester] : "ทุกภาคเรียน";
           html += `
             <tr>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--gold-luxury); font-weight:600;">ชั้น ${s.room}</td>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-muted);">${semText}</td>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: ${dayColors[s.dayOfWeek]};">${dayNames[s.dayOfWeek]}</td>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
                 <button class="btn btn-outline-gray" style="padding: 4px 8px; font-size: 12px; color: var(--red); border-color: var(--red);" onclick="deleteNoClass(${index})">ลบ</button>
               </td>
             </tr>
           `;
        });
        tbody.innerHTML = html;
      }

      window.deleteNoClass = async function(index) {
         if (!window.classroomMeta) return;
         const schedules = window.classroomMeta.noClassSchedules || [];
         
         if (index > -1 && index < schedules.length) {
             schedules.splice(index, 1);
             window.classroomMeta.noClassSchedules = schedules;
             renderNoClassList();
             
             try {
                await setDoc(doc(db, "metadata", "classroom_info"), {
                   ...window.classroomMeta
                });
                window.showToast("🗑️ ลบตารางเรียบร้อยแล้ว");
             } catch(e) {
                console.error(e);
                window.showToast("❌ เกิดข้อผิดพลาดในการลบตาราง");
             }
         }
      };

      document.getElementById("btnAddNoClass").addEventListener("click", async () => {
         const rInput = document.getElementById("noClassRoomInput").value.trim();
         const dSelect = document.getElementById("noClassDaySelect").value;
         const sSelect = document.getElementById("noClassSemesterSelect").value;

         if (!rInput || !dSelect) {
            window.showToast("⚠️ กรุณาระบุชั้นเรียนให้ครบถ้วนครับ");
            return;
         }

         if (!window.classroomMeta) window.classroomMeta = {};
         if (!window.classroomMeta.noClassSchedules) window.classroomMeta.noClassSchedules = [];

         if (window.classroomMeta.noClassSchedules.some(s => s.room === rInput && s.dayOfWeek === dSelect && (s.semester === sSelect || s.semester === "all" || sSelect === "all"))) {
            window.showToast("⚠️ ตารางนี้มีคาบเกี่ยวซ้อนทับอยู่ในระบบแล้วครับ");
            return;
         }

         window.classroomMeta.noClassSchedules.push({ room: rInput, dayOfWeek: dSelect, semester: sSelect });
         document.getElementById("noClassRoomInput").value = "";
         
         renderNoClassList();

         try {
            const btn = document.getElementById("btnAddNoClass");
            btn.textContent = "กำลังบันทึก...";
            btn.disabled = true;
            await setDoc(doc(db, "metadata", "classroom_info"), {
               ...window.classroomMeta
            });
            window.showToast("✅ เพิ่มตารางเรียบร้อยแล้ว!");
            btn.textContent = "➕ เพิ่มตาราง";
            btn.disabled = false;
         } catch(e) {
            console.error(e);
            window.showToast("❌ เกิดข้อผิดพลาดในการบันทึกตาราง");
         }
      });

      function renderMakeupDaysList() {
        const tbody = document.getElementById("makeupListBody");
        const makeups = window.classroomMeta?.makeupDays || [];
        if (makeups.length === 0) {
           tbody.innerHTML = `<tr><td colspan="3" style="padding: 15px; text-align: center; color: var(--text-muted);">ยังไม่มีข้อมูลวันชดเชย</td></tr>`;
           return;
        }

        const mNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
        const dayNames = { "1":"วันจันทร์", "2":"วันอังคาร", "3":"วันพุธ", "4":"วันพฤหัสบดี", "5":"วันศุกร์" };
        const dayColors = { "1":"#f1c40f", "2":"#e84393", "3":"#2ecc71", "4":"#e67e22", "5":"#3498db" };
        
        const sorted = [...makeups].sort((a,b) => a.date.localeCompare(b.date));
        
        let html = "";
        sorted.forEach((m, index) => {
           let dObj = new Date(m.date);
           let dStr = `${dObj.getDate()} ${mNames[dObj.getMonth()]} ${dObj.getFullYear() + 543}`;
           html += `
             <tr>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--gold-luxury); font-weight:600;">${dStr}</td>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: ${dayColors[m.substituteDayOfWeek]};">${dayNames[m.substituteDayOfWeek]}</td>
               <td style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
                 <button class="btn btn-outline-gray" style="padding: 4px 8px; font-size: 12px; color: var(--red); border-color: var(--red);" onclick="deleteMakeupDay(${index})">ลบ</button>
               </td>
             </tr>
           `;
        });
        tbody.innerHTML = html;
      }

      window.deleteMakeupDay = async function(index) {
         if (!window.classroomMeta) return;
         const makeups = window.classroomMeta.makeupDays || [];
         
         const sorted = [...makeups].sort((a,b) => a.date.localeCompare(b.date));
         const toDelete = sorted[index];
         const realIndex = makeups.findIndex(m => m.date === toDelete.date && m.substituteDayOfWeek === toDelete.substituteDayOfWeek);
         
         if (realIndex > -1) {
             makeups.splice(realIndex, 1);
             window.classroomMeta.makeupDays = makeups;
             renderMakeupDaysList();
             
             try {
                await setDoc(doc(db, "metadata", "classroom_info"), {
                   ...window.classroomMeta
                });

                const q = query(getAttendanceCollection(), where("date", "==", toDelete.date));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const batch = writeBatch(db);
                    querySnapshot.forEach(docSnap => {
                        batch.delete(docSnap.ref);
                    });
                    await batch.commit();
                }

                window.showToast("🗑️ ลบตารางชดเชยและประวัติเช็คชื่อเรียบร้อยแล้ว");
             } catch(e) {
                console.error(e);
                window.showToast("❌ เกิดข้อผิดพลาดในการลบตารางชดเชย");
             }
         }
      };

      document.getElementById("btnAddMakeup").addEventListener("click", async () => {
         const dInput = document.getElementById("makeupDateInput").value;
         const subSelect = document.getElementById("makeupDaySelect").value;

         if (!dInput || !subSelect) {
            window.showToast("⚠️ กรุณาระบุวันที่และตารางสอนให้ครบถ้วนครับ");
            return;
         }

         if (!window.classroomMeta) window.classroomMeta = {};
         if (!window.classroomMeta.makeupDays) window.classroomMeta.makeupDays = [];

         if (window.classroomMeta.makeupDays.some(m => m.date === dInput)) {
            window.showToast("⚠️ วันนี้มีการตั้งค่าชดเชยอยู่ในระบบแล้วครับ");
            return;
         }

         window.classroomMeta.makeupDays.push({ date: dInput, substituteDayOfWeek: subSelect });
         document.getElementById("makeupDateInput").value = "";
         if (document.getElementById("makeupDateInput")._flatpickr) {
            document.getElementById("makeupDateInput")._flatpickr.clear();
         }
         
         renderMakeupDaysList();

         try {
            const btn = document.getElementById("btnAddMakeup");
            btn.textContent = "กำลังบันทึก...";
            btn.disabled = true;
            await setDoc(doc(db, "metadata", "classroom_info"), {
               ...window.classroomMeta
            });
            window.showToast("✅ เพิ่มวันชดเชยเรียบร้อยแล้ว!");
            btn.textContent = "➕ เพิ่มตารางชดเชย";
            btn.disabled = false;
         } catch(e) {
            console.error(e);
            window.showToast("❌ เกิดข้อผิดพลาดในการบันทึกตารางชดเชย");
         }
      });

// ================= [ 7. ระบบคำนวณคะแนน (ปพ.5 Smart) ] =================
let currentGradeStructure = { midtermWeight: 0, finalWeight: 0, midtermRaw: 0, finalRaw: 0, units: [], assignments: [] };

const gradeSetupRoom = document.getElementById("gradeSetupRoom");
const gradeSetupContent = document.getElementById("gradeSetupContent");
const inputMidtermWeight = document.getElementById("inputMidtermWeight");
const inputFinalWeight = document.getElementById("inputFinalWeight");
const inputMidtermRaw = document.getElementById("inputMidtermRaw");
const inputFinalRaw = document.getElementById("inputFinalRaw");
const inputTargetHours = document.getElementById("inputTargetHours");
const btnSaveExamWeights = document.getElementById("btnSaveExamWeights");
const unitCardsContainer = document.getElementById("unitCardsContainer");

const gradeTotalWeight = document.getElementById("gradeTotalWeight");
const gradeTotalUnitsWeight = document.getElementById("gradeTotalUnitsWeight");
const gradeMidtermWeight = document.getElementById("gradeMidtermWeight");
const gradeFinalWeight = document.getElementById("gradeFinalWeight");

const inputUnitName = document.getElementById("inputUnitName");
const inputUnitSubject = document.getElementById("inputUnitSubject");
const inputUnitIndicator = document.getElementById("inputUnitIndicator");
const inputUnitWeight = document.getElementById("inputUnitWeight");
const btnConfirmAddUnit = document.getElementById("btnConfirmAddUnit");

const inputAssignName = document.getElementById("inputAssignName");
const inputAssignMax = document.getElementById("inputAssignMax");
const inputAssignUnitId = document.getElementById("inputAssignUnitId");
const btnConfirmAddAssign = document.getElementById("btnConfirmAddAssign");

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

gradeSetupRoom.addEventListener("change", async () => {
    const room = gradeSetupRoom.value;
    if (!room) {
        return;
    }
    
    gradeSetupContent.style.display = "block";
    await loadGradeStructure(room);
});

const p6Units = [
    { name: "เรียนรู้วิทยาศาสตร์", subject: "วิทยาศาสตร์", ind: "-", w: 0, term: 1, hours: 4 },
    { name: "สารอาหารและระบบย่อยอาหาร", subject: "วิทยาศาสตร์", ind: "ว 1.2 ป.6/1 ระบุสารอาหารและบอกประโยชน์ของสารอาหารแต่ละประเภทจากอาหารที่ตนเองรับประทาน (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.6/2 บอกแนวทางในการเลือกรับประทานอาหารให้ได้สารอาหารครบถ้วน ในสัดส่วนที่เหมาะสม (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.6/3 ตระหนักถึงความสำคัญของสารอาหาร โดยการเลือกรับประทานอาหารที่มีสารอาหารครบถ้วนในสัดส่วนที่เหมาะสมกับเพศและวัย รวมทั้งปลอดภัยต่อสุขภาพ (ตัวชี้วัดปลายทาง)|ว 1.2 ป.6/4 สร้างแบบจำลองระบบย่อยอาหาร และบรรยายหน้าที่ของอวัยวะในระบบย่อยอาหาร รวมทั้งอธิบายการย่อยอาหารและการดูดซึมสารอาหาร (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.6/5 ตระหนักถึงความสำคัญของระบบย่อยอาหาร โดยการบอกแนวทางในการดูแลรักษาอวัยวะในระบบย่อยอาหารให้ทำงานเป็นปกติ (ตัวชี้วัดปลายทาง)", w: 10, term: 1, hours: 26 },
    { name: "การแยกสารในชีวิตประจำวัน", subject: "วิทยาศาสตร์", ind: "ว 2.1 ป.6/1 อธิบายและเปรียบเทียบการแยกสารผสมโดยการหยิบออก การร่อน การใช้แม่เหล็กดึงดูด การรินออก การกรอง และการตกตะกอน โดยใช้หลักฐานเชิงประจักษ์ รวมทั้งระบุวิธีแก้ปัญหาในชีวิตประจำวันเกี่ยวกับการแยกสาร (ตัวชี้วัดปลายทาง)", w: 5, term: 1, hours: 10 },
    { name: "ไฟฟ้าน่ารู้", subject: "วิทยาศาสตร์", ind: "ว 2.2 ป.6/1 อธิบายการเกิดและผลของแรงไฟฟ้า ซึ่งเกิดจากวัตถุที่ผ่านการขัดถู โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/1 ระบุส่วนประกอบและบรรยายหน้าที่ของแต่ละส่วนประกอบของวงจรไฟฟ้าอย่างง่ายจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/2 เขียนแผนภาพและต่อวงจรไฟฟ้าอย่างง่าย (ตัวชี้วัดระหว่างทาง)|ว 2.3 ป.6/3 ออกแบบการทดลองและทดลองด้วยวิธีที่เหมาะสมในการอธิบายวิธีการและผลของการต่อเซลล์ไฟฟ้าแบบอนุกรม (ตัวชี้วัดระหว่างทาง)|ว 2.3 ป.6/4 ตระหนักถึงประโยชน์ของความรู้ของการต่อเซลล์ไฟฟ้าแบบอนุกรม โดยบอกประโยชน์และการประยุกต์ใช้ในชีวิตประจำวัน (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/5 ออกแบบการทดลองและทดลองด้วยวิธีที่เหมาะสมในการอธิบายการต่อหลอดไฟฟ้าแบบอนุกรมและแบบขนาน (ตัวชี้วัดระหว่างทาง)|ว 2.3 ป.6/6 ตระหนักถึงประโยชน์ของความรู้ของการต่อหลอดไฟฟ้าแบบอนุกรมและแบบขนาน โดยบอกประโยชน์ ข้อจำกัด และการประยุกต์ใช้ในชีวิตประจำวัน (ตัวชี้วัดปลายทาง)", w: 10, term: 1, hours: 20 },
    { name: "ปรากฏการณ์และการเปลี่ยนแปลงทางอากาศ", subject: "วิทยาศาสตร์", ind: "ว 3.2 ป.6/4 เปรียบเทียบการเกิดลมบก ลมทะเล และมรสุม รวมทั้งอธิบายผลที่มีต่อสิ่งมีชีวิตและสิ่งแวดล้อมจากแบบจำลอง (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/5 อธิบายผลของมรสุมต่อการเกิดฤดูของประเทศไทยจากข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/8 สร้างแบบจำลองที่อธิบายการเกิดปรากฏการณ์เรือนกระจกและผลของปรากฏการณ์เรือนกระจกต่อสิ่งมีชีวิต (ตัวชี้วัดระหว่างทาง)|ว 3.2 ป.6/9 ตระหนักถึงผลกระทบของปรากฏการณ์เรือนกระจก โดยนำเสนอแนวทางการปฏิบัติตนเพื่อลดกิจกรรมที่ก่อให้เกิดแก๊สเรือนกระจก (ตัวชี้วัดปลายทาง)", w: 9, term: 2, hours: 20 },
    { name: "ปรากฏการณ์และการเปลี่ยนแปลงของโลก", subject: "วิทยาศาสตร์", ind: "ว 3.2 ป.6/1 เปรียบเทียบกระบวนการเกิดหินอัคนี หินตะกอน และหินแปร และอธิบายวัฏจักรหินจากแบบจำลอง (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/2 บรรยายและยกตัวอย่างการใช้ประโยชน์ของหินและแร่ในชีวิตประจำวันจากข้อมูลที่รวบรวมได้ (ตัวชี้วัดระหว่างทาง)|ว 3.2 ป.6/3 สร้างแบบจำลองที่อธิบายการเกิดซากดึกดำบรรพ์และคาดคะเนสภาพแวดล้อมในอดีตของซากดึกดำบรรพ์ (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/6 บรรยายลักษณะและผลกระทบของน้ำท่วม การกัดเซาะชายฝั่ง ดินถล่ม แผ่นดินไหว สึนามิ (ตัวชี้วัดระหว่างทาง)|ว 3.2 ป.6/7 ตระหนักถึงผลกระทบของภัยธรรมชาติและธรณีพิบัติภัย โดยนำเสนอแนวทางในการเฝ้าระวังและปฏิบัติตนให้ปลอดภัยจากภัยธรรมชาติและธรณีพิบัติภัยที่อาจเกิดในท้องถิ่น (ตัวชี้วัดปลายทาง)", w: 10, term: 2, hours: 20 },
    { name: "แสง เงา ดาราศาสตร์และเทคโนโลยีอวกาศ", subject: "วิทยาศาสตร์", ind: "ว 2.3 ป.6/7 อธิบายการเกิดเงามืด เงามัวจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/8 เขียนแผนภาพรังสีของแสงแสดงการเกิดเงามืดเงามัว (ตัวชี้วัดระหว่างทาง)|ว 3.1 ป.6/1 สร้างแบบจำลองที่อธิบายการเกิด และเปรียบเทียบปรากฏการณ์สุริยุปราคาและจันทรุปราคา (ตัวชี้วัดปลายทาง)|ว 3.1 ป.6/2 อธิบายพัฒนาการของเทคโนโลยีอวกาศ และยกตัวอย่างการนำเทคโนโลยีอวกาศมาใช้ประโยชน์ในชีวิตประจำวัน จากข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)", w: 8, term: 2, hours: 20 },
    { name: "การแก้ปัญหาโดยใช้เหตุผลเชิงตรรกะ", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.6/1 ใช้เหตุผลเชิงตรรกะในการอธิบายและออกแบบวิธีการแก้ปัญหาที่พบในชีวิตประจำวัน (ตัวชี้วัดปลายทาง)", w: 5, term: 1, hours: 10 },
    { name: "การออกแบบและเขียนโปรแกรมอย่างง่าย", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.6/2 ออกแบบและเขียนโปรแกรมอย่างง่ายเพื่อแก้ปัญหาในชีวิตประจำวัน ตรวจหาข้อผิดพลาดของโปรแกรมและแก้ไข (ตัวชี้วัดระหว่างทาง)", w: 5, term: 1, hours: 10 },
    { name: "การใช้งานอินเทอร์เน็ตอย่างมีประสิทธิภาพ", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.6/3 ใช้อินเทอร์เน็ตในการค้นหาข้อมูลอย่างมีประสิทธิภาพ (ตัวชี้วัดปลายทาง)", w: 4, term: 2, hours: 10 },
    { name: "ความปลอดภัยในการใช้งานเทคโนโลยีสารสนเทศ", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.6/4 ใช้เทคโนโลยีสารสนเทศทำงานร่วมกันอย่างปลอดภัย เข้าใจสิทธิและหน้าที่ของตน เคารพในสิทธิของผู้อื่น แจ้งผู้เกี่ยวข้องเมื่อพบข้อมูลหรือบุคคลที่ไม่เหมาะสม (ตัวชี้วัดปลายทาง)", w: 4, term: 2, hours: 10 }
];
const p5Units = [
    { name: "เรียนรู้วิทยาศาสตร์", subject: "วิทยาศาสตร์", ind: "-", w: 0, hours: 2, term: 1 },
    { name: "การเปลี่ยนแปลง", subject: "วิทยาศาสตร์", ind: "ว 2.1 ป.5/1อธิบายการเปลี่ยนสถานะของสสารเมื่อทำให้สสารร้อนขึ้นหรือเย็นลง โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.1 ป.5/2อธิบายการละลายของสารในน้ำ โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.1 ป.5/3วิเคราะห์การเปลี่ยนแปลงของสารเมื่อเกิดการเปลี่ยนแปลงทางเคมี โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.1 ป.5/4วิเคราะห์และระบุการเปลี่ยนแปลงที่ผันกลับได้และการเปลี่ยนแปลงที่ผันกลับไม่ได้ (ตัวชี้วัดปลายทาง)", w: 5, hours: 12, term: 1 },
    { name: "แรงในชีวิตประจำวัน", subject: "วิทยาศาสตร์", ind: "ว 2.2 ป.5/1อธิบายวิธีการหาแรงลัพธ์ของแรงหลายแรงในแนวเดียวกันที่กระทำต่อวัตถุในกรณีที่วัตถุอยู่นิ่งจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.2 ป.5/2เขียนแผนภาพแสดงแรงที่กระทำต่อวัตถุที่อยู่ในแนวเดียวกันและแรงลัพธ์ที่กระทำต่อวัตถุ (ตัวชี้วัดระหว่างทาง)|ว 2.2 ป.5/3ใช้เครื่องชั่งสปริงในการวัดแรงที่กระทำต่อวัตถุ (ตัวชี้วัดระหว่างทาง)|ว 2.2 ป.5/4ระบุผลของแรงเสียดทานที่มีต่อการเปลี่ยนแปลงการเคลื่อนที่ของวัตถุจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.2 ป.5/5เขียนแผนภาพแสดงแรงเสียดทานและแรงที่อยู่ในแนวเดียวกันที่กระทำต่อวัตถุ (ตัวชี้วัดระหว่างทาง)", w: 5, hours: 10, term: 1 },
    { name: "วิทยาศาสตร์น่ารู้", subject: "วิทยาศาสตร์", ind: "-", w: 0, hours: 4, term: 1 },
    { name: "ความหลากหลายของสิ่งมีชีวิต", subject: "วิทยาศาสตร์", ind: "ว 1.2 ป.4/1บรรยายหน้าที่ของราก ลำต้น ใบ และดอกของพืชดอก โดยใช้ข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)|ว 1.3 ป.4/1จำแนกสิ่งมีชีวิตโดยใช้ความเหมือน และความแตกต่างของลักษณะของสิ่งมีชีวิตออกเป็นกลุ่มพืช กลุ่มสัตว์ และกลุ่มที่ไม่ใช่พืชและสัตว์ (ตัวชี้วัดระหว่างทาง)|ว 1.3 ป.4/2จำแนกพืชออกเป็นพืชดอกและพืชไม่มีดอก โดยใช้การมีดอกเป็นเกณฑ์ โดยใช้ข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)|ว 1.3 ป.4/3จำแนกสัตว์ออกเป็นสัตว์มีกระดูกสันหลังและสัตว์ไม่มีกระดูกสันหลัง โดยใช้การมีกระดูกสันหลังเป็นเกณฑ์ โดยใช้ข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)|ว 1.3 ป.4/4บรรยายลักษณะเฉพาะที่สังเกตได้ของสัตว์มีกระดูกสันหลังในกลุ่มปลา กลุ่มสัตว์สะเทินน้ำ สะเทินบก กลุ่มสัตว์ เลื้อยคลาน กลุ่มนก และกลุ่มสัตว์เลี้ยงลูกด้วยน้ำนม และยกตัวอย่างสิ่งมีชีวิตในแต่ละกลุ่ม (ตัวชี้วัดระหว่างทาง)", w: 10, hours: 26, term: 1 },
    { name: "แรงโน้มถ่วงของโลกและตัวกลางของแสง", subject: "วิทยาศาสตร์", ind: "ว 2.2 ป.4/1ระบุผลของแรงโน้มถ่วงที่มีต่อวัตถุจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.2 ป.4/2ใช้เครื่องชั่งสปริงในการวัดน้ำหนักของวัตถุ (ตัวชี้วัดระหว่างทาง)|ว 2.2 ป.4/3บรรยายมวลของวัตถุที่มีผลต่อการเปลี่ยนแปลงการเคลื่อนที่ของวัตถุจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.4/1จำแนกวัตถุเป็นตัวกลางโปร่งใส ตัวกลางโปร่งแสง และวัตถุทึบแสง จากลักษณะการมองเห็นสิ่งต่าง ๆ ผ่านวัตถุนั้นเป็นเกณฑ์ โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)", w: 10, hours: 30, term: 1 },
    { name: "ขั้นตอนวิธีการแก้ปัญหา", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.4/1ใช้เหตุผลเชิงตรรกะในการแก้ปัญหาการอธิบายการทำงาน การคาดการณ์ผลลัพธ์จากปัญหาอย่างง่าย (ตัวชี้วัดปลายทาง)", w: 5, hours: 7, term: 1 },
    { name: "การเขียนโปรแกรมอย่างง่ายด้วยภาษาสแกร็ตช์ (Scratch)", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.4/2ออกแบบ และเขียนโปรแกรมอย่างง่ายโดยใช้ซอฟต์แวร์หรือสื่อ และตรวจหาข้อผิดพลาด (ตัวชี้วัดระหว่างทาง)", w: 5, hours: 7, term: 1 },
    { name: "การใช้งานอินเทอร์เน็ต", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.4/3ใช้อินเทอร์เน็ตค้นหาความรู้ และประเมินความน่าเชื่อถือของข้อมูล (ตัวชี้วัดปลายทาง)", w: 5, hours: 6, term: 1 },
    { name: "วัสดุและสสาร", subject: "วิทยาศาสตร์", ind: "ว 2.1 ป.4/1เปรียบเทียบสมบัติทางกายภาพด้านความแข็ง สภาพยืดหยุ่น การนำความร้อน และการนำไฟฟ้าของวัสดุโดยใช้หลักฐานเชิงประจักษ์จากการทดลองและระบุการนำสมบัติเรื่องความแข็ง สภาพยืดหยุ่น การนำความร้อน และการนำไฟฟ้าของวัสดุไปใช้ในชีวิตประจำวันผ่านกระบวนการออกแบบชิ้นงาน (ตัวชี้วัดระหว่างทาง)|ว 2.1 ป.4/2แลกเปลี่ยนความคิดกับผู้อื่นโดยการอภิปรายเกี่ยวกับสมบัติทางกายภาพของวัสดุอย่างมีเหตุผลจากการทดลอง (ตัวชี้วัดปลายทาง)|ว 2.1 ป.4/3เปรียบเทียบสมบัติของสสารทั้ง ๓ สถานะ จากข้อมูลที่ได้จากการสังเกตมวล การต้องการที่อยู่ รูปร่างและปริมาตรของสสาร (ตัวชี้วัดปลายทาง)|ว 2.1 ป.4/4ใช้เครื่องมือเพื่อวัดมวล และปริมาตรของสสารทั้ง ๓ สถานะ (ตัวชี้วัดระหว่างทาง)", w: 10, hours: 26, term: 2 },
    { name: "ระบบสุริยะและการปรากฏของดวงจันทร์", subject: "วิทยาศาสตร์", ind: "ว 3.1 ป.4/1อธิบายแบบรูปเส้นทางการขึ้นและตกของดวงจันทร์ โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 3.1 ป.4/2สร้างแบบจำลองที่อธิบายแบบรูปการเปลี่ยนแปลงรูปร่างปรากฏของดวงจันทร์ และพยากรณ์รูปร่างปรากฏของดวงจันทร์ (ตัวชี้วัดปลายทาง)|ว 3.1 ป.4/3สร้างแบบจำลองแสดงองค์ประกอบของระบบสุริยะ และอธิบายเปรียบเทียบคาบการโคจรของดาวเคราะห์ต่าง ๆ จากแบบจำลอง (ตัวชี้วัดปลายทาง)", w: 10, hours: 24, term: 2 },
    { name: "การนำเสนอข้อมูลด้วยซอฟต์แวร์", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.4/4รวบรวม ประเมิน นำเสนอข้อมูลและสารสนเทศ โดยใช้ซอฟต์แวร์ที่หลากหลาย เพื่อแก้ปัญหาในชีวิตประจำวัน (ตัวชี้วัดปลายทาง)", w: 8, hours: 15, term: 2 },
    { name: "การใช้เทคโนโลยีอย่างปลอดภัย", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.4/5ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย เข้าใจสิทธิและหน้าที่ของตน เคารพในสิทธิของผู้อื่น แจ้งผู้เกี่ยวข้องเมื่อพบข้อมูลหรือบุคคลที่ไม่เหมาะสม (ตัวชี้วัดปลายทาง)", w: 7, hours: 15, term: 2 },
];

const p3Units = [
    { name: "เรียนรู้วิทยาศาสตร์", subject: "วิทยาศาสตร์", ind: "-", w: 0, hours: 2, term: 1 },
    { name: "ปัจจัยที่จำเป็นต่อการดำรงชีวิตและการเจริญเติบโตของมนุษย์", subject: "วิทยาศาสตร์", ind: "ว 1.2 ป.3/1บรรยายสิ่งที่จำเป็นต่อการดำรงชีวิต และการเจริญเติบโตของมนุษย์และสัตว์ โดยใช้ข้อมูลที่รวบรวมได้ (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.3/2ตระหนักถึงประโยชน์ของอาหาร น้ำ และอากาศ โดยการดูแลตนเองและสัตว์ให้ได้รับสิ่งเหล่านี้อย่างเหมาะสม (ตัวชี้วัดปลายทาง)|ว 1.2 ป.3/3สร้างแบบจำลองที่บรรยายวัฏจักรชีวิตของสัตว์ และเปรียบเทียบวัฏจักรชีวิตของสัตว์บางชนิด (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.3/4ตระหนักถึงคุณค่าของชีวิตสัตว์ โดยไม่ทำให้วัฏจักรชีวิตของสัตว์เปลี่ยนแปลง (ตัวชี้วัดปลายทาง)", w: 7, hours: 10, term: 1 },
    { name: "วัสดุมหัศจรรย์", subject: "วิทยาศาสตร์", ind: "ว 2.1 ป.3/1อธิบายว่าวัตถุประกอบขึ้นจากชิ้นส่วนย่อย ๆ ซึ่งสามารถแยกออกจากกันได้และประกอบกันเป็นวัตถุชิ้นใหม่ได้ โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.1 ป.3/2อธิบายการเปลี่ยนแปลงของวัสดุเมื่อทำให้ร้อนขึ้นหรือทำให้เย็นลง โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)", w: 7, hours: 10, term: 1 },
    { name: "แรงในชีวิตประจำวัน", subject: "วิทยาศาสตร์", ind: "ว 2.2 ป.3/1ระบุผลของแรงที่มีต่อการเปลี่ยนแปลงการเคลื่อนที่ของวัตถุจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.2 ป.3/2 เปรียบเทียบและยกตัวอย่างแรงสัมผัสและแรงไม่สัมผัสที่มีผลต่อการเคลื่อนที่ของวัตถุโดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.2 ป.3/3จำแนกวัตถุโดยใช้การดึงดูดกับแม่เหล็กเป็นเกณฑ์จากหลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.2 ป.3/4ระบุขั้วแม่เหล็กและพยากรณ์ผลที่เกิดขึ้นระหว่างขั้วแม่เหล็กเมื่อนำมาเข้าใกล้กันจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)", w: 6, hours: 8, term: 1 },
    { name: "อัลกอริทึมกับการแก้ปัญหา", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.3/1 แสดงอัลกอริทึมในการทำงานหรือการแก้ปัญหาอย่างง่ายโดยใช้ภาพ สัญลักษณ์ หรือข้อความ (ตัวชี้วัดปลายทาง)", w: 5, hours: 10, term: 1 },
    { name: "การเขียนโปรแกรมอย่างง่าย", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.3/2เขียนโปรแกรมอย่างง่ายโดยใช้ซอฟต์แวร์หรือสื่อ และตรวจหาข้อผิดพลาดของโปรแกรม (ตัวชี้วัดระหว่างทาง)", w: 5, hours: 10, term: 1 },
    { name: "อินเทอร์เน็ตและเทคโนโลยีสารสนเทศ", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.3/3ใช้อินเทอร์เน็ตค้นหาความรู้ (ตัวชี้วัดปลายทาง)|ว 4.2 ป.3/5ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ปฏิบัติตามข้อตกลงในการใช้อินเทอร์เน็ต (ตัวชี้วัดปลายทาง)", w: 5, hours: 10, term: 1 },
    { name: "สนุกกับพลังงาน", subject: "วิทยาศาสตร์", ind: "ว 2.3 ป.3/1ยกตัวอย่างการเปลี่ยนพลังงานหนึ่งไปเป็นอีกพลังงานหนึ่งจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 2.3 ป.3/2 บรรยายการทำงานของเครื่องกำเนิดไฟฟ้าและระบุแหล่งพลังงานในการผลิตไฟฟ้า จากข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.3/3 ตระหนักในประโยชน์และโทษของไฟฟ้า โดยนำเสนอวิธีการใช้ไฟฟ้า อย่างประหยัด และปลอดภัย (ตัวชี้วัดปลายทาง)", w: 9, hours: 13, term: 2 },
    { name: "อากาศบนโลก", subject: "วิทยาศาสตร์", ind: "ว 3.2 ป.3/1    ระบุส่วนประกอบของอากาศ บรรยายความสำคัญของอากาศ และผลกระทบของมลพิษทางอากาศต่อสิ่งมีชีวิต จากข้อมูลที่รวบรวมได้ (ตัวชี้วัดระหว่างทาง)|ว 3.2 ป.3/2 ตระหนักถึงความสำคัญของอากาศ โดยนำเสนอแนวทางการปฏิบัติตนในการลดการเกิดมลพิษทางอากาศ (ตัวชี้วัดปลายทาง)|ว 3.2 ป.3/3 อธิบายการเกิดลมจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 3.2 ป.3/4 บรรยายประโยชน์และโทษของลม จากข้อมูลที่รวบรวมได้(ตัวชี้วัดระหว่างทาง)", w: 8, hours: 13, term: 2 },
    { name: "ดวงอาทิตย์กับชีวิต", subject: "วิทยาศาสตร์", ind: "ว 3.1 ป.3/1อธิบายแบบรูปเส้นทางการขึ้นและตกของดวงอาทิตย์โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดระหว่างทาง)|ว 3.1 ป.3/2 อธิบายสาเหตุการเกิดปรากฏการณ์การขึ้นและตกของดวงอาทิตย์ การเกิดกลางวันกลางคืนและการกำหนดทิศ โดยใช้แบบจำลอง (ตัวชี้วัดปลายทาง)|ว 3.1 ป.3/3ตระหนักถึงความสำคัญของดวงอาทิตย์ โดยบรรยายประโยชน์ของดวงอาทิตย์ต่อสิ่งมีชีวิต (ตัวชี้วัดระหว่างทาง)", w: 8, hours: 14, term: 2 },
    { name: "การรวบรวม ประมวลผลและนำเสนอข้อมูล", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.3/4รวบรวม ประมวลผล และนำเสนอข้อมูลโดยใช้ซอฟต์แวร์ตามวัตถุประสงค์ (ตัวชี้วัดปลายทาง)", w: 5, hours: 10, term: 2 },
    { name: "การใช้งานซอฟต์แวร์", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.3/4รวบรวม ประมวลผล และนำเสนอข้อมูลโดยใช้ซอฟต์แวร์ตามวัตถุประสงค์ (ตัวชี้วัดปลายทาง)", w: 5, hours: 10, term: 2 },
];
window.resetDefaultGradeStructure = async function() {
    const room = gradeEntryRoom ? gradeEntryRoom.value : gradeSetupRoom.value;
    if (!room) return;
    window.showPremiumConfirm("ยืนยันการรีเซ็ต", `ยืนยันการรีเซ็ตโครงสร้างรายวิชาของห้อง ${room} เป็นค่าเริ่มต้นหรือไม่?\n⚠️ ข้อมูลโครงสร้างเดิมของห้องนี้จะถูกลบทั้งหมด`, async () => {
    
    try {
        const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
        // Delete the document so it forces a reload from defaults
        await deleteDoc(docRef);
        window.showToast("🔄 รีเซ็ตข้อมูลเรียบร้อย กำลังโหลดค่าเริ่มต้น...");
        await loadGradeStructure(room);
    } catch(e) {
        console.error(e);
        window.showToast("❌ เกิดข้อผิดพลาดในการรีเซ็ต");
    }
    });
};


async function loadGradeStructure(room) {
    try {
        const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().units && docSnap.data().units.length > 0) {
            currentGradeStructure = docSnap.data();
            if(!currentGradeStructure.units) currentGradeStructure.units = [];
            if(!currentGradeStructure.assignments) currentGradeStructure.assignments = [];
            if(!currentGradeStructure.midtermWeight) currentGradeStructure.midtermWeight = 0;
            if(!currentGradeStructure.finalWeight) currentGradeStructure.finalWeight = 0;
            if(!currentGradeStructure.midtermRaw) currentGradeStructure.midtermRaw = 0;
            if(!currentGradeStructure.finalRaw) currentGradeStructure.finalRaw = 0;
        } else {
            let defaultUnits = [];
            if (room.includes("ป.6")) defaultUnits = p6Units;
            else if (room.includes("ป.5")) defaultUnits = p5Units;
            else if (room.includes("ป.4")) defaultUnits = p4Units;
            else if (room.includes("ป.3")) defaultUnits = p3Units;
            
            if (defaultUnits.length > 0) {
                let newStructure = { midtermWeight: 15, finalWeight: 15, midtermRaw: 30, finalRaw: 30, units: [], assignments: [] };
                const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
                });
                
                defaultUnits.forEach(u => {
                    let uid = generateUUID();
                    newStructure.units.push({
                        id: uid, name: u.name, subject: u.subject || "วิทยาศาสตร์", indicator: u.ind, weight: u.w, term: u.term || 1, hours: u.hours || null
                    });
                    newStructure.assignments.push({
                        id: generateUUID(), unitId: uid, name: "คะแนนระหว่างเรียน", fullScore: 10
                    });
                });
                currentGradeStructure = newStructure;
                await setDoc(docRef, currentGradeStructure);
            } else {
                currentGradeStructure = { midtermWeight: 0, finalWeight: 0, midtermRaw: 0, finalRaw: 0, units: [], assignments: [] };
            }
        }
        
        inputMidtermWeight.value = currentGradeStructure.midtermWeight;
        inputFinalWeight.value = currentGradeStructure.finalWeight;
        inputMidtermRaw.value = currentGradeStructure.midtermRaw || 0;
        inputFinalRaw.value = currentGradeStructure.finalRaw || 0;
        inputTargetHours.value = currentGradeStructure.targetHours || 160;
    if(inputTargetHours) inputTargetHours.value = currentGradeStructure.targetHours || 160;
        
        renderGradeStructureUI();
    } catch (e) {
        console.error(e);
        window.showToast("❌ โหลดข้อมูลโครงสร้างล้มเหลว");
    }
}

function renderGradeStructureUI() {
    let unitsWeight = 0;
    currentGradeStructure.units.forEach(u => unitsWeight += Number(u.weight));
    let midW = Number(currentGradeStructure.midtermWeight);
    let finW = Number(currentGradeStructure.finalWeight);
    let total = unitsWeight + midW + finW;
    
    gradeTotalWeight.innerText = total;
    gradeTotalUnitsWeight.innerText = unitsWeight;
    gradeMidtermWeight.innerText = midW;
    gradeFinalWeight.innerText = finW;
    
    if (total !== 100) {
        gradeTotalWeight.style.color = "var(--red)";
    } else {
        gradeTotalWeight.style.color = "var(--green)";
    }

    unitCardsContainer.innerHTML = "";
    if (currentGradeStructure.units.length === 0) {
        unitCardsContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding: 40px 20px; font-size: 15px; opacity: 0.7;">
            <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
            ยังไม่มีหน่วยการเรียนรู้ กรุณากดปุ่ม "+ เพิ่มหน่วยใหม่"
        </div>`;
    } else {
        const groupedUnits = currentGradeStructure.units.reduce((acc, u) => {
            const sub = u.subject || "วิทยาศาสตร์";
            if(!acc[sub]) acc[sub] = [];
            acc[sub].push(u);
            return acc;
        }, {});
        
        const subjectIcons = { "วิทยาศาสตร์": "🔬", "วิทยาการคำนวณ": "💻" };
        const subjectColors = { "วิทยาศาสตร์": "linear-gradient(135deg, #10b981, #059669)", "วิทยาการคำนวณ": "linear-gradient(135deg, #6366f1, #4f46e5)" };

        Object.keys(groupedUnits).forEach(subjectName => {
            let subjectHeader = document.createElement("div");
            subjectHeader.style.cssText = "display:flex; align-items:center; gap:10px; margin:25px 0 12px 0; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08);";
            const icon = subjectIcons[subjectName] || "📘";
            const gradient = subjectColors[subjectName] || "linear-gradient(135deg, #f59e0b, #d97706)";
            subjectHeader.innerHTML = `
                <div style="background:${gradient}; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">${icon}</div>
                <span style="font-size:15px; font-weight:700; color:var(--gold-luxury); letter-spacing:0.5px;">รายวิชา${subjectName}</span>
                <span style="font-size:12px; color:var(--text-muted); background:rgba(255,255,255,0.05); padding:2px 10px; border-radius:20px;">${groupedUnits[subjectName].length} หน่วย</span>
            `;
            unitCardsContainer.appendChild(subjectHeader);
            
            groupedUnits[subjectName].forEach((unit, index) => {
                let shortIndicator = "-";
                if (unit.indicator && unit.indicator !== "-") {
                    let indList = unit.indicator.split("|").map(i => {
                        let match = i.trim().match(/^([ก-ฮ]\s*\d+\.\d+\s*[ปม]\.\d+\/\d+)/);
                        if (match) return match[1];
                        return "";
                    }).filter(Boolean);
                    shortIndicator = indList.length > 0 ? indList.join(", ") : unit.indicator;
                }

                const termColor = (unit.term || 1) === 1 ? "#3b82f6" : "#8b5cf6";
                const unitDiv = document.createElement("div");
                unitDiv.style.cssText = "border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 18px; margin-bottom:10px; background:linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); backdrop-filter:blur(5px); transition:all 0.25s ease; cursor:default; position:relative; overflow:hidden;";
                unitDiv.onmouseenter = function() { this.style.borderColor = "rgba(255,255,255,0.12)"; this.style.background = "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"; this.style.transform = "translateY(-1px)"; this.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; };
                unitDiv.onmouseleave = function() { this.style.borderColor = "rgba(255,255,255,0.06)"; this.style.background = "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"; this.style.transform = "translateY(0)"; this.style.boxShadow = "none"; };
                unitDiv.innerHTML = `
                    <div style="position:absolute; top:0; left:0; width:3px; height:100%; background:${termColor}; border-radius:3px 0 0 3px;"></div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                        <div style="display:flex; align-items:flex-start; gap:12px; flex:1; min-width:0;">
                            <div style="min-width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, ${termColor}22, ${termColor}11); border:1px solid ${termColor}33; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:${termColor};">${index + 1}</div>
                            <div style="min-width:0; flex:1; text-align:left;">
                                <div style="font-size:14px; font-weight:700; color:var(--text-main); white-space:normal; line-height:1.4;">${unit.name}</div>
                                <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; align-items:flex-start;">
                                    <span style="font-size:11px; padding:3px 8px; border-radius:20px; background:${termColor}18; color:${termColor}; border:1px solid ${termColor}30; font-weight:600; white-space:nowrap; height: fit-content;">ภาคเรียน ${unit.term || 1}</span>
                                    <span style="font-size:11px; padding:3px 8px; border-radius:20px; background:rgba(245,158,11,0.1); color:#f59e0b; border:1px solid rgba(245,158,11,0.2); font-weight:600; white-space:nowrap; height: fit-content;">${unit.weight} คะแนน</span>
                                    ${shortIndicator !== "-" ? `<span style="font-size:11px; padding:3px 10px; border-radius:12px; background:rgba(255,255,255,0.04); color:var(--text-muted); line-height:1.5; white-space:normal; flex:1; min-width:200px;">${shortIndicator}</span>` : ""}
                                </div>
                            </div>
                        </div>
                        <button class="btn" style="padding:6px 12px; font-size:12px; background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); border-radius:8px; white-space:nowrap; transition:all 0.2s; align-self:center;" onmouseenter="this.style.background='rgba(239,68,68,0.2)'" onmouseleave="this.style.background='rgba(239,68,68,0.08)'" onclick="deleteUnit('${unit.id}')">🗑️ ลบ</button>
                    </div>
                `;
                unitCardsContainer.appendChild(unitDiv);
            });
        });
    }
}

async function saveGradeStructureToDB() {
    const room = gradeEntryRoom ? gradeEntryRoom.value : gradeSetupRoom.value;
    if(!room) return;
    try {
        await setDoc(doc(db, "grade_structure", room.replace(/\//g, "_")), currentGradeStructure);
        renderGradeStructureUI();
    } catch(e) {
        console.error(e);
        window.showToast("❌ เกิดข้อผิดพลาดในการบันทึก");
    }
}

btnSaveExamWeights.addEventListener("click", async () => {
    currentGradeStructure.midtermWeight = Number(inputMidtermWeight.value) || 0;
    currentGradeStructure.finalWeight = Number(inputFinalWeight.value) || 0;
    currentGradeStructure.midtermRaw = Number(inputMidtermRaw.value) || 0;
    currentGradeStructure.finalRaw = Number(inputFinalRaw.value) || 0;
    if(inputTargetHours) currentGradeStructure.targetHours = Number(inputTargetHours.value) || 160;
    await saveGradeStructureToDB();
    window.showToast("💾 บันทึกน้ำหนักสอบสำเร็จ");
});

btnConfirmAddUnit.addEventListener("click", async () => {
    const name = inputUnitName.value.trim();
    const subject = document.getElementById("inputUnitSubject") ? document.getElementById("inputUnitSubject").value : "วิทยาศาสตร์";
    const ind = inputUnitIndicator.value.trim();
    const w = Number(inputUnitWeight.value);
    
    if(!name || w <= 0) { window.showToast("⚠️ กรุณากรอกชื่อและน้ำหนักให้ถูกต้อง"); return; }
    
    currentGradeStructure.units.push({
        id: generateUUID(),
        name: name,
        subject: subject,
        indicator: ind,
        weight: w
    });
    
    document.getElementById('modalAddUnit').style.display = 'none';
    inputUnitName.value = "";
    inputUnitIndicator.value = "";
    inputUnitWeight.value = "10";
    
    await saveGradeStructureToDB();
    window.showToast("📚 บันทึกหน่วยการเรียนรู้สำเร็จ");
});

window.openAddUnitModal = function() {
    console.log("openAddUnitModal called");
    document.getElementById('modalAddUnit').style.display = 'flex';
};

window.openGradeSetupModal = function() {
    const room = gradeEntryRoom ? gradeEntryRoom.value : null;
    if (!room) {
        window.showToast("⚠️ กรุณาเลือกห้องเรียนก่อนครับ");
        return;
    }
    // Set the hidden gradeSetupRoom to match gradeEntryRoom
    gradeSetupRoom.value = room;
    // Update room label in modal header
    const roomLabel = document.getElementById('gradeSetupRoomLabel');
    if (roomLabel) {
        const selectedOpt = gradeEntryRoom.options[gradeEntryRoom.selectedIndex];
        roomLabel.textContent = selectedOpt ? selectedOpt.textContent : room;
    }
    // Load structure and show modal
    gradeSetupRoom.dispatchEvent(new Event('change'));
    document.getElementById('modalGradeSetup').style.display = 'flex';
};

// When modal closes, refresh the grade entry matrix
document.getElementById('modalGradeSetup').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        // Refresh grade entry data
        if (gradeEntryRoom && gradeEntryRoom.value) {
            gradeEntryRoom.dispatchEvent(new Event('change'));
        }
    }
});

window.deleteUnit = async function(unitId) {
    window.showPremiumConfirm("ยืนยันการลบหน่วยการเรียนรู้", "ยืนยันการลบหน่วยการเรียนรู้นี้? (ชิ้นงานภายในจะถูกลบด้วย)", async () => {
        currentGradeStructure.units = currentGradeStructure.units.filter(u => u.id !== unitId);
        currentGradeStructure.assignments = currentGradeStructure.assignments.filter(a => a.unitId !== unitId);
        await saveGradeStructureToDB();
        window.showToast("🗑️ ลบหน่วยการเรียนรู้สำเร็จ");
    });
};

window.openAddAssignmentModal = function(unitId) {
    inputAssignUnitId.value = unitId;
    inputAssignName.value = "";
    inputAssignMax.value = "10";
    document.getElementById('modalAddAssignment').style.display = 'flex';
};

btnConfirmAddAssign.addEventListener("click", async () => {
    const name = inputAssignName.value.trim();
    const max = Number(inputAssignMax.value);
    const unitId = inputAssignUnitId.value;
    
    if(!name || max <= 0) { window.showToast("⚠️ กรุณากรอกชื่อและคะแนนเต็มให้ถูกต้อง"); return; }
    
    currentGradeStructure.assignments.push({
        id: generateUUID(),
        unitId: unitId,
        name: name,
        fullScore: max
    });
    
    document.getElementById('modalAddAssignment').style.display = 'none';
    await saveGradeStructureToDB();
    window.showToast("📋 บันทึกชิ้นงานสำเร็จ");
});

window.deleteAssignment = async function(assignId) {
    window.showPremiumConfirm("ยืนยันการลบช่องเก็บคะแนน", "ยืนยันการลบช่องเก็บคะแนนนี้?", async () => {
        currentGradeStructure.assignments = currentGradeStructure.assignments.filter(a => a.id !== assignId);
        await saveGradeStructureToDB();
        window.showToast("🗑️ ลบช่องเก็บคะแนนสำเร็จ");
    });
};
// BLANK
// ================= [ 8. กรอกคะแนนดิบ (Grade Entry Matrix) ] =================
let currentGradeEntryStructure = null;
let currentGradeScores = {};
let currentStudentsList = []; // studentId -> { scores: {...} }
// BLANK
const gradeEntryRoom = document.getElementById("gradeEntryRoom");
const gradeEntryTerm = document.getElementById("gradeEntryTerm");
const gradeEntryUnit = document.getElementById("gradeEntryUnit");
const gradeEntryContainer = document.getElementById("gradeEntryContainer");
const gradeEntryInfo = document.getElementById("gradeEntryInfo");
const gradeEntryThead = document.getElementById("gradeEntryThead");
const gradeEntryTbody = document.getElementById("gradeEntryTbody");
const btnSaveGradeEntry = document.getElementById("btnSaveGradeEntry");
const gradeEntryTotalWeight = document.getElementById("gradeEntryTotalWeight");
// BLANK
// Elements for Add Assignment Modal
const btnConfirmAddAssignment = document.getElementById("btnConfirmAddAssignment");
// BLANK
async function loadGradeEntryData() {
    const room = gradeEntryRoom.value;
    gradeEntryContainer.style.display = "none";
    if(!room) return;
// BLANK
    // Load Structure
    const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) {
        currentGradeEntryStructure = docSnap.data();
        if(!currentGradeEntryStructure.units) currentGradeEntryStructure.units = [];
        if(!currentGradeEntryStructure.assignments) currentGradeEntryStructure.assignments = [];
    } else {
        currentGradeEntryStructure = { midtermWeight: 0, finalWeight: 0, units: [], assignments: [] };
    }
// BLANK
    // Load Scores for this room
    currentGradeScores = {};
    const studentsSnap = await getDocs(query(collection(db, "students"), where("room", "==", room), orderBy("studentNo", "asc")));
    currentStudentsList = [];
    studentsSnap.forEach(d => currentStudentsList.push({ id: d.id, ...d.data() }));
    const scoresSnap = await getDocs(query(collection(db, "grade_scores"), where("room", "==", room)));
    scoresSnap.forEach(doc => {
        currentGradeScores[doc.id] = doc.data().scores || {};
    });
    
    updateGradeEntryUnitDropdown();
    
    // Hook for Missing Work tracking
    if(document.getElementById("missingWorkModeContainer") && document.getElementById("missingWorkModeContainer").style.display === "block") {
        loadMissingWorkData();
    }
    
}
// BLANK
function updateGradeEntryUnitDropdown() {
    const term = gradeEntryTerm.value;
    gradeEntryUnit.innerHTML = '<option value="all">แสดงทุกหน่วยในภาคเรียนนี้ + สอบ</option>';
    
    if(!currentGradeEntryStructure) return;
    
    let subjectIndexes = {};
    let unitSubjectIndexMap = {};
    currentGradeEntryStructure.units.forEach(u => {
        let sub = u.subject || "วิทยาศาสตร์";
        if(!subjectIndexes[sub]) subjectIndexes[sub] = 1;
        unitSubjectIndexMap[u.id] = subjectIndexes[sub]++;
    });
    
    currentGradeEntryStructure.units.forEach(u => {
        if(term === "all" || u.term == term) {
            let opt = document.createElement("option");
            opt.value = "unit_" + u.id;
            opt.textContent = "📚 หน่วยที่ " + unitSubjectIndexMap[u.id] + " " + u.name + " (น้ำหนัก " + u.weight + ")";
            gradeEntryUnit.appendChild(opt);
        }
    });
    
    if((term === "1" || term === "all") && currentGradeEntryStructure.midtermWeight > 0) {
        let opt = document.createElement("option");
        opt.value = "exam_midterm";
        opt.textContent = "สอบกลางภาค (น้ำหนัก " + currentGradeEntryStructure.midtermWeight + ")";
        gradeEntryUnit.appendChild(opt);
    }
    if((term === "2" || term === "all") && currentGradeEntryStructure.finalWeight > 0) {
        let opt = document.createElement("option");
        opt.value = "exam_final";
        opt.textContent = "สอบปลายภาค (น้ำหนัก " + currentGradeEntryStructure.finalWeight + ")";
        gradeEntryUnit.appendChild(opt);
    }
    
    renderGradeEntryMatrix();
}
// BLANK
window.renderGradeEntryRoomTabs = function() {
    const tabsContainer = document.getElementById("gradeEntryRoomTabs");
    if(!tabsContainer || typeof gradeEntryRoom === "undefined") return;
    
    const options = Array.from(gradeEntryRoom.options);
    
    let autoSelected = false;
    if(!gradeEntryRoom.value && options.length > 1) {
        for(let i=0; i<options.length; i++) {
            if(options[i].value) {
                gradeEntryRoom.value = options[i].value;
                autoSelected = true;
                break;
            }
        }
    }
    
    if(autoSelected) {
        if(typeof loadGradeEntryData === "function") loadGradeEntryData();
    }
    
    if(typeof window.renderRadialMenuToContainer === "function") {
        window.renderRadialMenuToContainer(tabsContainer, gradeEntryRoom, () => {
            renderGradeEntryRoomTabs();
            if(typeof loadGradeEntryData === "function") loadGradeEntryData();
        });
    }
};
// BLANK
gradeEntryRoom.addEventListener("change", loadGradeEntryData);
gradeEntryTerm.addEventListener("change", updateGradeEntryUnitDropdown);
gradeEntryUnit.addEventListener("change", renderGradeEntryMatrix);
// BLANK
async function renderGradeEntryMatrix() {
    const room = gradeEntryRoom.value;
    if(!room || !currentGradeEntryStructure) return;
    
    gradeEntryContainer.style.display = "block";
    
    const studentsSnap = await getDocs(query(collection(db, "students"), where("room", "==", room), orderBy("studentNo", "asc")));
    let students = [];
    studentsSnap.forEach(d => students.push({ id: d.id, ...d.data() }));
    
    const termFilter = gradeEntryTerm.value;
    const unitFilter = gradeEntryUnit.value;
    
    let subjectIndexes = {};
    let unitSubjectIndexMap = {};
    if (currentGradeEntryStructure && currentGradeEntryStructure.units) {
        currentGradeEntryStructure.units.forEach(u => {
            let sub = u.subject || "วิทยาศาสตร์";
            if(!subjectIndexes[sub]) subjectIndexes[sub] = 1;
            unitSubjectIndexMap[u.id] = subjectIndexes[sub]++;
        });
    }
    
    // Determine which columns to show
    let columns = []; // { type: 'unit'|'exam', data: {...}, assigns: [...] }
    let totalDisplayedWeight = 0;
    
    if(unitFilter === "all") {
        currentGradeEntryStructure.units.forEach(u => {
            if(termFilter === "all" || u.term == termFilter) {
                let assigns = currentGradeEntryStructure.assignments.filter(a => a.unitId === u.id);
                assigns.sort((a, b) => (a.indicator || "").localeCompare(b.indicator || ""));
                columns.push({ type: 'unit', data: u, assigns: assigns });
                totalDisplayedWeight += Number(u.weight || 0);
            }
        });
        if((termFilter === "1" || termFilter === "all") && currentGradeEntryStructure.midtermWeight > 0) {
            columns.push({ type: 'exam', id: 'midterm', name: 'สอบกลางภาค', weight: currentGradeEntryStructure.midtermWeight, rawMax: currentGradeEntryStructure.midtermRaw || 0 });
            totalDisplayedWeight += Number(currentGradeEntryStructure.midtermWeight || 0);
        }
        if((termFilter === "2" || termFilter === "all") && currentGradeEntryStructure.finalWeight > 0) {
            columns.push({ type: 'exam', id: 'final', name: 'สอบปลายภาค', weight: currentGradeEntryStructure.finalWeight, rawMax: currentGradeEntryStructure.finalRaw || 0 });
            totalDisplayedWeight += Number(currentGradeEntryStructure.finalWeight || 0);
        }
    } else if(unitFilter.startsWith("unit_")) {
        let targetId = unitFilter.replace("unit_", "");
        let u = currentGradeEntryStructure.units.find(x => x.id === targetId);
        if(u) {
            let assigns = currentGradeEntryStructure.assignments.filter(a => a.unitId === u.id);
            assigns.sort((a, b) => (a.indicator || "").localeCompare(b.indicator || ""));
            columns.push({ type: 'unit', data: u, assigns: assigns });
            totalDisplayedWeight += Number(u.weight || 0);
        }
    } else if(unitFilter.startsWith("exam_")) {
        let targetId = unitFilter.replace("exam_", "");
        let weight = targetId === "midterm" ? currentGradeEntryStructure.midtermWeight : currentGradeEntryStructure.finalWeight;
        let rawMax = targetId === "midterm" ? currentGradeEntryStructure.midtermRaw : currentGradeEntryStructure.finalRaw;
        let name = targetId === "midterm" ? "สอบกลางภาค" : "สอบปลายภาค";
        columns.push({ type: 'exam', id: targetId, name: name, weight: weight, rawMax: rawMax });
        totalDisplayedWeight += Number(weight || 0);
    }
    
    gradeEntryTotalWeight.innerText = totalDisplayedWeight;
    
    gradeEntryThead.innerHTML = "";
    gradeEntryTbody.innerHTML = "";
    
    // Header Row 1 (Units)
    let tr1 = document.createElement("tr");
    tr1.innerHTML = "<th rowspan=\"2\" class=\"sticky-col\" style=\"width: 60px; text-align: center; vertical-align: middle;\">เลขที่</th>" +
                    "<th rowspan=\"2\" class=\"sticky-col-2\" style=\"width: 200px; text-align: left; vertical-align: middle;\">ชื่อ - นามสกุล</th>";
    
    // Header Row 2 (Assignments)
    let tr2 = document.createElement("tr");
    tr2.innerHTML = "";
    
    let prevSubject = null;
    
    columns.forEach(col => {
        if(col.type === 'unit') {
            let currentSubject = col.data.subject || "วิทยาศาสตร์";
            let subjectDiv = "";
            let isComputing = (currentSubject !== "วิทยาศาสตร์");
            
            if (prevSubject && currentSubject !== prevSubject) {
                // border removed as requested
                subjectDiv = "";
            }
            prevSubject = currentSubject;
            col.subjectDiv = subjectDiv;
            col.isComputing = isComputing;
            
            let headColor = isComputing ? "#e9d5ff" : "var(--blue-pearl)";
            let btnColor = isComputing ? "#c084fc" : "var(--blue-pearl)";
            let bgStyle1 = isComputing ? "background: linear-gradient(180deg, rgba(168, 85, 247, 0.25) 0%, rgba(88, 28, 135, 0.45) 100%) !important; " : "";
            let bgStyle2 = isComputing ? "background: rgba(88, 28, 135, 0.45) !important; " : "";
            
            let colspan = col.assigns.length > 0 ? col.assigns.length + 1 : 2;
            let subjectIdx = unitSubjectIndexMap[col.data.id] || 1;
            let unitPrefix = "หน่วยที่ " + subjectIdx + ": ";
            tr1.innerHTML += "<th colspan=\"" + colspan + "\" style=\"position: relative; text-align: center; color: " + headColor + "; font-size: 13px; padding: 15px; " + subjectDiv + bgStyle1 + "\">" +
                                   "<div>" + unitPrefix + col.data.name + "<br><span style=\"color:var(--text-muted); font-weight:normal;\">น้ำหนัก: " + col.data.weight + " คะแนน</span></div>" +
                                   "<button onclick=\"openAddAssignmentModal('" + col.data.id + "', '" + col.data.name + "')\" style=\"margin-top: 8px; padding: 4px 12px; font-size: 11px; border-radius: 12px; background: transparent; border: 1px solid " + btnColor + "; color: " + btnColor + "; cursor: pointer; transition: all 0.2s;\" onmouseover=\"this.style.background='" + btnColor + "'; this.style.color='#fff';\" onmouseout=\"this.style.background='transparent'; this.style.color='" + btnColor + "';\">+ เพิ่มชิ้นงาน</button>" +
                              "</th>";
            
            if(col.assigns.length > 0) {
                col.assigns.forEach((a, aIdx) => {
                    let indTxt = "";
                    if(a.indicator && a.indicator.trim() !== "" && a.indicator !== "-") {
                        let shortMatch = a.indicator.match(/^(ว\s*\d+\.\d+\s*ป\.\d+\/\d+)/);
                        let shortInd = shortMatch ? shortMatch[1] : a.indicator;
                        if(shortInd.indexOf("(") > -1) shortInd = shortInd.substring(0, shortInd.indexOf("(")).trim();
                        indTxt = "<br><span style=\"font-size:10px; color:" + headColor + ";\">" + shortInd + "</span>";
                    }
                    let thDivStyle = ((aIdx === 0 && subjectDiv !== "") ? subjectDiv : "") + bgStyle2;
                    tr2.innerHTML += "<th class=\"unit-group-bg\" style=\"text-align: center; font-size: 12px; font-weight: normal; color: #cbd5e1; padding: 12px 10px; min-width: 80px; " + thDivStyle + "\"><div style=\"margin-top: 5px;\">" + a.name.trim() + " <span onclick=\"deleteAssignment('" + a.id + "')\" style=\"cursor:pointer; margin-left:4px; font-size:12px;\" title=\"ลบชิ้นงานนี้\">🗑️</span></div>" + indTxt + "<div style=\"font-size:10px; color:#aaa; margin-top:4px;\">(เต็ม " + a.fullScore + ")</div></th>";
                });
            } else {
                let thDivStyle = (subjectDiv !== "" ? subjectDiv : "") + bgStyle2;
                tr2.innerHTML += "<th class=\"unit-group-bg\" style=\"text-align: center; font-size: 12px; font-weight: normal; color: #64748b; " + thDivStyle + "\">(ยังไม่มีช่อง)<br><span style=\"font-size:10px;\">กรอกดิบที่แปลงแล้ว</span></th>";
            }
            tr2.innerHTML += "<th class=\"unit-group-bg\" style=\"text-align: center; font-size: 12px; font-weight: bold; color: var(--primary-color); " + bgStyle2 + "\">" + "<div style=\"margin-top:12px;\">แปลงแล้ว<br><span style=\"font-size:10px;\">(/" + col.data.weight + ")</span></div></th>";
        } else {
            let subjectDiv = "";
            if (prevSubject) {
                // border removed as requested
                subjectDiv = "";
            }
            prevSubject = null;
            col.subjectDiv = subjectDiv;
            tr1.innerHTML += "<th colspan=\"2\" style=\"text-align: center; color: var(--gold-luxury); font-size: 13px; " + subjectDiv + "\">" +
                                col.name + "<br><span style=\"color:var(--text-muted); font-weight:normal;\">น้ำหนัก: " + col.weight + " คะแนน</span>" +
                              "</th>";
            tr2.innerHTML += "<th style=\"text-align: center; font-size: 12px; font-weight: normal; color: #cbd5e1; " + subjectDiv + "\">" + "<div style=\"margin-top:12px;\">คะแนนสอบ<br><span style=\"font-size:10px; color:#aaa;\">(เต็มดิบ " + col.rawMax + ")</span></div></th>";
            tr2.innerHTML += "<th style=\"text-align: center; font-size: 12px; font-weight: bold; color: var(--gold-luxury);\">" + "<div style=\"margin-top:12px;\">แปลงแล้ว<br><span style=\"font-size:10px;\">(/" + col.weight + ")</span></div></th>";
        }
    });
    
        if(unitFilter === "all") {
            let maxT1 = 0;
            let maxT2 = 0;
            columns.forEach(col => {
                if(col.type === 'unit') {
                    if(col.data.term == 2) maxT2 += Number(col.data.weight) || 0;
                    else maxT1 += Number(col.data.weight) || 0;
                } else {
                    if(col.id === 'midterm') maxT1 += Number(col.weight) || 0;
                    else if(col.id === 'final') maxT2 += Number(col.weight) || 0;
                }
            });
// BLANK
            if(termFilter === "1" || termFilter === "all") {
                tr1.innerHTML += "<th rowspan=\"2\" style=\"width: 80px; text-align: center; vertical-align: middle; color: #10b981; background: rgba(16,185,129,0.1); border-left: 2px solid #10b981; box-shadow: -2px 0 5px rgba(0,0,0,0.1);\">รวมภาคเรียน 1<br><span style=\"font-size:10px; font-weight:normal;\">(เต็ม " + maxT1 + ")</span></th>";
            }
            if(termFilter === "2" || termFilter === "all") {
                tr1.innerHTML += "<th rowspan=\"2\" style=\"width: 80px; text-align: center; vertical-align: middle; color: #3b82f6; background: rgba(59,130,246,0.1); border-left: 2px solid #3b82f6; box-shadow: -2px 0 5px rgba(0,0,0,0.1);\">รวมภาคเรียน 2<br><span style=\"font-size:10px; font-weight:normal;\">(เต็ม " + maxT2 + ")</span></th>";
            }
            if(termFilter === "all") {
                tr1.innerHTML += "<th rowspan=\"2\" style=\"width: 90px; text-align: center; vertical-align: middle; color: #f59e0b; background: rgba(245,158,11,0.1); border-left: 2px solid #f59e0b; box-shadow: -2px 0 5px rgba(0,0,0,0.1);\">รวมทั้งปี<br><span style=\"font-size:10px; font-weight:normal;\">(เต็ม " + (maxT1+maxT2) + ")</span></th>";
                tr1.innerHTML += "<th rowspan=\"2\" style=\"width: 70px; text-align: center; vertical-align: middle; color: #ec4899; background: rgba(236,72,153,0.1); border-left: 2px solid #ec4899; box-shadow: -2px 0 5px rgba(0,0,0,0.1);\">เกรด</th>";
            }
        }
        
    gradeEntryThead.appendChild(tr1);
    gradeEntryThead.appendChild(tr2);
    
    // Body Rows
    students.forEach(s => {
        let tr = document.createElement("tr");
        let html = "<td class=\"sticky-col\" style=\"text-align: center;\">" + s.studentNo + "</td>" +
                   "<td class=\"sticky-col-2\">" + s.fullName + "</td>";
        
        const myScores = currentGradeScores[s.id] || {};
        
        columns.forEach(col => {
            if(col.type === 'unit') {
                let bgBody = col.isComputing ? "background: rgba(168, 85, 247, 0.08) !important; " : "";
                if(col.assigns.length > 0) {
                    col.assigns.forEach((a, aIdx) => {
                        let sval = myScores[a.id] !== undefined ? myScores[a.id] : "";
                        let tdDivStyle = ((aIdx === 0 && col.subjectDiv) ? col.subjectDiv : "") + bgBody;
                        html += "<td class=\"unit-group-bg\" style=\"text-align: center; " + tdDivStyle + "\"><input type=\"number\" class=\"grade-pill-input score-input\" data-student=\"" + s.id + "\" data-assign=\"" + a.id + "\" data-max=\"" + a.fullScore + "\" data-type=\"unit-assign\" data-unit=\"" + col.data.id + "\" data-weight=\"" + col.data.weight + "\" value=\"" + sval + "\" onchange=\"updateGradeScoreMemory('" + s.id + "', '" + a.id + "', this.value)\"></td>";
                    });
                    // Calculated column (readonly visual)
                    html += "<td class=\"unit-group-bg\" style=\"text-align: center; color: var(--primary-color); font-weight: 600; " + bgBody + "\" id=\"calc_" + col.data.id + "_" + s.id + "\">0</td>";
                } else {
                    // Fallback input if no assignments are defined (allow direct weight input)
                    let tdDivStyle = (col.subjectDiv ? col.subjectDiv : "") + bgBody;
                    let sval = myScores["unit_direct_"+col.data.id] !== undefined ? myScores["unit_direct_"+col.data.id] : "";
                    html += "<td class=\"unit-group-bg\" style=\"text-align: center; " + tdDivStyle + "\"><input type=\"number\" class=\"grade-pill-input score-input\" data-student=\"" + s.id + "\" data-assign=\"unit_direct_" + col.data.id + "\" data-max=\"" + col.data.weight + "\" data-type=\"unit-direct\" data-weight=\"" + col.data.weight + "\" value=\"" + sval + "\" onchange=\"updateGradeScoreMemory('" + s.id + "', 'unit_direct_" + col.data.id + "', this.value)\"></td>";
                    html += "<td class=\"unit-group-bg\" style=\"text-align: center; color: var(--primary-color); font-weight: 600; " + bgBody + "\" id=\"calc_" + col.data.id + "_" + s.id + "\">0</td>";
                }
            } else {
                let tdDivStyle = col.subjectDiv ? col.subjectDiv : "";
                let sval = myScores[col.id] !== undefined ? myScores[col.id] : "";
                html += "<td style=\"text-align: center; " + tdDivStyle + "\"><input type=\"number\" class=\"grade-pill-input score-input\" data-student=\"" + s.id + "\" data-assign=\"" + col.id + "\" data-max=\"" + col.rawMax + "\" data-type=\"exam\" data-weight=\"" + col.weight + "\" value=\"" + sval + "\" onchange=\"updateGradeScoreMemory('" + s.id + "', '" + col.id + "', this.value)\"></td>";
                html += "<td style=\"text-align: center; color: var(--gold-luxury); font-weight: 600;\" id=\"calc_" + col.id + "_" + s.id + "\">0</td>";
            }
        });
        
        if(unitFilter === "all") {
            if(termFilter === "1" || termFilter === "all") {
                html += "<td style=\"text-align: center; font-weight: bold; color: #10b981; border-left: 2px solid #10b981; background: rgba(16,185,129,0.05); box-shadow: -2px 0 5px rgba(0,0,0,0.05);\" id=\"sum_term1_" + s.id + "\">0</td>";
            }
            if(termFilter === "2" || termFilter === "all") {
                html += "<td style=\"text-align: center; font-weight: bold; color: #3b82f6; border-left: 2px solid #3b82f6; background: rgba(59,130,246,0.05); box-shadow: -2px 0 5px rgba(0,0,0,0.05);\" id=\"sum_term2_" + s.id + "\">0</td>";
            }
            if(termFilter === "all") {
                html += "<td style=\"text-align: center; font-weight: bold; color: #f59e0b; border-left: 2px solid #f59e0b; background: rgba(245,158,11,0.05); box-shadow: -2px 0 5px rgba(0,0,0,0.05);\" id=\"sum_total_" + s.id + "\">0</td>";
                html += "<td style=\"text-align: center; border-left: 2px solid #ec4899; background: rgba(236,72,153,0.05); box-shadow: -2px 0 5px rgba(0,0,0,0.05);\" id=\"calc_grade_" + s.id + "\">-</td>";
            }
        }
        
        tr.innerHTML = html;
        gradeEntryTbody.appendChild(tr);
    });
    
        // Calculation Listeners
    const inputs = document.querySelectorAll(".score-input");
    inputs.forEach(inp => {
        inp.addEventListener("input", () => {
            const sid = inp.getAttribute("data-student");
            const type = inp.getAttribute("data-type");
            const weight = Number(inp.getAttribute("data-weight")) || 0;
            
            if(type === "unit-assign") {
                const uid = inp.getAttribute("data-unit");
                let sumRaw = 0;
                let sumMax = 0;
                document.querySelectorAll(".score-input[data-student=\"" + sid + "\"][data-unit=\"" + uid + "\"]").forEach(i => {
                    let v = Number(i.value) || 0;
                    let m = Number(i.getAttribute("data-max")) || 1;
                    sumRaw += v;
                    sumMax += m;
                });
                let wScore = sumMax > 0 ? (sumRaw / sumMax) * weight : 0;
                document.getElementById("calc_" + uid + "_" + sid).innerText = Math.round(wScore);
            } else if(type === "unit-direct") {
                const uid = inp.getAttribute("data-assign").replace("unit_direct_", "");
                let v = Number(inp.value) || 0;
                document.getElementById("calc_" + uid + "_" + sid).innerText = Math.round(v);
            } else if(type === "exam") {
                const exId = inp.getAttribute("data-assign");
                let v = Number(inp.value) || 0;
                let m = Number(inp.getAttribute("data-max")) || 1;
                let wScore = m > 0 ? (v / m) * weight : 0;
                document.getElementById("calc_" + exId + "_" + sid).innerText = Math.round(wScore);
            }
            
            // Recalculate Summaries
            if(unitFilter === "all") {
                let sumT1 = 0;
                let sumT2 = 0;
                columns.forEach(col => {
                    let val = 0;
                    if(col.type === 'unit') {
                        let el = document.getElementById("calc_" + col.data.id + "_" + sid);
                        if(el) val = Number(el.innerText) || 0;
                        if(col.data.term == 2) sumT2 += val;
                        else sumT1 += val;
                    } else {
                        let el = document.getElementById("calc_" + col.id + "_" + sid);
                        if(el) val = Number(el.innerText) || 0;
                        if(col.id === 'midterm') sumT1 += val;
                        else if(col.id === 'final') sumT2 += val;
                    }
                });
                
                let elT1 = document.getElementById("sum_term1_" + sid);
                if(elT1) elT1.innerText = Math.round(sumT1);
                
                let elT2 = document.getElementById("sum_term2_" + sid);
                if(elT2) elT2.innerText = Math.round(sumT2);
                
                let elTot = document.getElementById("sum_total_" + sid);
                let totVal = Math.round(sumT1 + sumT2);
                if(elTot) elTot.innerText = totVal;
                
                let elGrade = document.getElementById("calc_grade_" + sid);
                if(elGrade) {
                    let grade = "0";
                    let gColor = "#ef4444"; // red for 0
                    if(totVal >= 80) { grade = "4"; gColor = "#10b981"; } // green
                    else if(totVal >= 75) { grade = "3.5"; gColor = "#34d399"; }
                    else if(totVal >= 70) { grade = "3"; gColor = "#3b82f6"; } // blue
                    else if(totVal >= 65) { grade = "2.5"; gColor = "#60a5fa"; }
                    else if(totVal >= 60) { grade = "2"; gColor = "#f59e0b"; } // yellow
                    else if(totVal >= 55) { grade = "1.5"; gColor = "#fbbf24"; }
                    else if(totVal >= 50) { grade = "1"; gColor = "#f97316"; } // orange
                    
                    elGrade.innerHTML = `<div style="display:inline-flex; justify-content:center; align-items:center; width:32px; height:32px; border-radius:50%; background:${gColor}; color:white; font-weight:bold; font-size:14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${grade}</div>`;
                }
            }
        });
        // Trigger initial
        inp.dispatchEvent(new Event("input"));
    });
    
    // Fix sticky header overlap dynamically on resize
    setTimeout(() => {
        let theadRow1 = gradeEntryThead.querySelector("tr:first-child");
        let theadRow2 = gradeEntryThead.querySelector("tr:nth-child(2)");
        let targetTh = theadRow1 ? theadRow1.querySelector("th[colspan]") : null;
        if(targetTh && theadRow2) {
            let h = targetTh.offsetHeight;
            let ths = theadRow2.querySelectorAll("th");
            // Removed manual top calculation
        }
    }, 150);
}
// BLANK
window.deleteAssignment = async function(assignId) {
    window.showPremiumConfirm("ลบช่องเก็บคะแนน", "⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบช่องเก็บคะแนนนี้? (คะแนนนักเรียนในช่องนี้จะถูกซ่อนไว้)", async () => {
    const room = gradeEntryRoom.value;
    if(!room || !currentGradeEntryStructure) return;
    
    currentGradeEntryStructure.assignments = currentGradeEntryStructure.assignments.filter(a => a.id !== assignId);
    
    const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
    await setDoc(docRef, currentGradeEntryStructure);
    
    window.showToast("🗑️ ลบช่องคะแนนสำเร็จ");
    renderGradeEntryMatrix();
    });
};
// BLANK
window.openAddAssignmentModal = function(unitId, unitName) {
    document.getElementById("modalAddAssignmentUnitId").value = unitId;
    document.getElementById("modalAddAssignmentUnitName").innerText = "หน่วย: " + unitName;
    document.getElementById("modalAddAssignmentName").value = "";
    document.getElementById("modalAddAssignmentMax").value = "10";
    
    // Populate indicators dropdown
    const indSelect = document.getElementById("modalAddAssignmentIndicator");
    if(indSelect) {
        indSelect.innerHTML = "<option value=\"-\">-- ไม่ระบุตัวชี้วัด --</option>";
        let u = currentGradeEntryStructure.units.find(x => x.id === unitId);
        if(u && u.indicator && u.indicator.trim() !== "" && u.indicator !== "-") {
            let inds = u.indicator.split("|");
            inds.forEach(ind => {
                let opt = document.createElement("option");
                opt.value = ind;
                opt.textContent = ind;
                opt.title = ind;
                indSelect.appendChild(opt);
            });
        }
    }
    
    document.getElementById("modalAddMatrixAssignment").style.display = "flex";
};
// BLANK
btnConfirmAddAssignment.addEventListener("click", async () => {
    const unitId = document.getElementById("modalAddAssignmentUnitId").value;
    const name = document.getElementById("modalAddAssignmentName").value.trim();
    const maxScore = Number(document.getElementById("modalAddAssignmentMax").value);
    
    let indicator = "-";
    const indSelect = document.getElementById("modalAddAssignmentIndicator");
    if(indSelect) {
        indicator = indSelect.value;
    }
    
    if(!name || maxScore <= 0) {
        window.showToast("⚠️ กรุณากรอกชื่อและคะแนนเต็มให้ถูกต้อง");
        return;
    }
    
    const room = gradeEntryRoom.value;
    if(!room || !currentGradeEntryStructure) return;
    
    currentGradeEntryStructure.assignments.push({
        id: "assign_" + Date.now() + Math.floor(Math.random()*1000),
        unitId: unitId,
        name: name,
        fullScore: maxScore,
        indicator: indicator
    });
    
    const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
    await setDoc(docRef, currentGradeEntryStructure);
    
    document.getElementById("modalAddMatrixAssignment").style.display = "none";
    window.showToast("✅ เพิ่มช่องคะแนนย่อยสำเร็จ");
    renderGradeEntryMatrix();
});
// BLANK
btnSaveGradeEntry.addEventListener("click", async () => {
    const room = gradeEntryRoom.value;
    if(!room) return;
    
    const batch = writeBatch(db);
    let updatesCount = 0;
    
    const studentsSnap = await getDocs(query(collection(db, "students"), where("room", "==", room)));
    
    studentsSnap.forEach(d => {
        const sid = d.id;
        const ref = doc(db, "grade_scores", sid);
        
        let myScores = currentGradeScores[sid] || {};
        
        document.querySelectorAll(".score-input[data-student=\"" + sid + "\"]").forEach(inp => {
            const aid = inp.getAttribute("data-assign");
            if(inp.value !== "") {
                myScores[aid] = Number(inp.value);
            } else {
                delete myScores[aid];
            }
        });
        
        currentGradeScores[sid] = myScores;
        batch.set(ref, { room: room, scores: myScores }, { merge: true });
        updatesCount++;
    });
    
    if(updatesCount > 0) {
        await batch.commit();
        window.showToast("💾 บันทึกคะแนนสำเร็จ");
    }
});
// BLANK
// ================= [ 9. สรุปผลคะแนน ปพ.5 (Grade Report) ] =================
const gradeReportRoom = document.getElementById("gradeReportRoom");
const gradeReportTypeFilter = document.getElementById("gradeReportTypeFilter");
const gradeReportTermFilter = document.getElementById("gradeReportTermFilter");
const gradeReportContainer = document.getElementById("gradeReportContainer");
const gradeReportThead = document.getElementById("gradeReportThead");
const gradeReportTbody = document.getElementById("gradeReportTbody");
const btnPrintGradeReport = document.getElementById("btnPrintGradeReport");
const gradeSummaryCards = document.getElementById("gradeSummaryCards");
// BLANK
/* REGENERATE_1 */
    let sumT2 = 0;
    structure.units.forEach(u => {
        if (String(u.term) === "2") sumT2 += Number(u.weight) || 0;
        else sumT1 += Number(u.weight) || 0;
    });
    
    let shownMaxScore = 0;
    let scoreCols = 0;
    if (termFilter === "all" || termFilter === "1") {
        shownMaxScore += sumT1 + (Number(structure.midtermWeight) || 0);
        scoreCols += 2;
    }
    if (termFilter === "all" || termFilter === "2") {
        shownMaxScore += sumT2 + (Number(structure.finalWeight) || 0);
        scoreCols += 2;
    }
    
    // Build Header
    let theadHtml = `<tr>
        <th rowspan="2" class="sticky-col" style="width: 60px; background: var(--bg-card); z-index: 40; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">เลขที่</th>
        <th rowspan="2" class="sticky-col-2" style="width: 280px; text-align: left; background: var(--bg-card); z-index: 40; box-shadow: 1px 0 0 var(--border-line); font-size: 14px; font-weight: 600; letter-spacing: 0.5px; padding-left: 20px;">ชื่อ - นามสกุล</th>`;
        
    if (viewType === 'all' || viewType === 'grades') {
        theadHtml += `<th colspan="${scoreCols}" style="background: linear-gradient(to bottom, rgba(99, 102, 241, 0.08), rgba(99, 102, 241, 0.02)); color: #818cf8; font-weight: 600; font-size: 14px; letter-spacing: 1px; border-bottom: 1px solid rgba(99, 102, 241, 0.2);">สัดส่วนคะแนน</th>
                      <th rowspan="2" style="background: rgba(99, 102, 241, 0.05); color: #818cf8; font-size: 14px; font-weight: 600; width: 90px; border-left: 1px solid rgba(255,255,255,0.05);">รวม ${shownMaxScore}</th>
                      `;
        if (termFilter === "all") {
            theadHtml += `<th rowspan="2" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05)); color: #10b981; font-weight:bold; font-size: 15px; width: 140px; border-left: 1px solid rgba(16,185,129,0.2); text-shadow: 0 0 10px rgba(16,185,129,0.3);">ระดับผลการเรียน</th>`;
        }
    }
    
    if (viewType === 'all' || viewType === 'eval') {
        theadHtml += `<th colspan="3" style="background: linear-gradient(to bottom, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02)); color: #fbbf24; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; border-bottom: 1px solid rgba(245, 158, 11, 0.2);">การประเมิน <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(3=ดีเยี่ยม, 2=ดี, 1=ผ่าน, 0=ไม่ผ่าน)</span></th>`;
    }
    theadHtml += `</tr><tr>`;
    
    // Row 2 headers
    if (viewType === 'all' || viewType === 'grades') {
        if (termFilter === "all" || termFilter === "1") {
            theadHtml += `<th style="color:var(--text-muted); font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2);">ภาคเรียนที่ 1 (${sumT1})</th>`;
            theadHtml += `<th style="color:var(--text-muted); font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2);">กลางภาค (${structure.midtermWeight})</th>`;
        }
        if (termFilter === "all" || termFilter === "2") {
            theadHtml += `<th style="color:var(--text-muted); font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2);">ภาคเรียนที่ 2 (${sumT2})</th>`; 
            theadHtml += `<th style="color:var(--text-muted); font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2);">ปลายภาค (${structure.finalWeight})</th>`;
        }
    }
    
    if (viewType === 'all' || viewType === 'eval') {
        theadHtml += `<th style="color:var(--text-muted); font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2);">คุณลักษณะฯ</th>`;
        theadHtml += `<th style="color:var(--text-muted); font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2);">อ่าน คิดวิเคราะห์ เขียน</th>`;
        theadHtml += `<th style="color:var(--text-muted); font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2);">สมรรถนะสำคัญ</th>`;
    }
    
    theadHtml += `</tr>`;
    gradeReportThead.innerHTML = theadHtml;
    
    // Ensure the container has the proper scrollbar wrapper class
    const tableDiv = document.querySelector("#gradeReportContainer > div");
    if (tableDiv && !tableDiv.classList.contains("matrix-table-wrapper")) {
        tableDiv.classList.add("matrix-table-wrapper");
        tableDiv.style.paddingBottom = "10px"; // Give space for the scrollbar
    }
    
    // Build Body & Calculate Distribution
    let tbodyHtml = "";
    let gradeCount = { "4": 0, "3.5": 0, "3": 0, "2.5": 0, "2": 0, "1.5": 0, "1": 0, "0": 0 };
    
    students.forEach(s => {
        let sScores = allScores[s.id] || {};
        let evScores = evalScores[s.id] || ["-", "-", "-", "-"];
        let totalScore = 0;
        
        tbodyHtml += `<tr style="transition: all 0.2s ease;">
            <td class="sticky-col" style="background: var(--bg-main); font-weight: 600; color: var(--text-muted); font-size: 14px;">${s.studentNo}</td>
            <td class="sticky-col-2" style="text-align: left; background: var(--bg-main); box-shadow: 1px 0 0 var(--border-line); font-size: 15px; padding-left: 20px; font-weight: 500;">${s.fullName}</td>`;
            
        // Calculate units split by Term 1 and Term 2
        let term1Score = 0;
        let term2Score = 0;
        structure.units.forEach(u => {
            let uScore = 0;
            let uAssigns = structure.assignments.filter(a => a.unitId === u.id);
            if (uAssigns.length > 0) {
                let rawMax = 0;
                let sumRaw = 0;
                uAssigns.forEach(a => {
                    rawMax += Number(a.fullScore) || 0;
                    sumRaw += Number(sScores[a.id]) || 0;
                });
                uScore = rawMax > 0 ? (sumRaw / rawMax) * Number(u.weight) : 0;
            } else {
                // If direct input
                uScore = Number(sScores["unit_direct_" + u.id]) || 0;
            }
            
            if (String(u.term) === "2") {
                term2Score += uScore;
            } else {
                term1Score += uScore;
            }
        });
        term1Score = Math.round(term1Score);
        term2Score = Math.round(term2Score);
        totalScore += term1Score + term2Score;
        
        let midtermScore = 0;
        if(structure.midtermWeight > 0) {
            let rawMax = Number(structure.midtermRaw) || 0;
            let rawVal = Number(sScores["midterm"]) || 0;
            midtermScore = rawMax > 0 ? (rawVal / rawMax) * Number(structure.midtermWeight) : 0;
            midtermScore = Math.round(midtermScore);
            totalScore += midtermScore;
        }
        
        let finalScore = 0;
        if(structure.finalWeight > 0) {
            let rawMax = Number(structure.finalRaw) || 0;
            let rawVal = Number(sScores["final"]) || 0;
            finalScore = rawMax > 0 ? (rawVal / rawMax) * Number(structure.finalWeight) : 0;
            finalScore = Math.round(finalScore);
            totalScore += finalScore;
        }
        
        // Calculate Grade (Round half up to nearest integer)
        let displayedTotal = 0;
        if (termFilter === "all" || termFilter === "1") {
            displayedTotal += term1Score + midtermScore;
        }
        if (termFilter === "all" || termFilter === "2") {
            displayedTotal += term2Score + finalScore;
        }
        
        let roundedTotal = Math.round(displayedTotal);
        
        // Calculate the TRUE whole year total for the grade summary cards!
        let fullYearTotal = term1Score + midtermScore + term2Score + finalScore;
        let roundedFullYear = Math.round(fullYearTotal);
        // Note: we can use a fixed 100 max or structure.totalMaxScore if defined. Usually 100.
        let fullYearMax = 100; 
        let fullGradePercent = (roundedFullYear / fullYearMax) * 100;
        
        let grade = "0"; // This will represent the true full-year grade
        if(fullGradePercent >= 79.5) grade = "4";
        else if(fullGradePercent >= 74.5) grade = "3.5";
        else if(fullGradePercent >= 69.5) grade = "3";
        else if(fullGradePercent >= 64.5) grade = "2.5";
        else if(fullGradePercent >= 59.5) grade = "2";
        else if(fullGradePercent >= 54.5) grade = "1.5";
        else if(fullGradePercent >= 49.5) grade = "1";
        else grade = "0";
        
        // Always increment the summary card counts based on TRUE whole year grade!
        gradeCount[grade]++;
        
        if (viewType === 'all' || viewType === 'grades') {
            if (termFilter === "all" || termFilter === "1") {
                tbodyHtml += `<td>${term1Score}</td>`;
                tbodyHtml += `<td>${midtermScore}</td>`;
            }
            if (termFilter === "all" || termFilter === "2") {
                tbodyHtml += `<td>${term2Score}</td>`;
                tbodyHtml += `<td>${finalScore}</td>`;
            }
            
            let gradeColor = "var(--text-muted)";
            if (grade === "4" || grade === "3.5") gradeColor = "var(--green)";
            else if (grade === "3" || grade === "2.5") gradeColor = "var(--blue)";
            else if (grade === "2" || grade === "1.5") gradeColor = "var(--yellow)";
            else if (grade === "1" || grade === "0") gradeColor = "var(--red)";
            
            tbodyHtml += `<td style="font-weight: 600; color: #818cf8; background: rgba(99, 102, 241, 0.02);">${roundedTotal}</td>`;
            if (termFilter === "all") {
                tbodyHtml += `<td style="font-weight: bold; color: ${gradeColor}; font-size: 15px; background: rgba(16, 185, 129, 0.02);">${grade}</td>`;
            }
        }
        
        if (viewType === 'all' || viewType === 'eval') {
            tbodyHtml += `<td>${evScores[0] || "-"}</td>`;
            tbodyHtml += `<td>${evScores[1] || "-"}</td>`;
            tbodyHtml += `<td>${evScores[2] || "-"}</td>`;
        }
        
        tbodyHtml += `</tr>`;
    });
    
    if(students.length === 0) {
        tbodyHtml = `<tr><td colspan="20" style="text-align:center; padding: 20px; color:var(--text-muted);">ยังไม่มีข้อมูลนักเรียนในห้องนี้</td></tr>`;
    }
    
    gradeReportTbody.innerHTML = tbodyHtml;
    
    // Render Summary Cards
    let cardsHtml = "";
    const gradeOrder = ["4", "3.5", "3", "2.5", "2", "1.5", "1", "0"];
    gradeOrder.forEach(g => {
        let count = gradeCount[g];
        let color = g === "0" ? "#ef4444" : "#10b981";
        if (g === "4" || g === "3.5") color = "#10b981"; // Green
        else if (g === "3" || g === "2.5") color = "#3b82f6"; // Blue
        else if (g === "2" || g === "1.5") color = "#f59e0b"; // Yellow
        else if (g === "1") color = "#f97316"; // Orange
        
        cardsHtml += `
        <div style="background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 18px 10px; text-align: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 15px rgba(0,0,0,0.2); backdrop-filter: blur(10px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 25px rgba(0,0,0,0.4)'; this.style.borderColor='${color}40';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 15px rgba(0,0,0,0.2)'; this.style.borderColor='rgba(255,255,255,0.05)';">
            <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 5px; font-weight: 500; letter-spacing: 0.5px;">เกรด ${g === "4" ? "4.0" : (g === "3" ? "3.0" : (g === "2" ? "2.0" : (g === "1" ? "1.0" : g)))}</div>
            <div style="font-size: 30px; font-weight: bold; color: ${color}; text-shadow: 0 0 15px ${color}60; display: flex; align-items: baseline; justify-content: center; gap: 5px;">
                ${count} <span style="font-size: 14px; font-weight: normal; color: var(--text-muted); text-shadow: none;">คน</span>
            </div>
        </div>`;
    });
    gradeSummaryCards.innerHTML = cardsHtml;
    gradeSummaryCards.style.display = "grid";
// BLANK
    gradeReportContainer.style.display = "block";
};
// BLANK
document.getElementById("gradeReportRoom").addEventListener("change", window.renderGradeReportData);
gradeReportTypeFilter.addEventListener("change", window.renderGradeReportData);
gradeReportTermFilter.addEventListener("change", window.renderGradeReportData);
// BLANK
window.updateGradeScoreMemory = function(sid, aid, val) {
    if(!currentGradeScores[sid]) currentGradeScores[sid] = {};
    if(val === "") {
        delete currentGradeScores[sid][aid];
    } else {
        currentGradeScores[sid][aid] = Number(val);
    }
    // ข้อมูลจะถูกพักไว้ในหน่วยความจำ และจะส่งเข้าฐานข้อมูลเมื่อกด "บันทึกคะแนนทั้งหมด" หรือปุ่มบันทึกในหน้างานค้างเท่านั้น
};
// BLANK
// Also listen for calculated score changes if needed, but above covers inputs
// BLANK
btnPrintGradeReport.addEventListener("click", () => {
    let originalTitle = document.title;
    document.title = "รายงานผล ปพ.5 - " + gradeReportRoom.value;
    
    // Create a temporary printable container
    let printHtml = `
        <div style="font-family: 'Sarabun', 'Prompt', sans-serif; padding: 20px;">
            <h2 style="text-align: center; margin-bottom: 5px;">รายงานสรุปผลสัมฤทธิ์ทางการเรียน (ปพ.5)</h2>
            <h3 style="text-align: center; margin-top: 0; font-weight: normal;">ห้องเรียน: ${gradeReportRoom.value}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: center; font-size: 13px;">
                <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        ${gradeReportThead.innerHTML.replace(/<span.*?<\/span>/g, "")}
                    </tr>
                </thead>
                <tbody>
                    ${gradeReportTbody.innerHTML}
                </tbody>
            </table>
            
        </div>
    `;
    
    let printWindow = window.open('', '', 'width=1000,height=800');
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
        document.title = originalTitle;
    }, 500);
});
// BLANK
// ================= [ 10. ระบบรายละเอียดโครงสร้างรายวิชา ] =================
const courseStructureRoom = document.getElementById("courseStructureRoom");
const courseStructureContent = document.getElementById("courseStructureContent");
const csTotalUnits = document.getElementById("csTotalUnits");
const csMidterm = document.getElementById("csMidterm");
const csFinal = document.getElementById("csFinal");
const csTotal = document.getElementById("csTotal");
const csTotalHours = document.getElementById("csTotalHours");
const csUnitsContainer = document.getElementById("csUnitsContainer");
// BLANK
let currentCourseStructureDetails = null;
// BLANK
async function renderCourseStructureDetails(room) {
    if(!room) {
        courseStructureContent.style.display = "none";
        return;
    }
    courseStructureContent.style.display = "block";
    
    const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
    const docSnap = await getDoc(docRef);
    let structure = { midtermWeight: 0, finalWeight: 0, units: [], assignments: [] };
    if(docSnap.exists()) {
        structure = docSnap.data();
        if(!structure.units) structure.units = [];
        if(!structure.assignments) structure.assignments = [];
    }
    currentCourseStructureDetails = structure;
    
    let uWeight = 0;
    let totalHours = 0;
    let totalInd = 0;
    structure.units.forEach(u => {
        uWeight += Number(u.weight) || 0;
        totalHours += Number(u.hours) || 0;
        if(u.indicator && u.indicator.trim() !== "" && u.indicator !== "-") {
            totalInd += u.indicator.split("|").filter(x=>x.trim()!=="").length;
        }
    });
    let mid = Number(structure.midtermWeight) || 0;
    let fin = Number(structure.finalWeight) || 0;
    
    csTotalUnits.innerText = uWeight;
    csMidterm.innerText = mid;
    csFinal.innerText = fin;
    csTotal.innerText = uWeight + mid + fin;
    
    let targetHours = structure.targetHours || 160;
    csTotalHours.innerHTML = `${totalHours} <span style="font-size:14px; font-weight:normal; color:var(--text-muted);">/ ${targetHours} ชม./ปี</span>`;
    const elTotalInd = document.getElementById("csTotalIndicators");
    if(elTotalInd) {
        elTotalInd.innerText = `รวมตัวชี้วัดทั้งหมด: ${totalInd} ตัวชี้วัด`;
    }
    
    csUnitsContainer.innerHTML = "";
    if(structure.units.length === 0) {
        csUnitsContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding: 20px;">ยังไม่มีข้อมูลโครงสร้างรายวิชาสำหรับห้องนี้</div>`;
    } else {
        const groupedUnits = structure.units.reduce((acc, u) => {
            const sub = u.subject || "วิทยาศาสตร์";
            if(!acc[sub]) acc[sub] = [];
            acc[sub].push(u);
            return acc;
        }, {});
        
        Object.keys(groupedUnits).forEach((subjectName) => {
            let subjectHeaderContainer = document.createElement("div");
            subjectHeaderContainer.style.display = "flex";
            subjectHeaderContainer.style.justifyContent = "space-between";
            subjectHeaderContainer.style.alignItems = "center";
            subjectHeaderContainer.style.marginTop = "20px";
            subjectHeaderContainer.style.marginBottom = "10px";
            subjectHeaderContainer.style.borderBottom = "1px dashed var(--border-line)";
            subjectHeaderContainer.style.paddingBottom = "5px";
// BLANK
            subjectHeaderContainer.innerHTML = `
                <h5 style="color: var(--gold-luxury); margin: 0;">🔬 รายวิชา${subjectName}</h5>
                <div>
                    <button class="btn-edit-subject" data-subject="${subjectName}" style="background: transparent; border: 1px solid var(--border-line); color: var(--text-muted); border-radius: 4px; padding: 4px 10px; font-size: 13px; cursor: pointer; transition: 0.2s;">✏️ แก้ไขตาราง</button>
                    <button class="btn-save-subject" data-subject="${subjectName}" style="display: none; background: rgba(0,255,0,0.1); border: 1px solid var(--green); color: var(--green); border-radius: 4px; padding: 4px 10px; font-size: 13px; cursor: pointer; transition: 0.2s;">💾 บันทึก</button>
                    <button class="btn-cancel-subject" data-subject="${subjectName}" style="display: none; background: rgba(255,0,0,0.1); border: 1px solid var(--red); color: var(--red); border-radius: 4px; padding: 4px 10px; font-size: 13px; cursor: pointer; margin-left: 5px; transition: 0.2s;">❌ ยกเลิก</button>
                </div>
            `;
            csUnitsContainer.appendChild(subjectHeaderContainer);
            
            let tableWrapper = document.createElement("div");
            tableWrapper.style.overflowX = "auto";
            tableWrapper.style.marginBottom = "20px";
            
            let tableHtml = `<table class="space-table" style="width: 100%; min-width: 900px; text-align: left; font-size: 14px;">
                <thead>
                    <tr>
                        <th style="width: 70px; text-align: center;">หน่วยที่</th>
                        <th style="width: 250px; text-align: center;">ชื่อหน่วยการเรียนรู้</th>
                        <th style="text-align: center;">ตัวชี้วัด/ผลการเรียนรู้</th>
                        <th style="width: 100px; text-align: center;">ภาคเรียน</th>
                        <th style="width: 90px; text-align: center;">เวลา (ชม.)</th>
                        <th style="width: 90px; text-align: center;">คะแนน</th>
                    </tr>
                </thead>
                <tbody>`;
            
            groupedUnits[subjectName].forEach((u, index) => {
                let indHtml = "";
                if(u.indicator && u.indicator !== "-") {
                    let indItems = u.indicator.split("|").map(i => {
                        let str = i.trim();
                        let badgeHtml = "";
                        if (str.includes("(ตัวชี้วัดระหว่างทาง)") || str.includes("( ตัวชี้วัดระหว่างทาง )")) {
                            badgeHtml = `<span class="badge-formative">ระหว่างทาง</span>`;
                            str = str.replace(/\(ตัวชี้วัดระหว่างทาง\)|\( ตัวชี้วัดระหว่างทาง \)/g, "").trim();
                        } else if (str.includes("(ตัวชี้วัดปลายทาง)") || str.includes("( ตัวชี้วัด ปลาย ทาง )")) {
                            badgeHtml = `<span class="badge-summative">ปลายทาง</span>`;
                            str = str.replace(/\(ตัวชี้วัดปลายทาง\)|\( ตัวชี้วัด ปลาย ทาง \)/g, "").trim();
                        }
                        
                        let match = str.match(/^(ว\s*\d+\.\d+\s*ป\.\d+\/\d+)\s*(.*)/);
                        if (match) {
                            return `<div class="indicator-item"><span class="indicator-bullet">•</span> <div><span class="indicator-code">${match[1]}</span> ${badgeHtml} <span class="indicator-desc">${match[2]}</span></div></div>`;
                        } else {
                            return `<div class="indicator-item"><span class="indicator-bullet">•</span> <div>${badgeHtml} <span class="indicator-desc">${str}</span></div></div>`;
                        }
                    });
                    indHtml = indItems.join('');
                } else {
                    indHtml = "-";
                }
                let termBadge = u.term ? `ภาคเรียนที่ ${u.term}` : "ตลอดปี";
                let termStyle = "";
                if (u.term == "2") {
                    termStyle = "background: rgba(88, 28, 135, 0.3); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);";
                } else if (!u.term) {
                    termStyle = "background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3);";
                }
                
                tableHtml += `
                    <tr class="subject-row" data-subject="${subjectName}" data-id="${u.id}">
                        <td style="text-align: center; vertical-align: top; font-weight: bold;">${index + 1}</td>
                        <td style="vertical-align: top; font-weight: bold; color: #818cf8;">
                            <span class="view-mode">${u.name}</span>
                            <input type="text" class="edit-mode form-control" style="display:none; width:100%; margin-top:5px; padding:5px;" id="edit-name-${u.id}" value="${u.name}">
                        </td>
                        <td style="vertical-align: top;">
                            <div class="view-mode">${indHtml}</div>
                            <textarea class="edit-mode form-control" style="display:none; width:100%; height:120px; font-size:13px; margin-top:5px; padding:5px;" id="edit-ind-${u.id}">${u.indicator || '-'}</textarea>
                        </td>
                        <td style="text-align: center; vertical-align: top;">
                            <span class="view-mode badge-term" style="${termStyle}">${termBadge}</span>
                            <select class="edit-mode form-control" style="display:none; width:100%; margin-top:5px; padding:5px;" id="edit-term-${u.id}">
                                <option value="1" ${u.term == 1 ? 'selected' : ''}>ภาคเรียนที่ 1</option>
                                <option value="2" ${u.term == 2 ? 'selected' : ''}>ภาคเรียนที่ 2</option>
                                <option value="" ${!u.term ? 'selected' : ''}>ตลอดปี</option>
                            </select>
                        </td>
                        <td style="text-align: center; vertical-align: top;">
                            <span class="view-mode" style="${u.hours ? '' : 'color: #cbd5e1;'}">${u.hours || '-'}</span>
                            <input type="number" class="edit-mode form-control" style="display:none; width:100%; margin-top:5px; padding:5px; text-align:center;" id="edit-hours-${u.id}" value="${u.hours || ''}">
                        </td>
                        <td style="text-align: center; vertical-align: top; font-weight: bold; color: #f8fafc; font-size: 15px;">
                            <span class="view-mode">${u.weight}</span>
                            <input type="number" class="edit-mode form-control" style="display:none; width:100%; margin-top:5px; padding:5px; text-align:center;" id="edit-weight-${u.id}" value="${u.weight || 0}">
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `</tbody></table>`;
            tableWrapper.innerHTML = tableHtml;
            csUnitsContainer.appendChild(tableWrapper);
        });
        
        // Add event listeners for Subject-level editing
        document.querySelectorAll('.btn-edit-subject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subject = e.target.dataset.subject;
                const container = e.target.parentElement;
                
                // Toggle buttons
                e.target.style.display = 'none';
                container.querySelector('.btn-save-subject').style.display = 'inline-block';
                container.querySelector('.btn-cancel-subject').style.display = 'inline-block';
                
                // Toggle rows for this subject
                document.querySelectorAll(`.subject-row[data-subject="${subject}"]`).forEach(row => {
                    row.querySelectorAll('.view-mode').forEach(el => el.style.display = 'none');
                    row.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'inline-block');
                    const textarea = row.querySelector('textarea');
                    if(textarea) textarea.style.display = 'block';
                });
            });
        });
        
        document.querySelectorAll('.btn-cancel-subject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subject = e.target.dataset.subject;
                const container = e.target.parentElement;
                
                // Toggle buttons
                e.target.style.display = 'none';
                container.querySelector('.btn-save-subject').style.display = 'none';
                container.querySelector('.btn-edit-subject').style.display = 'inline-block';
                
                // Toggle rows for this subject
                document.querySelectorAll(`.subject-row[data-subject="${subject}"]`).forEach(row => {
                    row.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'none');
                    row.querySelectorAll('.view-mode').forEach(el => el.style.display = 'inline-block');
                    
                    // reset inputs to original values
                    const uid = row.dataset.id;
                    const u = currentCourseStructureDetails.units.find(un => un.id === uid);
                    if(u) {
                        document.getElementById(`edit-name-${uid}`).value = u.name;
                        document.getElementById(`edit-ind-${uid}`).value = u.indicator || '-';
                        document.getElementById(`edit-term-${uid}`).value = u.term || '';
                        document.getElementById(`edit-hours-${uid}`).value = u.hours || '';
                        document.getElementById(`edit-weight-${uid}`).value = u.weight || 0;
                    }
                });
            });
        });
        
        document.querySelectorAll('.btn-save-subject').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const subject = e.target.dataset.subject;
                
                // Read all rows for this subject
                document.querySelectorAll(`.subject-row[data-subject="${subject}"]`).forEach(row => {
                    const uid = row.dataset.id;
                    const u = currentCourseStructureDetails.units.find(un => un.id === uid);
                    if(u) {
                        u.name = document.getElementById(`edit-name-${uid}`).value;
                        u.indicator = document.getElementById(`edit-ind-${uid}`).value;
                        u.term = document.getElementById(`edit-term-${uid}`).value ? Number(document.getElementById(`edit-term-${uid}`).value) : null;
                        u.hours = document.getElementById(`edit-hours-${uid}`).value ? Number(document.getElementById(`edit-hours-${uid}`).value) : null;
                        u.weight = document.getElementById(`edit-weight-${uid}`).value ? Number(document.getElementById(`edit-weight-${uid}`).value) : 0;
                    }
                });
                
                try {
                    const room = courseStructureRoom.value;
                    const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
                    await setDoc(docRef, currentCourseStructureDetails);
                    window.showToast(`✅ บันทึกข้อมูลวิชา${subject}เรียบร้อย!`);
                    // Re-render
                    await renderCourseStructureDetails(room);
                } catch (err) {
                    console.error(err);
                    window.showToast("❌ เกิดข้อผิดพลาดในการบันทึก");
                }
            });
        });
    }
}
// BLANK
window.renderFolderTabs = function() {
    const tabsContainer = document.getElementById("courseStructureTabs");
    const select = document.getElementById("courseStructureRoom");
    if(!tabsContainer || !select) return;
    
    const options = Array.from(select.options).filter(opt => opt.value !== "");
    if (select.value === "" && options.length > 0) {
        select.value = options[0].value;
        setTimeout(() => select.dispatchEvent(new Event("change")), 50);
    }
    
    if(typeof window.renderRadialMenuToContainer === "function") {
        window.renderRadialMenuToContainer(tabsContainer, select, () => {
            renderFolderTabs();
            select.dispatchEvent(new Event("change"));
        });
    }
};
// BLANK
if(courseStructureRoom) {
    courseStructureRoom.addEventListener("change", async () => {
        await renderCourseStructureDetails(courseStructureRoom.value);
        if(typeof renderFolderTabs === "function") renderFolderTabs(); // Keep tabs in sync if changed programmatically
    });
}
// Initial render if loaded late
setTimeout(() => {
    if(typeof renderFolderTabs === "function") renderFolderTabs();
}, 1500);
// ================= [ Auto Import P.6 ] =================
const btnAutoImportP6 = document.getElementById("btnAutoImportP6");
if(btnAutoImportP6) {
    btnAutoImportP6.addEventListener("click", async () => {
        const room = (typeof gradeEntryRoom !== 'undefined' && gradeEntryRoom.value) ? gradeEntryRoom.value : document.getElementById("gradeSetupRoom").value;
        if(!room) {
            window.showToast("⚠️ กรุณาเลือกห้องเรียนที่ต้องการนำเข้าข้อมูลก่อนครับ");
            return;
        }
        
        window.showPremiumConfirm("นำเข้าโครงสร้างรายวิชา", `ยืนยันการนำเข้าโครงสร้างรายวิชา ป.6 (11 หน่วย) ลงในห้อง ${room} ใช่หรือไม่?\n⚠️ ข้อมูลโครงสร้างเดิมของห้องนี้จะถูกแทนที่ทั้งหมด`, async () => {
        const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
        });
        
        const p6Units = [
            { name: "เรียนรู้วิทยาศาสตร์", subject: "วิทยาศาสตร์", ind: "-", w: 0, term: 1, hours: 4 },
            { name: "สารอาหารและระบบย่อยอาหาร", subject: "วิทยาศาสตร์", ind: "ว 1.2 ป.6/1 ระบุสารอาหารและบอกประโยชน์ของสารอาหารแต่ละประเภทจากอาหารที่ตนเองรับประทาน (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.6/2 บอกแนวทางในการเลือกรับประทานอาหารให้ได้สารอาหารครบถ้วน ในสัดส่วนที่เหมาะสม (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.6/3 ตระหนักถึงความสำคัญของสารอาหาร โดยการเลือกรับประทานอาหารที่มีสารอาหารครบถ้วนในสัดส่วนที่เหมาะสมกับเพศและวัย รวมทั้งปลอดภัยต่อสุขภาพ (ตัวชี้วัดปลายทาง)|ว 1.2 ป.6/4 สร้างแบบจำลองระบบย่อยอาหาร และบรรยายหน้าที่ของอวัยวะในระบบย่อยอาหาร รวมทั้งอธิบายการย่อยอาหารและการดูดซึมสารอาหาร (ตัวชี้วัดระหว่างทาง)|ว 1.2 ป.6/5 ตระหนักถึงความสำคัญของระบบย่อยอาหาร โดยการบอกแนวทางในการดูแลรักษาอวัยวะในระบบย่อยอาหารให้ทำงานเป็นปกติ (ตัวชี้วัดปลายทาง)", w: 10, term: 1, hours: 26 },
            { name: "การแยกสารในชีวิตประจำวัน", subject: "วิทยาศาสตร์", ind: "ว 2.1 ป.6/1 อธิบายและเปรียบเทียบการแยกสารผสมโดยการหยิบออก การร่อน การใช้แม่เหล็กดึงดูด การรินออก การกรอง และการตกตะกอน โดยใช้หลักฐานเชิงประจักษ์ รวมทั้งระบุวิธีแก้ปัญหาในชีวิตประจำวันเกี่ยวกับการแยกสาร (ตัวชี้วัดปลายทาง)", w: 5, term: 1, hours: 10 },
            { name: "ไฟฟ้าน่ารู้", subject: "วิทยาศาสตร์", ind: "ว 2.2 ป.6/1 อธิบายการเกิดและผลของแรงไฟฟ้า ซึ่งเกิดจากวัตถุที่ผ่านการขัดถู โดยใช้หลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/1 ระบุส่วนประกอบและบรรยายหน้าที่ของแต่ละส่วนประกอบของวงจรไฟฟ้าอย่างง่ายจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/2 เขียนแผนภาพและต่อวงจรไฟฟ้าอย่างง่าย (ตัวชี้วัดระหว่างทาง)|ว 2.3 ป.6/3 ออกแบบการทดลองและทดลองด้วยวิธีที่เหมาะสมในการอธิบายวิธีการและผลของการต่อเซลล์ไฟฟ้าแบบอนุกรม (ตัวชี้วัดระหว่างทาง)|ว 2.3 ป.6/4 ตระหนักถึงประโยชน์ของความรู้ของการต่อเซลล์ไฟฟ้าแบบอนุกรม โดยบอกประโยชน์และการประยุกต์ใช้ในชีวิตประจำวัน (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/5 ออกแบบการทดลองและทดลองด้วยวิธีที่เหมาะสมในการอธิบายการต่อหลอดไฟฟ้าแบบอนุกรมและแบบขนาน (ตัวชี้วัดระหว่างทาง)|ว 2.3 ป.6/6 ตระหนักถึงประโยชน์ของความรู้ของการต่อหลอดไฟฟ้าแบบอนุกรมและแบบขนาน โดยบอกประโยชน์ ข้อจำกัด และการประยุกต์ใช้ในชีวิตประจำวัน (ตัวชี้วัดปลายทาง)", w: 10, term: 1, hours: 20 },
            { name: "ปรากฏการณ์และการเปลี่ยนแปลงทางอากาศ", subject: "วิทยาศาสตร์", ind: "ว 3.2 ป.6/4 เปรียบเทียบการเกิดลมบก ลมทะเล และมรสุม รวมทั้งอธิบายผลที่มีต่อสิ่งมีชีวิตและสิ่งแวดล้อมจากแบบจำลอง (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/5 อธิบายผลของมรสุมต่อการเกิดฤดูของประเทศไทยจากข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/8 สร้างแบบจำลองที่อธิบายการเกิดปรากฏการณ์เรือนกระจกและผลของปรากฏการณ์เรือนกระจกต่อสิ่งมีชีวิต (ตัวชี้วัดระหว่างทาง)|ว 3.2 ป.6/9 ตระหนักถึงผลกระทบของปรากฏการณ์เรือนกระจก โดยนำเสนอแนวทางการปฏิบัติตนเพื่อลดกิจกรรมที่ก่อให้เกิดแก๊สเรือนกระจก (ตัวชี้วัดปลายทาง)", w: 9, term: 2, hours: 20 },
            { name: "ปรากฏการณ์และการเปลี่ยนแปลงของโลก", subject: "วิทยาศาสตร์", ind: "ว 3.2 ป.6/1 เปรียบเทียบกระบวนการเกิดหินอัคนี หินตะกอน และหินแปร และอธิบายวัฏจักรหินจากแบบจำลอง (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/2 บรรยายและยกตัวอย่างการใช้ประโยชน์ของหินและแร่ในชีวิตประจำวันจากข้อมูลที่รวบรวมได้ (ตัวชี้วัดระหว่างทาง)|ว 3.2 ป.6/3 สร้างแบบจำลองที่อธิบายการเกิดซากดึกดำบรรพ์และคาดคะเนสภาพแวดล้อมในอดีตของซากดึกดำบรรพ์ (ตัวชี้วัดปลายทาง)|ว 3.2 ป.6/6 บรรยายลักษณะและผลกระทบของน้ำท่วม การกัดเซาะชายฝั่ง ดินถล่ม แผ่นดินไหว สึนามิ (ตัวชี้วัดระหว่างทาง)|ว 3.2 ป.6/7 ตระหนักถึงผลกระทบของภัยธรรมชาติและธรณีพิบัติภัย โดยนำเสนอแนวทางในการเฝ้าระวังและปฏิบัติตนให้ปลอดภัยจากภัยธรรมชาติและธรณีพิบัติภัยที่อาจเกิดในท้องถิ่น (ตัวชี้วัดปลายทาง)", w: 10, term: 2, hours: 20 },
            { name: "แสง เงา ดาราศาสตร์และเทคโนโลยีอวกาศ", subject: "วิทยาศาสตร์", ind: "ว 2.3 ป.6/7 อธิบายการเกิดเงามืด เงามัวจากหลักฐานเชิงประจักษ์ (ตัวชี้วัดปลายทาง)|ว 2.3 ป.6/8 เขียนแผนภาพรังสีของแสงแสดงการเกิดเงามืดเงามัว (ตัวชี้วัดระหว่างทาง)|ว 3.1 ป.6/1 สร้างแบบจำลองที่อธิบายการเกิด และเปรียบเทียบปรากฏการณ์สุริยุปราคาและจันทรุปราคา (ตัวชี้วัดปลายทาง)|ว 3.1 ป.6/2 อธิบายพัฒนาการของเทคโนโลยีอวกาศ และยกตัวอย่างการนำเทคโนโลยีอวกาศมาใช้ประโยชน์ในชีวิตประจำวัน จากข้อมูลที่รวบรวมได้ (ตัวชี้วัดปลายทาง)", w: 8, term: 2, hours: 20 },
            { name: "การแก้ปัญหาโดยใช้เหตุผลเชิงตรรกะ", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.6/1 ใช้เหตุผลเชิงตรรกะในการอธิบายและออกแบบวิธีการแก้ปัญหาที่พบในชีวิตประจำวัน (ตัวชี้วัดปลายทาง)", w: 5, term: 1, hours: 10 },
            { name: "การออกแบบและเขียนโปรแกรมอย่างง่าย", subject: "วิทยาการคำนวณ", ind: "ว 4.2 ป.6/2 ออกแบบและเขียนโปรแกรมอย่างง่ายเพื่อแก้
// BLANK
// BLANK
// BLANK
// BLANK
// BLANK
// BLANK
// BLANK
// BLANK
// BLANK
/* REGENERATE_2 */
             void container.offsetWidth; // trigger reflow
             container.classList.add("shake-sad");
           }
        }
// BLANK
        try {
          await updateDoc(doc(db, "students", id), {
            points: newPoints
          });
        } catch(e) {
          console.error(e);
          window.showToast("❌ เกิดข้อผิดพลาดในการอัปเดตแต้ม");
          rewardStudentsCache[studentIndex].points = currentPoints;
          renderRewardTable();
        }
      };
// BLANK
      window.openRewardModal = function(id, name, room) {
        currentRewardTarget = { id, name, room };
        document.getElementById("rewardConfirmModal").style.display = "flex";
      };
// BLANK
      document.getElementById("btnCancelReward").addEventListener("click", () => {
        document.getElementById("rewardConfirmModal").style.display = "none";
        currentRewardTarget = null;
      });
// BLANK
      document.getElementById("btnConfirmReward").addEventListener("click", async () => {
        if (!currentRewardTarget) return;
        
        const btn = document.getElementById("btnConfirmReward");
        btn.textContent = "กำลังดำเนินการ...";
        btn.disabled = true;
// BLANK
        const { id, name, room } = currentRewardTarget;
        const studentIndex = rewardStudentsCache.findIndex(s => s.id === id);
        
        if (studentIndex === -1 || rewardStudentsCache[studentIndex].points < 10) {
           window.showToast("⚠️ แต้มไม่พอสำหรับแลกรางวัล");
           btn.textContent = "ยืนยันการแลก";
           btn.disabled = false;
           return;
        }
// BLANK
        try {
           const newPoints = rewardStudentsCache[studentIndex].points - 10;
           
           const batch = writeBatch(db);
           const studentRef = doc(db, "students", id);
           batch.update(studentRef, { points: newPoints });
// BLANK
           const historyRef = doc(getRewardHistoryCollection());
           batch.set(historyRef, {
             studentId: id,
             studentName: name,
             room: room,
             timestamp: new Date()
           });
// BLANK
           await batch.commit();
// BLANK
           rewardStudentsCache[studentIndex].points = newPoints;
           renderRewardTable();
           
           document.getElementById("rewardConfirmModal").style.display = "none";
           window.showToast("🎉 แลกรางวัลสำเร็จ! หัก 10 แต้มเรียบร้อยแล้ว");
        } catch(e) {
           console.error(e);
           window.showToast("❌ เกิดข้อผิดพลาดในการบันทึก");
        } finally {
           btn.textContent = "ยืนยันการแลก";
           btn.disabled = false;
           currentRewardTarget = null;
        }
      });
// BLANK
      rewardRoom.addEventListener("change", loadRewardStudents);
      searchRewardInput.addEventListener("input", renderRewardTable);
// BLANK
      btnRewardHistory.addEventListener("click", async () => {
         document.getElementById("rewardHistoryModal").style.display = "flex";
         const tbody = document.getElementById("rewardHistoryBody");
         tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">กำลังโหลดข้อมูล...</td></tr>`;
         
         try {
            const q = query(getRewardHistoryCollection(), orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
               tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">ยังไม่มีประวัติการแลกรางวัล</td></tr>`;
               return;
            }
// BLANK
            let html = "";
            snapshot.forEach(docSnap => {
               const data = docSnap.data();
               const dateObj = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
               const mNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
               const dateStr = `${dateObj.getDate()} ${mNames[dateObj.getMonth()]} ${dateObj.getFullYear() + 543} เวลา ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} น.`;
               
               html += `
                 <tr>
                   <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--gold-luxury);">${dateStr}</td>
                   <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 500;">${data.studentName}</td>
                   <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-muted);">ชั้น ${data.room}</td>
                 </tr>
               `;
            });
            tbody.innerHTML = html;
         } catch(e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--red);">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
         }
      });
// BLANK
      document.getElementById("btnCloseRewardHistory").addEventListener("click", () => {
         document.getElementById("rewardHistoryModal").style.display = "none";
      });
// BLANK
      // ================= [ ระบบรายงานรายภาคเรียน ] =================
      const termReportRoom = document.getElementById("termReportRoom");
      const termReportSemester = document.getElementById("termReportSemester");
      const btnGenerateTermReport = document.getElementById(
        "btnGenerateTermReport",
      );
      const btnPrintTermReport = document.getElementById("btnPrintTermReport");
      const termReportContentArea = document.getElementById(
        "termReportContentArea",
      );
      const termReportTitle = document.getElementById("termReportTitle");
      const termReportTableBody = document.getElementById(
        "termReportTableBody",
      );
      const termPrintPreviewModal = document.getElementById(
        "termPrintPreviewModal",
      );
      const btnCloseTermPreview = document.getElementById(
        "btnCloseTermPreview",
      );
      const btnConfirmTermPrint = document.getElementById(
        "btnConfirmTermPrint",
      );
// BLANK
      let globalTermData = [];
// BLANK
      btnGenerateTermReport.addEventListener("click", async () => {
        const room = termReportRoom.value;
        const semester = termReportSemester.value;
// BLANK
        if (!room) {
          window.showToast("⚠️ กรุณาเลือกห้องเรียนก่อนสร้างรายงาน");
          return;
        }
// BLANK
// BLANK
        termReportContentArea.style.display = "block";
        termReportTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">กำลังดึงข้อมูลรายงานเทอม...</td></tr>`;
// BLANK
        try {
          // Check classroomMeta
          if (!window.classroomMeta) {
            termReportTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--red);">กรุณาตั้งค่าข้อมูลทั่วไปก่อน</td></tr>`;
            return;
          }
// BLANK
          let isConfigComplete = true;
          if (semester === "1" && (!window.classroomMeta.term1Start || !window.classroomMeta.term1End)) isConfigComplete = false;
          if (semester === "2" && (!window.classroomMeta.term2Start || !window.classroomMeta.term2End)) isConfigComplete = false;
          if (semester === "all" && (!window.classroomMeta.term1Start || !window.classroomMeta.term1End || !window.classroomMeta.term2Start || !window.classroomMeta.term2End)) isConfigComplete = false;
// BLANK
          if (!isConfigComplete) {
            window.showToast(
              "⚠️ ไม่พบข้อมูลวันเปิด-ปิดภาคเรียน กรุณาไปตั้งค่าที่เมนูตั้งค่าข้อมูลทั่วไปและระบบก่อนครับ",
            );
            termReportTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--red);">ข้อมูลเปิด-ปิดภาคเรียนไม่สมบูรณ์</td></tr>`;
            return;
          }
// BLANK
          // Normalizing dates for query
          function normalize(dStr) {
            if (!dStr) return "";
            let p = dStr.split("-");
            if (p.length === 3 && parseInt(p[0]) > 2500) {
              p[0] = (parseInt(p[0]) - 543).toString();
              return p.join("-");
            }
            return dStr;
          }
// BLANK
          function fixYear(startStr, endStr) {
             if(startStr && endStr) {
                let d1 = new Date(startStr);
                let d2 = new Date(endStr);
                if(d1 > d2) {
                   d2.setFullYear(d2.getFullYear() + 1);
                   let y = d2.getFullYear();
                   let m = String(d2.getMonth() + 1).padStart(2, '0');
                   let d = String(d2.getDate()).padStart(2, '0');
                   return `${y}-${m}-${d}`;
                }
             }
             return endStr;
          }
// BLANK
          let t1s = normalize(window.classroomMeta.term1Start);
          let t1e = normalize(window.classroomMeta.term1End);
          let t2s = normalize(window.classroomMeta.term2Start);
          let t2e = normalize(window.classroomMeta.term2End);
          
          t1e = fixYear(t1s, t1e);
          t2e = fixYear(t2s, t2e);
// BLANK
          function isDateInSemester(dateStr) {
             let inT1 = t1s && t1e && dateStr >= t1s && dateStr <= t1e;
             let inT2 = t2s && t2e && dateStr >= t2s && dateStr <= t2e;
             if(semester === "1") return inT1;
             if(semester === "2") return inT2;
             if(semester === "all") return inT1 || inT2;
             return false;
          }
// BLANK
          // Fetch students in room
          const studentQ = query(
            getStudentsCollection(),
            where("room", "==", room)
          );
          const studentSnap = await getDocs(studentQ);
// BLANK
          let studentsList = [];
          studentSnap.forEach((doc) => {
            const d = doc.data();
            studentsList.push({
              id: doc.id,
              studentNo: d.studentNo,
              fullName: d.fullName,
              countMa: 0,
              countKhad: 0,
              countLa: 0,
              countPuay: 0,
            });
          });
// BLANK
          studentsList.sort((a, b) => a.studentNo - b.studentNo);
// BLANK
          if (studentsList.length === 0) {
            termReportTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">ไม่พบนักเรียนในห้องนี้</td></tr>`;
            return;
          }
// BLANK
          // Fetch attendance data for room within dates
          const attQ = query(
            getAttendanceCollection(),
            where("room", "==", room),
          );
          const attSnap = await getDocs(attQ);
// BLANK
          attSnap.forEach((doc) => {
            const data = doc.data();
            const recordDate = data.date;
            // Check if date is within term bounds
            if (isDateInSemester(recordDate)) {
              const student = studentsList.find((s) => s.id === data.studentId);
              if (student) {
                if (data.status === "มา") student.countMa++;
                else if (data.status === "ขาด") student.countKhad++;
                else if (data.status === "ลา") student.countLa++;
                else if (data.status === "ป่วย") student.countPuay++;
              }
            }
          });
// BLANK
          globalTermData = studentsList; // cache for printing
// BLANK
          let trHtml = "";
          studentsList.forEach((s) => {
            const totalValidClasses =
              s.countMa + s.countKhad + s.countLa + s.countPuay;
            let percent =
              totalValidClasses > 0 ? (s.countMa / totalValidClasses) * 100 : 0;
// BLANK
            let percentColor = "var(--text-color)";
            if (totalValidClasses > 0 && percent < 80)
              percentColor = "var(--red)";
// BLANK
            trHtml += `<tr>
                    <td style="font-weight:600; color:var(--gold-luxury); text-align:center;">${s.studentNo}</td>
                    <td style="font-weight:500;">${s.fullName}</td>
                    <td style="color:var(--green); font-weight:600; text-align:center;">${s.countMa}</td>
                    <td style="color:var(--red); font-weight:600; text-align:center;">${s.countKhad}</td>
                    <td style="color:var(--yellow); font-weight:600; text-align:center;">${s.countLa}</td>
                    <td style="color:var(--blue); font-weight:600; text-align:center;">${s.countPuay}</td>
                    <td style="font-weight:600; text-align:center;">${totalValidClasses}</td>
                    <td style="font-weight:600; color:${percentColor}; text-align:center;">${totalValidClasses > 0 ? percent.toFixed(2) + "%" : "-"}</td>
                </tr>`;
          });
          termReportTableBody.innerHTML = trHtml;
        } catch (err) {
          console.error(err);
          window.showToast("❌ เกิดข้อผิดพลาดในการดึงข้อมูล");
          termReportTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--red);">ไม่สามารถดึงข้อมูลได้</td></tr>`;
        }
      });
// BLANK
      btnPrintTermReport.addEventListener("click", () => {
        document.getElementById("termPrintSchoolTitle").textContent =
          document.getElementById("metaSchoolName")?.value || "ชื่อโรงเรียน";
        document.getElementById("termPrintRoom").textContent =
          termReportRoom.value.replace("ป.", "");
        document.getElementById("termPrintAcademicYear").textContent =
          metaYear.value || "-";
// BLANK
        let printHtml = `<thead>
            <tr>
                <th style="width: 40px;">ที่</th>
                <th>ชื่อ-นามสกุล</th>
                <th style="width: 50px;">มา</th>
                <th style="width: 50px;">ขาด</th>
                <th style="width: 50px;">ลา</th>
                <th style="width: 50px;">ป่วย</th>
                <th style="width: 80px;">รวมคาบ</th>
                <th style="width: 80px;">ร้อยละ</th>
            </tr>
        </thead><tbody>`;
// BLANK
        globalTermData.forEach((s) => {
          const totalValidClasses =
            s.countMa + s.countKhad + s.countLa + s.countPuay;
          let percent =
            totalValidClasses > 0 ? (s.countMa / totalValidClasses) * 100 : 0;
          printHtml += `<tr>
                <td>${s.studentNo}</td>
                <td style="text-align:left;">${s.fullName}</td>
                <td>${s.countMa}</td>
                <td>${s.countKhad}</td>
                <td>${s.countLa}</td>
                <td>${s.countPuay}</td>
                <td>${totalValidClasses}</td>
                <td>${totalValidClasses > 0 ? percent.toFixed(2) + "%" : "-"}</td>
            </tr>`;
        });
        printHtml += `</tbody>`;
// BLANK
        document.getElementById("termPrintTable").innerHTML = printHtml;
        termPrintPreviewModal.style.display = "flex";
      });
// BLANK
      btnCloseTermPreview.addEventListener("click", () => {
        termPrintPreviewModal.style.display = "none";
      });
// BLANK
      btnConfirmTermPrint.addEventListener("click", () => {
        const originalBody = document.body.innerHTML;
        const printContent = document.getElementById("termPrintArea").outerHTML;
// BLANK
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload();
      });
// BLANK
      
// BLANK
// BLANK
      // ================= [ ระบบ Mobile Responsive ] =================
      const mobileMenuBtn = document.getElementById("mobileMenuBtn");
      const sidebarElement = document.getElementById("sidebarElement");
      const sidebarBackdrop = document.getElementById("sidebarBackdrop");
      const menuItemsMobile = document.querySelectorAll(".menu-item, .sub-menu-item");
// BLANK
      function toggleMobileMenu() {
        sidebarElement.classList.toggle("show");
        sidebarBackdrop.classList.toggle("show");
      }
// BLANK
      function closeMobileMenu() {
        sidebarElement.classList.remove("show");
        sidebarBackdrop.classList.remove("show");
      }
// BLANK
      if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", toggleMobileMenu);
      }
      if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener("click", closeMobileMenu);
      }
      
      const desktopSidebarToggle = document.getElementById("desktopSidebarToggle");
      if (desktopSidebarToggle) {
        desktopSidebarToggle.addEventListener("click", () => {
          sidebarElement.classList.toggle("collapsed");
          if (sidebarElement.classList.contains("collapsed")) {
            desktopSidebarToggle.innerHTML = "❯";
          } else {
            desktopSidebarToggle.innerHTML = "❮";
          }
        });
      }
// BLANK
      // Auto close sidebar when a menu item is clicked on mobile
      menuItemsMobile.forEach(item => {
        item.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            closeMobileMenu();
          }
        });
      });
    window.showPremiumConfirm = function(title, text, onConfirm) {
    let overlay = document.getElementById('premiumConfirmOverlay');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'premiumConfirmOverlay';
        overlay.className = 'premium-confirm-overlay';
        overlay.innerHTML = `
            <div class="premium-confirm-box">
                <div class="premium-confirm-icon">🗑️</div>
                <div class="premium-confirm-title" id="premiumConfirmTitle"></div>
                <div class="premium-confirm-text" id="premiumConfirmText"></div>
                <div class="premium-confirm-actions">
                    <button class="premium-btn-cancel" id="premiumConfirmCancel">ยกเลิก</button>
                    <button class="premium-btn-confirm" id="premiumConfirmOk">ลบข้อมูล</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('premiumConfirmTitle').innerText = title;
    document.getElementById('premiumConfirmText').innerText = text;
    
    const btnOk = document.getElementById('premiumConfirmOk');
    const btnCancel = document.getElementById('premiumConfirmCancel');
    
    // Clear old listeners
    const newBtnOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);
    const newBtnCancel = btnCancel.cloneNode(true);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
    
    newBtnCancel.onclick = () => {
        overlay.classList.remove('show');
    };
    newBtnOk.onclick = () => {
        overlay.classList.remove('show');
        if(onConfirm) onConfirm();
    };
    
    // Show
    setTimeout(() => overlay.classList.add('show'), 10);
};
// BLANK
window.deleteAssignment = function(assignId) {
            return;
          }
// BLANK
          // Normalizing dates for query
          function normalize(dStr) {
            if (!dStr) return "";
            let p = dStr.split("-");
            if (p.length === 3 && parseInt(p[0]) > 2500) {
              p[0] = (parseInt(p[0]) - 543).toString();
              return p.join("-");
            }
            return dStr;
          }
// BLANK
          function fixYear(startStr, endStr) {
             if(startStr && endStr) {
                let d1 = new Date(startStr);
                let d2 = new Date(endStr);
                if(d1 > d2) {
                   d2.setFullYear(d2.getFullYear() + 1);
                   let y = d2.getFullYear();
                   let m = String(d2.getMonth() + 1).padStart(2, '0');
                   let d = String(d2.getDate()).padStart(2, '0');
                   return `${y}-${m}-${d}`;
                }
             }
             return endStr;
          }
// BLANK
          let t1s = normalize(window.classroomMeta.term1Start);
          let t1e = normalize(window.classroomMeta.term1End);
          let t2s = normalize(window.classroomMeta.term2Start);
          let t2e = normalize(window.classroomMeta.term2End);
          
          t1e = fixYear(t1s, t1e);
          t2e = fixYear(t2s, t2e);
// BLANK
          function isDateInSemester(dateStr) {
             let inT1 = t1s && t1e && dateStr >= t1s && dateStr <= t1e;
             let inT2 = t2s && t2e && dateStr >= t2s && dateStr <= t2e;
             if(semester === "1") return inT1;
             if(semester === "2") return inT2;
             if(semester === "all") return inT1 || inT2;
             return false;
          }
// BLANK
          // Fetch students in room
          const studentQ = query(
            getStudentsCollection(),
            where("room", "==", room)
          );
          const studentSnap = await getDocs(studentQ);
// BLANK
          let studentsList = [];
          studentSnap.forEach((doc) => {
            const d = doc.data();
            studentsList.push({
              id: doc.id,
              studentNo: d.studentNo,
              fullName: d.fullName,
              countMa: 0,
              countKhad: 0,
              countLa: 0,
              countPuay: 0,
            });
          });
// BLANK
          studentsList.sort((a, b) => a.studentNo - b.studentNo);
// BLANK
          if (studentsList.length === 0) {
            termReportTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">ไม่พบนักเรียนในห้องนี้</td></tr>`;
            return;
          }
// BLANK
          // Fetch attendance data for room within dates
          const attQ = query(
            getAttendanceCollection(),
            where("room", "==", room),
          );
          const attSnap = await getDocs(attQ);
// BLANK
          attSnap.forEach((doc) => {
            const data = doc.data();
            const recordDate = data.date;
            // Check if date is within term bounds
            if (isDateInSemester(recordDate)) {
              const student = studentsList.find((s) => s.id === data.studentId);
              if (student) {
                if (data.status === "มา") student.countMa++;
                else if (data.status === "ขาด") student.countKhad++;
                else if (data.status === "ลา") student.countLa++;
                else if (data.status === "ป่วย") student.countPuay++;
              }
            }
          });
// BLANK
          globalTermData = studentsList; // cache for printing
// BLANK
          let trHtml = "";
          studentsList.forEach((s) => {
            const totalValidClasses =
              s.countMa + s.countKhad + s.countLa + s.countPuay;
            let percent =
              totalValidClasses > 0 ? (s.countMa / totalValidClasses) * 100 : 0;
// BLANK
            let percentColor = "var(--text-color)";
            if (totalValidClasses > 0 && percent < 80)
              percentColor = "var(--red)";
// BLANK
            trHtml += `<tr>
                    <td style="font-weight:600; color:var(--gold-luxury); text-align:center;">${s.studentNo}</td>
                    <td style="font-weight:500;">${s.fullName}</td>
                    <td style="color:var(--green); font-weight:600; text-align:center;">${s.countMa}</td>
                    <td style="color:var(--red); font-weight:600; text-align:center;">${s.countKhad}</td>
                    <td style="color:var(--yellow); font-weight:600; text-align:center;">${s.countLa}</td>
                    <td style="color:var(--blue); font-weight:600; text-align:center;">${s.countPuay}</td>
                    <td style="font-weight:600; text-align:center;">${totalValidClasses}</td>
                    <td style="font-weight:600; color:${percentColor}; text-align:center;">${totalValidClasses > 0 ? percent.toFixed(2) + "%" : "-"}</td>
                </tr>`;
          });
          termReportTableBody.innerHTML = trHtml;
        } catch (err) {
          console.error(err);
          window.showToast("❌ เกิดข้อผิดพลาดในการดึงข้อมูล");
          termReportTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--red);">ไม่สามารถดึงข้อมูลได้</td></tr>`;
        }
      });
// BLANK
      btnPrintTermReport.addEventListener("click", () => {
        document.getElementById("termPrintSchoolTitle").textContent =
          document.getElementById("metaSchoolName")?.value || "ชื่อโรงเรียน";
        document.getElementById("termPrintRoom").textContent =
          termReportRoom.value.replace("ป.", "");
        document.getElementById("termPrintAcademicYear").textContent =
          metaYear.value || "-";
// BLANK
        let printHtml = `<thead>
            <tr>
                <th style="width: 40px;">ที่</th>
                <th>ชื่อ-นามสกุล</th>
                <th style="width: 50px;">มา</th>
                <th style="width: 50px;">ขาด</th>
                <th style="width: 50px;">ลา</th>
                <th style="width: 50px;">ป่วย</th>
                <th style="width: 80px;">รวมคาบ</th>
                <th style="width: 80px;">ร้อยละ</th>
            </tr>
        </thead><tbody>`;
// BLANK
        globalTermData.forEach((s) => {
          const totalValidClasses =
            s.countMa + s.countKhad + s.countLa + s.countPuay;
          let percent =
            totalValidClasses > 0 ? (s.countMa / totalValidClasses) * 100 : 0;
          printHtml += `<tr>
                <td>${s.studentNo}</td>
                <td style="text-align:left;">${s.fullName}</td>
                <td>${s.countMa}</td>
                <td>${s.countKhad}</td>
                <td>${s.countLa}</td>
                <td>${s.countPuay}</td>
                <td>${totalValidClasses}</td>
                <td>${totalValidClasses > 0 ? percent.toFixed(2) + "%" : "-"}</td>
            </tr>`;
        });
        printHtml += `</tbody>`;
// BLANK
        document.getElementById("termPrintTable").innerHTML = printHtml;
        termPrintPreviewModal.style.display = "flex";
      });
// BLANK
      btnCloseTermPreview.addEventListener("click", () => {
        termPrintPreviewModal.style.display = "none";
      });
// BLANK
      btnConfirmTermPrint.addEventListener("click", () => {
        const originalBody = document.body.innerHTML;
        const printContent = document.getElementById("termPrintArea").outerHTML;
// BLANK
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload();
      });
// BLANK
      
// BLANK
// BLANK
      // ================= [ ระบบ Mobile Responsive ] =================
      const mobileMenuBtn = document.getElementById("mobileMenuBtn");
      const sidebarElement = document.getElementById("sidebarElement");
      const sidebarBackdrop = document.getElementById("sidebarBackdrop");
      const menuItemsMobile = document.querySelectorAll(".menu-item, .sub-menu-item");
// BLANK
      function toggleMobileMenu() {
        sidebarElement.classList.toggle("show");
        sidebarBackdrop.classList.toggle("show");
      }
// BLANK
      function closeMobileMenu() {
        sidebarElement.classList.remove("show");
        sidebarBackdrop.classList.remove("show");
      }
// BLANK
      if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", toggleMobileMenu);
      }
      if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener("click", closeMobileMenu);
      }
      
      const desktopSidebarToggle = document.getElementById("desktopSidebarToggle");
      if (desktopSidebarToggle) {
        desktopSidebarToggle.addEventListener("click", () => {
          sidebarElement.classList.toggle("collapsed");
          if (sidebarElement.classList.contains("collapsed")) {
            desktopSidebarToggle.innerHTML = "❯";
          } else {
            desktopSidebarToggle.innerHTML = "❮";
          }
        });
      }
// BLANK
      // Auto close sidebar when a menu item is clicked on mobile
      menuItemsMobile.forEach(item => {
        item.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            closeMobileMenu();
          }
        });
      });
    window.showPremiumConfirm = function(title, text, onConfirm) {
    let overlay = document.getElementById('premiumConfirmOverlay');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'premiumConfirmOverlay';
        overlay.className = 'premium-confirm-overlay';
        overlay.innerHTML = `
            <div class="premium-confirm-box">
                <div class="premium-confirm-icon">🗑️</div>
                <div class="premium-confirm-title" id="premiumConfirmTitle"></div>
                <div class="premium-confirm-text" id="premiumConfirmText"></div>
                <div class="premium-confirm-actions">
                    <button class="premium-btn-cancel" id="premiumConfirmCancel">ยกเลิก</button>
                    <button class="premium-btn-confirm" id="premiumConfirmOk">ลบข้อมูล</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('premiumConfirmTitle').innerText = title;
    document.getElementById('premiumConfirmText').innerText = text;
    
    const btnOk = document.getElementById('premiumConfirmOk');
    const btnCancel = document.getElementById('premiumConfirmCancel');
    
    // Clear old listeners
    const newBtnOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);
    const newBtnCancel = btnCancel.cloneNode(true);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
    
    newBtnCancel.onclick = () => {
        overlay.classList.remove('show');
    };
    newBtnOk.onclick = () => {
        overlay.classList.remove('show');
        if(onConfirm) onConfirm();
    };
    
    // Show
    setTimeout(() => overlay.classList.add('show'), 10);
};
// BLANK
window.deleteAssignment = function(assignId) {
    window.showPremiumConfirm("ยืนยันการลบช่องคะแนน", "คุณแน่ใจหรือไม่ว่าต้องการลบช่องเก็บคะแนนนี้? ข้อมูลคะแนนของนักเรียนในช่องนี้จะถูกลบและไม่สามารถกู้คืนได้", async () => {
        const room = gradeEntryRoom.value;
        if(!room || !currentGradeEntryStructure) return;
        
        currentGradeEntryStructure.assignments = currentGradeEntryStructure.assignments.filter(a => a.id !== assignId);
        
        const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
        await setDoc(docRef, currentGradeEntryStructure);
        
        window.showToast("🗑️ ลบช่องคะแนนสำเร็จ");
        renderGradeEntryMatrix();
    });
};
window.editAssignment = function(assignId) {
    if(!currentGradeEntryStructure) return;
    const assign = currentGradeEntryStructure.assignments.find(a => a.id === assignId);
    if(!assign) return;
    
    let overlay = document.getElementById('editAssignOverlay');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'editAssignOverlay';
        overlay.className = 'premium-confirm-overlay';
        overlay.innerHTML = `
            <div class="premium-confirm-box" style="text-align: left;">
                <div style="color: white; font-size: 18px; margin-bottom: 20px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">✏️ แก้ไขช่องคะแนน</div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label>ชื่อช่องคะแนน</label>
                    <input type="text" id="editAssignName" class="form-control" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white;">
                </div>
                <div class="form-group" style="margin-bottom: 25px;">
                    <label>ตัวชี้วัด (ระบุหรือไม่ก็ได้)</label>
                    <input type="text" id="editAssignInd" class="form-control" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white;" placeholder="-">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button class="premium-btn-cancel" id="editAssignDelete" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 15px;">🗑️ ลบช่องนี้</button>
                    <div style="display: flex; gap: 10px;">
                        <button class="premium-btn-cancel" id="editAssignCancel" style="padding: 8px 15px;">ยกเลิก</button>
                        <button class="premium-btn-confirm" id="editAssignSave" style="background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); padding: 8px 15px;">💾 บันทึก</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('editAssignName').value = assign.name;
    document.getElementById('editAssignInd').value = assign.indicator || "";
    
    const btnCancel = document.getElementById('editAssignCancel');
    const btnSave = document.getElementById('editAssignSave');
    const btnDelete = document.getElementById('editAssignDelete');
    
    const newBtnCancel = btnCancel.cloneNode(true); btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
    const newBtnSave = btnSave.cloneNode(true); btnSave.parentNode.replaceChild(newBtnSave, btnSave);
    const newBtnDelete = btnDelete.cloneNode(true); btnDelete.parentNode.replaceChild(newBtnDelete, btnDelete);
    
    newBtnCancel.onclick = () => overlay.classList.remove('show');
    
    newBtnSave.onclick = async () => {
        const newName = document.getElementById('editAssignName').value.trim();
        if(!newName) return window.showToast("⚠️ กรุณาระบุชื่อช่องคะแนน", "error");
        const newInd = document.getElementById('editAssignInd').value.trim();
        
        assign.name = newName;
        assign.indicator = newInd;
        
        const room = gradeEntryRoom.value;
        const docRef = doc(db, "grade_structure", room.replace(/\//g, "_"));
        await setDoc(docRef, currentGradeEntryStructure);
        
        overlay.classList.remove('show');
        window.showToast("💾 บันทึกการแก้ไขสำเร็จ");
        renderGradeEntryMatrix();
    };
    
    newBtnDelete.onclick = () => {
        overlay.classList.remove('show');
        window.deleteAssignment(assign.id);
    };
    
    setTimeout(() => overlay.classList.add('show'), 10);
};
// ================= [ Missing Work Tracking Logic ] =================
// BLANK
let missingWorkMode = 'assignment'; // 'assignment' or 'student'
let mwStudents = []; // Cache students for missing work
// BLANK
window.switchGradeEntryTab = function(tabName) {
    const gradeBtn = document.getElementById("tabGradeEntryBtn");
    const missingBtn = document.getElementById("tabMissingWorkBtn");
    
    const gradeContainer = document.getElementById("gradeEntryModeContainer");
    const missingContainer = document.getElementById("missingWorkModeContainer");
// BLANK
    // Reset styles
    gradeBtn.style.color = "var(--text-muted)"; gradeBtn.style.borderBottomColor = "transparent"; gradeBtn.style.fontWeight = "normal";
    missingBtn.style.color = "var(--text-muted)"; missingBtn.style.borderBottomColor = "transparent"; missingBtn.style.fontWeight = "normal";
// BLANK
    // Hide containers
    gradeContainer.style.display = "none";
    missingContainer.style.display = "none";
// BLANK
    if(tabName === 'grade') {
        gradeContainer.style.display = "block";
        gradeBtn.style.color = "var(--blue-pearl)"; gradeBtn.style.borderBottomColor = "var(--blue-pearl)"; gradeBtn.style.fontWeight = "600";
        renderGradeEntryMatrix();
    } else {
        missingContainer.style.display = "block";
        missingBtn.style.color = "var(--blue-pearl)"; missingBtn.style.borderBottomColor = "var(--blue-pearl)"; missingBtn.style.fontWeight = "600";
        loadMissingWorkData();
    }
}
// BLANK
// ================= [ Dashboard Logic ] =================
window.renderGradeDashboard = async function() {
    const room = gradeEntryRoom ? gradeEntryRoom.value : "";
    if (!room) return;
// BLANK
    const dashRoomLabel = document.getElementById("dashboardRoomLabel");
    if(dashRoomLabel) dashRoomLabel.innerText = room;
// BLANK
    const subjectsSnap = await getDocs(query(collection(db, "subjects"), where("room", "==", room)));
    const subjTitle = document.getElementById("dashboardSubjectLabel");
    if(subjTitle) {
        if (!subjectsSnap.empty) {
            subjTitle.innerText = subjectsSnap.docs[0].data().name || "-";
        } else {
            subjTitle.innerText = "-";
        }
    }
// BLANK
    // Students
    let students = currentStudentsList;
    
    if(document.getElementById("dashboardStudentCountLabel")) document.getElementById("dashboardStudentCountLabel").innerText = students.length;
    if(document.getElementById("dashStatStudents")) document.getElementById("dashStatStudents").innerText = students.length;
// BLANK
    // Structure & Columns
    let totalCols = 0;
    if (currentGradeEntryStructure && currentGradeEntryStructure.assignments) {
        totalCols = currentGradeEntryStructure.assignments.length;
    }
    if(document.getElementById("dashStatColumns")) document.getElementById("dashStatColumns").innerText = totalCols;
// BLANK
    // Missing Work
    let totalMissing = 0;
    let missingByStudent = {};
    students.forEach(s => missingByStudent[s.id] = { student: s, count: 0 });
// BLANK
    if (currentGradeEntryStructure && currentGradeEntryStructure.assignments && currentGradeScores) {
        currentGradeEntryStructure.assignments.forEach(a => {
            students.forEach(s => {
                let gradeVal = currentGradeScores[s.id] ? currentGradeScores[s.id][a.id] : "";
                if (gradeVal === "" || gradeVal === null || gradeVal === undefined) {
                    totalMissing++;
                    if(missingByStudent[s.id]) missingByStudent[s.id].count++;
                }
            });
        });
    }
    if(document.getElementById("dashStatMissingTotal")) document.getElementById("dashStatMissingTotal").innerText = totalMissing;
// BLANK
    // Top 5 Missing
    let topMissing = Object.values(missingByStudent).filter(m => m.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
    let topMissingHtml = "";
    if (topMissing.length === 0) {
        topMissingHtml = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">ไม่มีนักเรียนที่ทำงานค้าง 🎉</div>';
    } else {
        topMissing.forEach((m, index) => {
            topMissingHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${index===0?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.05)'}; color: ${index===0?'#ef4444':'var(--text-muted)'}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</div>
                    <div>
                        <div style="font-weight: 500; font-size: 14px;">${m.student.fullName || '-'}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">เลขที่ ${m.student.studentNo || '-'} | รหัส ${m.student.studentId || '-'}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="text-align: right;">
                        <div style="font-size: 16px; font-weight: bold; color: #ef4444; line-height: 1;">${m.count}</div>
                        <div style="font-size: 10px; color: #ef4444;">ชิ้น</div>
                    </div>
                    <button class="btn" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 5px 10px; font-size: 11px; border-radius: 6px;" onclick="document.getElementById('mwStudentSelect').value = '${m.student.id}'; switchGradeEntryTab('missing');">ดูรายละเอียด</button>
                </div>
            </div>`;
        });
    }
    const missingListContainer = document.getElementById("dashTopMissingList");
    if(missingListContainer) missingListContainer.innerHTML = topMissingHtml;
// BLANK
    // Attendance
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    
    // Check if getAttendanceCollection is defined globally
    let attCol;
    if (typeof getAttendanceCollection === 'function') {
        attCol = getAttendanceCollection();
    } else {
        // Fallback: check current year 2568
        attCol = collection(db, "attendance");
    }
    
    const attSnap = await getDocs(query(attCol, where("room", "==", room)));
    
    // Date checking logic for Dashboard
    let currentSem = document.getElementById("gradeEntryTerm")?.value || document.getElementById("metaSemester")?.value || "1";
    let t1s = window.classroomMeta?.term1Start || "";
    let t1e = window.classroomMeta?.term1End || "";
    let t2s = window.classroomMeta?.term2Start || "";
    let t2e = window.classroomMeta?.term2End || "";
// BLANK
    function normalizeDash(dStr) {
        if (!dStr) return "";
        let p = dStr.split("-");
        if (p.length === 3 && parseInt(p[0]) > 2500) {
            p[0] = (parseInt(p[0]) - 543).toString();
            return p.join("-");
        }
        return dStr;
    }
    
    t1s = normalizeDash(t1s); t1e = normalizeDash(t1e);
    t2s = normalizeDash(t2s); t2e = normalizeDash(t2e);
// BLANK
    function fixYearDash(sStr, eStr) {
        if (!sStr || !eStr) return eStr;
        let d1 = new Date(sStr);
        let d2 = new Date(eStr);
        if (d1 > d2) {
            d2.setFullYear(d2.getFullYear() + 1);
            let y = d2.getFullYear();
            let m = String(d2.getMonth() + 1).padStart(2, '0');
            let d = String(d2.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return eStr;
    }
    t1e = fixYearDash(t1s, t1e);
    t2e = fixYearDash(t2s, t2e);
// BLANK
    function isDashDateInSem(dStr) {
        if (!t1s && !t2s) return true; // Unconfigured, allow all
        let d = normalizeDash(dStr);
        let inT1 = t1s && t1e && d >= t1s && d <= t1e;
        let inT2 = t2s && t2e && d >= t2s && d <= t2e;
        if(currentSem === "1") return inT1;
        if(currentSem === "2") return inT2;
        if(currentSem === "all") return inT1 || inT2;
        return inT1;
    }
// BLANK
// BLANK
    console.log("=== DASHBOARD ATTENDANCE DEBUG ===");
    console.log("Room:", room);
    console.log("CurrentSem:", currentSem);
    console.log("t1s:", t1s, "t1e:", t1e);
    console.log("t2s:", t2s, "t2e:", t2e);
    
    let dbgDates = [];
    attSnap.forEach(doc => {
        const data = doc.data();
        let inSem = isDashDateInSem(data.date);
        dbgDates.push({ date: data.date, inSem: inSem });
    });
    console.log("Total records:", dbgDates.length);
    console.log("Unique Dates inside Sem:", [...new Set(dbgDates.filter(x => x.inSem).map(x => x.date))]);
    
    let uniqueDates = new Set();
    attSnap.forEach(doc => {
        const data = doc.data();
        if (!isDashDateInSem(data.date)) return;
        if (data.date) uniqueDates.add(data.date);
        
        let stat = data.status || "";
        if (stat === "มา" || stat === "มาเรียน" || stat === "สาย") presentCount++;
        else if (stat === "ขาด") absentCount++;
        else if (stat === "ลา" || stat === "ป่วย" || stat === "ลากิจ" || stat === "ลาป่วย") leaveCount++;
    });
// BLANK
    let totalAtt = presentCount + absentCount + leaveCount;
    let attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;
    
    if(document.getElementById("dashStatAttTotal")) document.getElementById("dashStatAttTotal").innerText = uniqueDates.size;
    if(document.getElementById("dashStatAttPercent")) document.getElementById("dashStatAttPercent").innerText = attRate + "%";
// BLANK
    // Chart Animation
    let presentPct = totalAtt > 0 ? (presentCount / totalAtt) * 100 : 0;
    let leavePct = totalAtt > 0 ? (leaveCount / totalAtt) * 100 : 0;
    let absentPct = totalAtt > 0 ? (absentCount / totalAtt) * 100 : 0;
// BLANK
    let currentOffset = 0;
    
    const chartPresent = document.getElementById("dashChartPresent");
    const chartLeave = document.getElementById("dashChartLeave");
    const chartAbsent = document.getElementById("dashChartAbsent");
// BLANK
    if (chartPresent) {
        chartPresent.style.strokeDasharray = `${presentPct}, 100`;
        chartPresent.style.strokeDashoffset = `-${currentOffset}`;
        currentOffset += presentPct;
    }
    if (chartLeave) {
        chartLeave.style.strokeDasharray = `${leavePct}, 100`;
        chartLeave.style.strokeDashoffset = `-${currentOffset}`;
        currentOffset += leavePct;
    }
    if (chartAbsent) {
        chartAbsent.style.strokeDasharray = `${absentPct}, 100`;
        chartAbsent.style.strokeDashoffset = `-${currentOffset}`;
    }
};
// BLANK
window.switchMissingWorkMode = function(mode) {
    missingWorkMode = mode;
    if(mode === 'assignment') {
        document.getElementById("mwModeAssignmentBtn").style.background = "linear-gradient(135deg, #a855f7, #8b5cf6)";
        document.getElementById("mwModeAssignmentBtn").style.color = "white";
        document.getElementById("mwModeAssignmentBtn").style.border = "none";
        
        document.getElementById("mwModeStudentBtn").style.background = "rgba(255,255,255,0.05)";
        document.getElementById("mwModeStudentBtn").style.color = "var(--text-muted)";
        document.getElementById("mwModeStudentBtn").style.border = "1px solid rgba(255,255,255,0.1)";
        
        document.getElementById("mwSelectAssignmentContainer").style.display = "block";
        document.getElementById("mwSelectStudentContainer").style.display = "none";
    } else {
        document.getElementById("mwModeStudentBtn").style.background = "linear-gradient(135deg, #a855f7, #8b5cf6)";
        document.getElementById("mwModeStudentBtn").style.color = "white";
        document.getElementById("mwModeStudentBtn").style.border = "none";
        
        document.getElementById("mwModeAssignmentBtn").style.background = "rgba(255,255,255,0.05)";
        document.getElementById("mwModeAssignmentBtn").style.color = "var(--text-muted)";
        document.getElementById("mwModeAssignmentBtn").style.border = "1px solid rgba(255,255,255,0.1)";
        
        document.getElementById("mwSelectAssignmentContainer").style.display = "none";
        document.getElementById("mwSelectStudentContainer").style.display = "none";
    }
    renderMissingWorkResults();
}
// BLANK
window.loadMissingWorkData = async function() {
    const room = gradeEntryRoom ? gradeEntryRoom.value : "";
    if(!room) return;
    
    document.getElementById("missingWorkTitle").innerText = `ติดตามงานค้าง: ${room}`;
    
    // Load students for this room if not already loaded or room changed
    const studentsSnap = await getDocs(query(collection(db, "students"), where("room", "==", room), orderBy("studentNo", "asc")));
    mwStudents = [];
    studentsSnap.forEach(d => mwStudents.push({ id: d.id, ...d.data() }));
    
    const mwAssignmentSelect = document.getElementById("mwAssignmentSelect");
    mwAssignmentSelect.innerHTML = "<option value='all'>-- ดูทุกชิ้นงาน --</option>";
    if(currentGradeEntryStructure && currentGradeEntryStructure.assignments) {
        let sortedAssigns = [...currentGradeEntryStructure.assignments].map(a => {
            let unitIndex = currentGradeEntryStructure.units.findIndex(u => u.id === a.unitId);
            return { assign: a, unitIndex: unitIndex === -1 ? 999 : unitIndex };
        }).sort((a, b) => a.unitIndex - b.unitIndex);
        
        sortedAssigns.forEach(item => {
            const assignment = item.assign;
            let unit = currentGradeEntryStructure.units.find(u => u.id === assignment.unitId);
            let unitName = unit ? unit.name : 'ไม่ระบุหน่วย';
            let displayUnitName = item.unitIndex !== 999 ? `หน่วยที่ ${item.unitIndex + 1} ${unitName}` : unitName;
            const opt = document.createElement("option");
            opt.value = assignment.id;
            opt.text = `${displayUnitName} - ${assignment.name} (เต็ม ${assignment.fullScore})`;
            mwAssignmentSelect.appendChild(opt);
        });
    }
    
    const mwStudentSelect = document.getElementById("mwStudentSelect");
    mwStudentSelect.innerHTML = "<option value='all'>-- ดูทุกคนในห้อง --</option>";
    if(mwStudents.length > 0) {
        mwStudents.forEach(student => {
            const opt = document.createElement("option");
            opt.value = student.id;
            opt.text = `เลขที่ ${student.studentNo || '-'} ${student.fullName || ''}`;
            mwStudentSelect.appendChild(opt);
        });
    }
    
    mwAssignmentSelect.onchange = renderMissingWorkResults;
    mwStudentSelect.onchange = renderMissingWorkResults;
    
    renderMissingWorkResults();
}
// BLANK
window.renderMissingWorkResults = function() {
    const container = document.getElementById("mwResultsContainer");
    container.innerHTML = "";
    
    if(!currentGradeEntryStructure || !currentGradeEntryStructure.units || !mwStudents || !currentGradeScores) {
        container.innerHTML = "<div style='text-align:center; color:var(--text-muted); padding:30px;'>ไม่พบข้อมูลโครงสร้างคะแนน หรือ ข้อมูลนักเรียน</div>";
        return;
    }
    
    const selectedAssignment = document.getElementById("mwAssignmentSelect").value;
    const selectedStudent = document.getElementById("mwStudentSelect").value;
    
    let html = "";
    let foundMissing = false;
    
    if(missingWorkMode === 'assignment') {
        let assignmentsToCheck = [];
        if(currentGradeEntryStructure.assignments) {
            currentGradeEntryStructure.assignments.forEach(a => {
                if(selectedAssignment === 'all' || a.id === selectedAssignment) {
                    let unitIndex = currentGradeEntryStructure.units.findIndex(u => u.id === a.unitId);
                    let unit = currentGradeEntryStructure.units[unitIndex];
                    let unitName = unit ? unit.name : 'ไม่ระบุหน่วย';
                    let displayUnitName = unitIndex !== -1 ? `หน่วยที่ ${unitIndex + 1} ${unitName}` : unitName;
                    assignmentsToCheck.push({unitName: displayUnitName, assignment: a, unitIndex: unitIndex === -1 ? 999 : unitIndex});
                }
            });
            assignmentsToCheck.sort((a, b) => a.unitIndex - b.unitIndex);
        }
        
        assignmentsToCheck.forEach(item => {
            const a = item.assignment;
            const aid = a.id;
            
            let missingStudents = [];
            mwStudents.forEach(student => {
                const sid = student.id;
                let gradeVal = currentGradeScores[sid] ? currentGradeScores[sid][aid] : "";
                if(gradeVal === "" || gradeVal === null || gradeVal === undefined) {
                    missingStudents.push(student);
                }
            });
            
            if(missingStudents.length > 0) {
                foundMissing = true;
                if(selectedAssignment !== 'all') {
                    html += `
                    <div class="card" style="margin-bottom: 15px; padding: 0;">
                        <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="color: var(--blue-pearl); display: flex; align-items: center; gap: 10px; margin: 0;">
                               รายชื่อผู้ที่ยังไม่ส่ง: ${item.unitName} - ${a.name}
                            </h4>
                            <span style="font-size:14px; padding: 4px 12px; border-radius: 20px; background: rgba(245,158,11,0.2); color:#fcd34d;">ค้างส่ง ${missingStudents.length} คน</span>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="table" style="margin: 0; width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="padding: 15px 20px; text-align: center; width: 80px; color: var(--blue-pearl); font-weight: normal; border-bottom: 1px solid rgba(255,255,255,0.1);">เลขที่</th>
                                        <th style="padding: 15px 20px; text-align: left; color: var(--blue-pearl); font-weight: normal; border-bottom: 1px solid rgba(255,255,255,0.1);">ชื่อ - นามสกุล</th>
                                        <th style="padding: 15px 20px; text-align: center; width: 150px; color: var(--blue-pearl); font-weight: normal; border-bottom: 1px solid rgba(255,255,255,0.1);">กรอกคะแนน (เต็ม ${a.fullScore})</th>
                                        <th style="padding: 15px 20px; text-align: center; width: 100px; color: var(--blue-pearl); font-weight: normal; border-bottom: 1px solid rgba(255,255,255,0.1);">บันทึก</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    missingStudents.forEach(st => {
                        html += `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 15px 20px; text-align: center; color: white;">${st.studentNo || '-'}</td>
                                        <td style="padding: 15px 20px; text-align: left; color: white;">${st.fullName || ''}</td>
                                        <td style="padding: 15px 20px; text-align: center;">
                                            <input type="number" id="mw_score_${a.id}_${st.id}" style="width: 70px; text-align: center; padding: 6px; border-radius: 6px; border: none; background: rgba(255,255,255,0.1); color: white;" placeholder="-" max="${a.fullScore}">
                                        </td>
                                        <td style="padding: 15px 20px; text-align: center;">
                                            <button onclick="saveMissingWorkScore('${a.id}', '${st.id}')" style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; cursor: pointer; font-size: 13px; font-weight: 500; padding: 6px 16px; border-radius: 6px; transition: 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.3)'" onmouseout="this.style.background='rgba(59,130,246,0.15)'">
                                                บันทึก
                                            </button>
                                        </td>
                                    </tr>
                        `;
                    });
                    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                    `;
                } else {
                    html += `
                        <div class="card" style="margin-bottom: 15px; border-left: 4px solid #ef4444; padding: 20px;">
                            <h4 style="margin-bottom: 15px; color: white; display: flex; align-items: center; gap: 10px;">
                               <i class="fas fa-file-alt" style="color: #ef4444;"></i>
                               ${item.unitName} - ${a.name} 
                               <span style="font-size:12px; padding: 2px 8px; border-radius: 20px; background: rgba(239,68,68,0.2); color:#fca5a5; font-weight:normal;">ค้าง ${missingStudents.length} คน</span>
                            </h4>
                            <div style="display:flex; flex-wrap:wrap; gap:10px;">
                    `;
                    missingStudents.forEach(st => {
                        html += `<div style="background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; padding:6px 12px; border-radius:20px; font-size:13px; display:flex; align-items:center; gap:8px;">
                                     <div style="width:20px; height:20px; background:rgba(239,68,68,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold;">${st.studentNo || '-'}</div>
                                     ${st.fullName || ''}
                                 </div>`;
                    });
                    html += `</div></div>`;
                }
            }
        });
        
    } else {
        // Master-Detail Layout for Students
        
        // 1. Calculate missing assignments for ALL students
        let studentMissingData = [];
        
        mwStudents.forEach(student => {
            const sid = student.id;
            let missingAssignments = [];
            
            if(currentGradeEntryStructure.assignments) {
                let sortedAssigns = [...currentGradeEntryStructure.assignments].map(a => {
                    let unitIndex = currentGradeEntryStructure.units.findIndex(u => u.id === a.unitId);
                    return { assign: a, unitIndex: unitIndex === -1 ? 999 : unitIndex };
                }).sort((a, b) => a.unitIndex - b.unitIndex);
                
                sortedAssigns.forEach(item => {
                    let a = item.assign;
                    let gradeVal = currentGradeScores[sid] ? currentGradeScores[sid][a.id] : "";
                    if(gradeVal === "" || gradeVal === null || gradeVal === undefined) {
                        let unit = currentGradeEntryStructure.units.find(u => u.id === a.unitId);
                        let unitName = unit ? unit.name : 'ไม่ระบุหน่วย';
                        let displayUnitName = item.unitIndex !== 999 ? `หน่วยที่ ${item.unitIndex + 1} ${unitName}` : unitName;
                        missingAssignments.push({unitName: displayUnitName, assignment: a});
                    }
                });
            }
            
            studentMissingData.push({
                student: student,
                missing: missingAssignments
            });
        });
        
        window.mwStudentMissingData = studentMissingData; // Save for detail view
        
        // Build Sidebar HTML
        let sidebarHtml = `
            <div style="width: 300px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column;">
                <div style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600; font-size: 16px; color: white;">
                    รายชื่อนักเรียน
                </div>
                <div style="flex: 1; overflow-y: auto; padding: 10px; max-height: 600px;" class="custom-scrollbar">
        `;
        
        studentMissingData.forEach(data => {
            let pillHtml = "";
            if(data.missing.length > 0) {
                pillHtml = `<span style="background: #fcd34d; color: #92400e; font-size: 12px; padding: 2px 8px; border-radius: 20px; font-weight: 600;">${data.missing.length} งาน</span>`;
            } else {
                pillHtml = `<span style="background: rgba(34,197,94,0.2); color: #4ade80; font-size: 12px; padding: 2px 8px; border-radius: 20px; font-weight: 600;">ครบ</span>`;
            }
            
            sidebarHtml += `
                <div onclick="showMwStudentDetail('${data.student.id}')" id="mw_sidebar_st_${data.student.id}" style="padding: 12px 15px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; margin-bottom: 5px;" class="mw-student-sidebar-item" onmouseover="if(!this.classList.contains('active')) this.style.background='rgba(255,255,255,0.05)'" onmouseout="if(!this.classList.contains('active')) this.style.background='transparent'">
                    <span style="color: white; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 24px; height: 24px; background: rgba(168,85,247,0.2); border: 1px solid rgba(168,85,247,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #d8b4fe; flex-shrink: 0;">${data.student.studentNo || '-'}</div>
                        ${data.student.fullName || ''}
                    </span>
                    ${pillHtml}
                </div>
            `;
        });
        
        sidebarHtml += `
                </div>
            </div>
        `;
        
        let detailHtml = `
            <div style="flex: 1; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; min-height: 500px;" id="mwStudentDetailContainer">
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted);">
                    <i class="fas fa-user-friends" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>คลิกเลือกชื่อนักเรียนทางด้านซ้ายเพื่อดูงานค้าง</p>
                </div>
            </div>
        `;
        
        html = `
            <div style="display: flex; gap: 20px; align-items: stretch;">
                ${sidebarHtml}
                ${detailHtml}
            </div>
        `;
        
        foundMissing = true; // Always true so it displays the layout instead of 'No Missing Work' message
        
        // Restore selected student after rendering if any
        if(window.currentMwSelectedStudentId) {
            setTimeout(() => {
                if(typeof showMwStudentDetail === 'function') {
                    showMwStudentDetail(window.currentMwSelectedStudentId);
                }
            }, 50);
        }
    }
    
    if(!foundMissing) {
        html = `
            <div style="text-align: center; padding: 40px 20px; background: rgba(34,197,94,0.1); border: 1px dashed rgba(34,197,94,0.3); border-radius: 12px;">
               <div style="font-size: 40px; margin-bottom: 10px;">🎉</div>
               <h3 style="color: #4ade80; margin-bottom: 5px;">ยอดเยี่ยม! ไม่มีงานค้าง</h3>
               <p style="color: var(--text-muted); font-size: 14px;">นักเรียนทุกคนส่งงานครบถ้วนในหมวดหมู่นี้</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}
// BLANK
window.showMwStudentDetail = function(studentId) {
    window.currentMwSelectedStudentId = studentId;
    
    // Highlight sidebar
    document.querySelectorAll('.mw-student-sidebar-item').forEach(el => {
        el.style.background = 'transparent';
        el.classList.remove('active');
    });
    let activeItem = document.getElementById('mw_sidebar_st_' + studentId);
    if(activeItem) {
        activeItem.style.background = 'rgba(255,255,255,0.1)';
        activeItem.classList.add('active');
    }
    
    let data = window.mwStudentMissingData ? window.mwStudentMissingData.find(d => d.student.id === studentId) : null;
    let detailContainer = document.getElementById('mwStudentDetailContainer');
    if(!data || !detailContainer) return;
    
    if(data.missing.length === 0) {
        detailContainer.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #4ade80;">
                <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px; opacity: 0.8;"></i>
                <h3 style="margin:0;">ยอดเยี่ยม!</h3>
                <p style="margin-top:10px; color:var(--text-muted);">นักเรียนคนนี้ส่งงานครบทุกชิ้นแล้ว</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <h3 style="color: white; margin: 0; display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; background: rgba(168,85,247,0.2); border: 1px solid rgba(168,85,247,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: #d8b4fe; flex-shrink: 0;">${data.student.studentNo || '-'}</div>
                ${data.student.fullName || ''}
                <span style="font-size:14px; padding: 4px 12px; border-radius: 20px; background: rgba(245,158,11,0.2); color:#fcd34d; font-weight:normal; margin-left: 5px;">ค้าง ${data.missing.length} ชิ้น</span>
            </h3>
        </div>
        <div style="padding: 20px; flex: 1; overflow-y: auto;" class="custom-scrollbar">
            <div style="display:flex; flex-direction:column; gap:10px;">
    `;
    
    data.missing.forEach(item => {
        let a = item.assignment;
        html += `
            <div style="background:rgba(245,158,11,0.05); border:1px solid rgba(245,158,11,0.3); padding:15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="color: #fcd34d; font-weight: 500; font-size: 15px;">${item.unitName} - ${a.name}</div>
                    <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">เต็ม ${a.fullScore} คะแนน</div>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <input type="number" id="mw_score_${a.id}_${data.student.id}" style="width: 70px; text-align: center; padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white;" placeholder="-" max="${a.fullScore}">
                    <button onclick="saveMissingWorkScore('${a.id}', '${data.student.id}');" style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; cursor: pointer; font-size: 13px; font-weight: 500; padding: 6px 16px; border-radius: 6px; transition: 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.3)'" onmouseout="this.style.background='rgba(59,130,246,0.15)'">บันทึก</button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    detailContainer.innerHTML = html;
}
// BLANK
window.saveMissingWorkScore = async function(aid, sid) {
    const input = document.getElementById(`mw_score_${aid}_${sid}`);
    if(!input || input.value === "") {
        window.showToast("⚠️ กรุณากรอกคะแนนก่อนบันทึก");
        return;
    }
    
    let score = Number(input.value);
    const room = gradeEntryRoom.value;
    
    if(!currentGradeScores[sid]) currentGradeScores[sid] = {};
    currentGradeScores[sid][aid] = score;
    
    try {
        const ref = doc(db, "grade_scores", sid);
        await setDoc(ref, { room: room, scores: currentGradeScores[sid] }, { merge: true });
        window.showToast("✅ บันทึกคะแนนสำเร็จ");
        
        // Update input UI to show it's saved
        input.disabled = true;
        input.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
        input.style.color = "#10b981";
        
        // Find button based on mode layout
        let btn = null;
        if(missingWorkMode === 'assignment') {
            const nextTd = input.parentElement.nextElementSibling;
            if(nextTd) btn = nextTd.querySelector('button');
        } else {
            btn = input.nextElementSibling;
        }
        
        if(btn && btn.tagName === 'BUTTON') {
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.color = "#10b981";
            btn.disabled = true;
        }
        
        setTimeout(() => {
            if (missingWorkMode === 'student') {
                renderMissingWorkResults(); // Refresh everything to update sidebar pills
            } else {
                const row = input.closest('tr');
                if(row) {
                    row.style.transition = 'opacity 0.5s, transform 0.5s';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        row.remove();
                        // Update the counter badge
                        const badge = document.querySelector('span[style*="background: rgba(245,158,11,0.2)"]');
                        if(badge) {
                            let text = badge.innerText;
                            let count = parseInt(text.replace(/[^0-9]/g, ''));
                            if(!isNaN(count) && count > 0) {
                                badge.innerText = `ค้างส่ง ${count - 1} คน`;
                                if(count - 1 === 0) {
                                    renderMissingWorkResults(); // Show the "No missing work" celebration
                                }
                            }
                        }
                    }, 500);
                }
            }
        }, 800);
        
    } catch(err) {
        console.error(err);
        window.showToast("❌ เกิดข้อผิดพลาดในการบันทึก");
    }
};
// BLANK
/* ========================================================================= */
/* EVALUATION 3-ASPECTS PAGE LOGIC                                           */
/* ========================================================================= */
window.currentEvalTab = 'char';
window.currentEvalScores = {};
// BLANK
window.evalConfig = {
    'char': {
        title: 'ประเมินคุณลักษณะอันพึงประสงค์',
        items: [
            '1. รักชาติ ศาสน์ กษัตริย์', '2. ซื่อสัตย์สุจริต', '3. มีวินัย', '4. ใฝ่เรียนรู้',
            '5. อยู่อย่างพอเพียง', '6. มุ่งมั่นในการทำงาน', '7. รักความเป็นไทย', '8. มีจิตสาธารณะ'
        ]
    },
    'read': {
        title: 'ประเมินอ่าน คิดวิเคราะห์ เขียน',
        items: [
            '1. การอ่าน', '2. การคิดวิเคราะห์', '3. การเขียน'
        ]
    },
    'comp': {
        title: 'ประเมินสมรรถนะสำคัญของผู้เรียน',
        items: [
            '1. ความสามารถในการสื่อสาร', '2. ความสามารถในการคิด', '3. ความสามารถในการแก้ปัญหา',
            '4. ความสามารถในการใช้ทักษะชีวิต', '5. ความสามารถในการใช้เทคโนโลยี'
        ]
    }
};
// BLANK
window.switchEvalTab = function(tabId) {
    document.querySelectorAll('.eval-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = 'var(--text-muted)';
        btn.style.borderBottom = '2px solid transparent';
    });
    const activeBtn = document.getElementById('eval-tab-' + tabId);
    if(activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = 'var(--primary-color)';
        activeBtn.style.borderBottom = '2px solid var(--primary-color)';
    }
    
    currentEvalTab = tabId;
    document.getElementById('eval-page-title').innerText = evalConfig[tabId].title;
    renderEvalTable();
};
// BLANK
window.renderEvalTable = function() {
    const thead = document.getElementById("evaluationThead");
    const tbody = document.getElementById("evaluationTbody");
    if(!thead || !tbody) return;
    
    // Header
    let trHead = document.createElement("tr");
    trHead.innerHTML = `
        <th class="sticky-col" style="width: 50px; text-align: center;">เลขที่</th>
        <th class="sticky-col-2" style="width: 250px;">ชื่อ - นามสกุล</th>
    `;
    const items = evalConfig[currentEvalTab].items;
    items.forEach(item => {
        trHead.innerHTML += `<th style="text-align: center; font-size:12px; min-width:120px; white-space: normal; padding: 10px; line-height: 1.4; vertical-align: middle;">${item}</th>`;
    });
    trHead.innerHTML += `<th style="text-align: center; font-weight:bold; color:var(--gold-luxury);">สรุปผล</th>`;
    thead.innerHTML = "";
    thead.appendChild(trHead);
    
    // Body
    tbody.innerHTML = "";
    if (!window.evalStudents || window.evalStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${items.length + 3}" style="text-align:center; padding:20px; color:var(--text-muted);">ไม่พบข้อมูลนักเรียน กรุณาเพิ่มนักเรียนในห้องเรียนนี้</td></tr>`;
        return;
    }
    
    window.evalStudents.forEach(s => {
        let tr = document.createElement("tr");
        let html = `
            <td class="sticky-col" style="text-align: center;">${s.studentNo}</td>
            <td class="sticky-col-2">${s.fullName}</td>
        `;
        
        let sScores = currentEvalScores[s.id] || {};
        let tabScores = sScores[currentEvalTab] || {};
        
        items.forEach((item, idx) => {
            let val = tabScores[idx] !== undefined ? tabScores[idx] : "-";
            let displayVal = val === "-" ? "" : val;
            html += `
                <td style="text-align: center; padding: 5px;">
                    <input type="text" maxlength="1" class="form-control" 
                        style="width: 50px; text-align: center; display: inline-block; background:rgba(255,255,255,0.05); color:white; border:1px solid var(--border-line); border-radius: 5px;" 
                        value="${displayVal}"
                        oninput="this.value = this.value.replace(/[^0-3]/g, ''); updateEvalScore('${s.id}', ${idx}, this.value || '-');" 
                    />
                </td>
            `;
        });
        
        html += `<td style="text-align: center; font-weight:bold; color:var(--gold-luxury); font-size:16px;" id="eval_sum_${s.id}">-</td>`;
        tr.innerHTML = html;
        tbody.appendChild(tr);
        
        // Initial Calculation
        calculateEvalSummary(s.id);
    });
};
// BLANK
window.updateEvalScore = function(studentId, itemIndex, value) {
    if(!currentEvalScores[studentId]) currentEvalScores[studentId] = {};
    if(!currentEvalScores[studentId][currentEvalTab]) currentEvalScores[studentId][currentEvalTab] = {};
    
    if(value === "-") {
        delete currentEvalScores[studentId][currentEvalTab][itemIndex];
    } else {
        currentEvalScores[studentId][currentEvalTab][itemIndex] = Number(value);
    }
    
    calculateEvalSummary(studentId);
};
// BLANK
window.calculateEvalSummary = function(studentId) {
    const el = document.getElementById("eval_sum_" + studentId);
    if(!el) return;
    
    let tabScores = (currentEvalScores[studentId] && currentEvalScores[studentId][currentEvalTab]) ? currentEvalScores[studentId][currentEvalTab] : {};
    let itemsCount = evalConfig[currentEvalTab].items.length;
    
    let counts = {3:0, 2:0, 1:0, 0:0, missing:0};
    let minScore = 3;
    let anyZero = false;
    
    for(let i=0; i<itemsCount; i++) {
        if(tabScores[i] !== undefined) {
            let v = tabScores[i];
            counts[v] = (counts[v] || 0) + 1;
            if(v < minScore) minScore = v;
            if(v === 0) anyZero = true;
        } else {
            counts.missing++;
        }
    }
    
    // If not completely filled, return "-"
    if(counts.missing > 0) {
        el.innerText = "-";
        el.style.color = "var(--text-muted)";
        return;
    }
    
    let summary = 0;
    let color = "var(--red)";
    let halfPlus = Math.floor(itemsCount / 2) + 1;
    
    if(anyZero) {
        summary = 0;
    } else if(counts[3] >= halfPlus && minScore >= 2) {
        summary = 3;
        color = "var(--green)";
    } else if((counts[3] + counts[2]) >= halfPlus && minScore >= 1) {
        summary = 2;
        color = "var(--primary-color)";
    } else {
        summary = 1;
        color = "var(--yellow)";
    }
    
    let textDesc = "";
    if (summary === 3) textDesc = "ดีเยี่ยม";
    else if (summary === 2) textDesc = "ดี";
    else if (summary === 1) textDesc = "ผ่าน";
    else if (summary === 0) textDesc = "ไม่ผ่าน";
// BLANK
    let bgRgba = "";
    let textColor = color;
    
    if (summary === 3) {
        bgRgba = "rgba(16, 185, 129, 0.15)";
    } else if (summary === 2) {
        color = "#c084fc"; // purple color for everything
        textColor = "#c084fc";
        bgRgba = "rgba(192, 132, 252, 0.15)"; // purple background glow
    } else if (summary === 1) {
        bgRgba = "rgba(245, 158, 11, 0.15)";
    } else if (summary === 0) {
        bgRgba = "rgba(239, 68, 68, 0.15)";
    }
// BLANK
    el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
            <span style="font-size: 16px; font-weight: bold; background: ${bgRgba}; color: ${color}; padding: 2px 14px; border-radius: 12px; border: 1px solid ${color}; line-height: 1;">${summary}</span>
            <span style="font-size: 12px; color: ${textColor}; font-weight: 500;">${textDesc}</span>
        </div>
    `;
};
// BLANK
window.saveEvaluations = async function() {
    if(!window.currentClass) {
        window.showToast("❌ กรุณาเลือกห้องเรียนก่อน");
        return;
    }
    try {
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = "กำลังบันทึก...";
        btn.disabled = true;
        
        const safeRoomName = window.currentClass.replace(/\//g, "_");
        const docRef = doc(db, "classrooms", safeRoomName, "evaluations", "scores");
        await setDoc(docRef, currentEvalScores);
        
        window.showToast("✅ บันทึกข้อมูลการประเมินเรียบร้อย");
        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch(err) {
        console.error(err);
        window.showToast("❌ เกิดข้อผิดพลาดในการบันทึก");
        event.currentTarget.innerHTML = "💾 บันทึกการประเมิน";
        event.currentTarget.disabled = false;
    }
};
// BLANK
window.loadEvaluations = async function() {
    if(!window.currentClass) {
        currentEvalScores = {};
        window.evalStudents = [];
        renderEvalTable();
        return;
    }
    try {
        // Load Students
        const studentsSnap = await getDocs(query(collection(db, "students"), where("room", "==", window.currentClass), orderBy("studentNo", "asc")));
        window.evalStudents = [];
        studentsSnap.forEach(d => window.evalStudents.push({ id: d.id, ...d.data() }));
// BLANK
        // Load Scores
        const safeRoomName = window.currentClass.replace(/\//g, "_");
        const docRef = doc(db, "classrooms", safeRoomName, "evaluations", "scores");
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            currentEvalScores = docSnap.data() || {};
        } else {
            currentEvalScores = {};
        }
        renderEvalTable();
    } catch(err) {
        console.error(err);
        currentEvalScores = {};
        window.evalStudents = [];
        renderEvalTable();
    }
};
// BLANK
window.renderEvaluationRoomTabs = function() {
    const tabsContainer = document.getElementById("evaluationRoomTabs");
    const evalRoom = document.getElementById("evaluationRoom");
    if(!tabsContainer || !evalRoom) return;
    
    const options = Array.from(evalRoom.options);
    
    let autoSelected = false;
    if(!evalRoom.value && options.length > 1) {
        for(let i=0; i<options.length; i++) {
            if(options[i].value) {
                evalRoom.value = options[i].value;
                autoSelected = true;
                break;
            }
        }
    }
    
    if(autoSelected) {
        window.currentClass = evalRoom.value;
        if(typeof loadEvaluations === "function") loadEvaluations();
    }
    
    if(typeof window.renderRadialMenuToContainer === "function") {
        window.renderRadialMenuToContainer(tabsContainer, evalRoom, () => {
            window.currentClass = evalRoom.value;
            renderEvaluationRoomTabs();
            if(typeof loadEvaluations === "function") loadEvaluations();
        });
    }
};
// BLANK
// Expose to window for HTML onclick handlers
window.generateUUID = generateUUID;
window.loadGradeStructure = loadGradeStructure;
window.renderGradeStructureUI = renderGradeStructureUI;
window.saveGradeStructureToDB = saveGradeStructureToDB;
window.loadGradeEntryData = loadGradeEntryData;
window.updateGradeEntryUnitDropdown = updateGradeEntryUnitDropdown;
window.renderGradeEntryMatrix = renderGradeEntryMatrix;
window.renderCourseStructureDetails = renderCourseStructureDetails;
// BLANK
window.renderRadialMenuToContainer = function(tabsContainer, selectElement, onChangeCallback) {
    if(!tabsContainer || !selectElement) return;
    tabsContainer.innerHTML = "";
    const options = Array.from(selectElement.options).filter(opt => opt.value !== "");
    if(options.length === 0) return;
    
    const activeOpt = options.find(o => o.value === selectElement.value) || options[0];
    const activeLabel = activeOpt ? activeOpt.text : "เลือกห้อง";
// BLANK
    const radialContainer = document.createElement("div");
    radialContainer.className = "room-radial-container show";
    
    const centerBtn = document.createElement("div");
    centerBtn.className = "room-radial-center";
    centerBtn.innerHTML = `🗂️<br><span>ชั้นเรียน</span>`;
    
    const itemsWrap = document.createElement("div");
    itemsWrap.className = "room-radial-items";
    
    let isOpen = false;
    centerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        if(isOpen) radialContainer.classList.add("open");
        else radialContainer.classList.remove("open");
    });
// BLANK
    const totalItems = options.length;
    
    // Calculate radius and layers if too many items
    options.forEach((opt, index) => {
        const item = document.createElement("div");
        item.className = "room-radial-item";
        if(selectElement.value === opt.value) item.classList.add("active-room");
        item.innerText = opt.text;
        
        let radius = Math.max(120, 80 + (totalItems * 10));
        let angle;
        
        // If more than 8 items, create 2 layers
        if (totalItems > 8) {
            const isOuter = index % 2 === 0;
            radius = isOuter ? 160 : 100;
            const itemsInLayer = isOuter ? Math.ceil(totalItems / 2) : Math.floor(totalItems / 2);
            const layerIndex = Math.floor(index / 2);
            const startAngle = Math.PI; 
            const endAngle = Math.PI * 1.5; 
            angle = itemsInLayer === 1 ? Math.PI * 1.25 : startAngle + (layerIndex * ((endAngle - startAngle) / (itemsInLayer - 1)));
        } else {
            const startAngle = Math.PI; 
            const endAngle = Math.PI * 1.5; 
            angle = totalItems === 1 ? Math.PI * 1.25 : startAngle + (index * ((endAngle - startAngle) / (totalItems - 1)));
        }
        
        item.style.left = (Math.cos(angle) * radius) + "px";
        item.style.top = (Math.sin(angle) * radius) + "px";
        
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            selectElement.value = opt.value;
            radialContainer.classList.remove("open");
            isOpen = false;
            if(onChangeCallback) onChangeCallback();
            else selectElement.dispatchEvent(new Event("change"));
        });
        
        itemsWrap.appendChild(item);
    });
    
    radialContainer.appendChild(centerBtn);
    radialContainer.appendChild(itemsWrap);
    tabsContainer.appendChild(radialContainer);
    
    document.addEventListener("click", function closeRadial(e) {
        if(!document.body.contains(radialContainer)) {
            document.removeEventListener("click", closeRadial);
            return;
        }
        if(isOpen && !radialContainer.contains(e.target)) {
            isOpen = false;
            radialContainer.classList.remove("open");
        }
    });
};
// BLANK
// BLANK
// BLANK
      // ================= [ สำรองข้อมูล (Backup to Excel) ] =================
      window.exportAllDataToExcel = async function() {
        if (typeof XLSX === "undefined") {
            window.showToast("❌ ระบบโหลดไลบรารีสร้าง Excel ไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ", "error");
            return;
        }
// BLANK
        window.showToast("⏳ กำลังเตรียมข้อมูลทั้งหมด กรุณารอสักครู่ (อาจใช้เวลา 3-5 วินาที)...", "info");
// BLANK
        try {
            const wb = XLSX.utils.book_new();
// BLANK
            // 1. ห้องเรียน
            const roomsSnap = await getDocs(getRoomsCollection());
            const roomsData = [];
            roomsSnap.forEach(doc => {
                const d = doc.data();
                roomsData.push({ "รหัสเอกสาร": doc.id, "ชื่อห้องเรียน": d.roomName || "" });
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roomsData.length ? roomsData : [{"ไม่มีข้อมูล": "-"}]), "ห้องเรียน");
// BLANK
            // 2. นักเรียน
            const studentsSnap = await getDocs(getStudentsCollection());
            const studentsData = [];
            studentsSnap.forEach(doc => {
                const d = doc.data();
                studentsData.push({ 
                    "ห้องเรียน": d.room || "", 
                    "เลขที่": d.studentNo || "", 
                    "ชื่อ-สกุล": d.fullName || "",
                    "รหัสเอกสาร": doc.id 
                });
            });
            studentsData.sort((a, b) => a["ห้องเรียน"].localeCompare(b["ห้องเรียน"]) || a["เลขที่"] - b["เลขที่"]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentsData.length ? studentsData : [{"ไม่มีข้อมูล": "-"}]), "นักเรียน");
// BLANK
            // 3. เวลาเรียน (Attendance)
            const attSnap = await getDocs(getAttendanceCollection());
            const attData = [];
            attSnap.forEach(doc => {
                const d = doc.data();
                attData.push({
                    "ห้องเรียน": d.room || "",
                    "วันที่": d.date || "",
                    "เลขที่": d.studentNo || "",
                    "สถานะ": d.status || "",
                    "สาเหตุ": d.reason || "",
                    "บันทึกเมื่อ": d.timestamp ? new Date(d.timestamp).toLocaleString("th-TH") : ""
                });
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attData.length ? attData : [{"ไม่มีข้อมูล": "-"}]), "เวลาเรียน");
// BLANK
            // 4. คะแนน (Grade Scores)
            const scoresSnap = await getDocs(collection(db, "grade_scores"));
            const scoresData = [];
            scoresSnap.forEach(doc => {
                const d = doc.data();
                const obj = { "ห้องเรียน": d.room || "", "เลขที่": d.studentNo || "" };
                if (d.scores) {
                    for (const [key, val] of Object.entries(d.scores)) {
                        obj[key] = val;
                    }
                }
                scoresData.push(obj);
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scoresData.length ? scoresData : [{"ไม่มีข้อมูล": "-"}]), "คะแนนเก็บ");
// BLANK
            // 5. โครงสร้างวิชา (Subjects)
            const subjectsSnap = await getDocs(collection(db, "subjects"));
            const subjectsData = [];
            subjectsSnap.forEach(doc => {
                const d = doc.data();
                subjectsData.push({
                    "ห้องเรียน": d.room || "",
                    "รหัสวิชา": d.subjectCode || "",
                    "ชื่อวิชา": d.subjectName || "",
                    "หน่วยกิต": d.credits || "",
                    "ภาคเรียน": d.semester || ""
                });
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subjectsData.length ? subjectsData : [{"ไม่มีข้อมูล": "-"}]), "รายวิชา");
// BLANK
            // 6. การประเมิน (Evaluations)
            const evalSnap = await getDocs(collection(db, "evaluations"));
            const evalData = [];
            evalSnap.forEach(doc => {
                const d = doc.data();
                const obj = { "ห้องเรียน": d.room || "", "เลขที่": d.studentNo || "", "ภาคเรียน": d.semester || "" };
                if (d.criteria) {
                    for (const [key, val] of Object.entries(d.criteria)) {
                        obj[key] = val;
                    }
                }
                evalData.push(obj);
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(evalData.length ? evalData : [{"ไม่มีข้อมูล": "-"}]), "การประเมิน");
// BLANK
            // 7. โครงสร้างคะแนน (Grade Structure)
            const structSnap = await getDocs(collection(db, "grade_structure"));
            const structData = [];
            structSnap.forEach(doc => {
                const d = doc.data();
                let columnsStr = "";
                if(d.columns && Array.isArray(d.columns)) {
                    columnsStr = d.columns.map(c => `${c.name}(เต็ม ${c.max})`).join(", ");
                }
                structData.push({
                    "รหัสห้อง (ID)": doc.id,
                    "คอลัมน์คะแนน": columnsStr
                });
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(structData.length ? structData : [{"ไม่มีข้อมูล": "-"}]), "โครงสร้างคะแนน");
// BLANK
            // 8. ประวัติรางวัล (Reward History)
            if (typeof getRewardHistoryCollection === "function") {
                const rewardSnap = await getDocs(getRewardHistoryCollection());
                const rewardData = [];
                rewardSnap.forEach(doc => {
                    const d = doc.data();
                    rewardData.push({
                        "นักเรียน ID": d.studentId || "",
                        "รางวัล": d.rewardName || "",
                        "แต้มที่ใช้": d.pointsUsed || 0,
                        "บันทึกเมื่อ": d.timestamp ? new Date(d.timestamp).toLocaleString("th-TH") : ""
                    });
                });
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rewardData.length ? rewardData : [{"ไม่มีข้อมูล": "-"}]), "ประวัติการแลกรางวัล");
            }
// BLANK
            // Export to File
            const dateStr = new Date().toLocaleDateString('th-TH').replace(/\//g, '-');
            const timeStr = new Date().toLocaleTimeString('th-TH').replace(/:/g, '');
            const fileName = `School_Backup_${dateStr}_${timeStr}.xlsx`;
            
            XLSX.writeFile(wb, fileName);
            window.showToast("✅ ดาวน์โหลดข้อมูลสำรองเรียบร้อยแล้ว!");
// BLANK
        } catch (error) {
            console.error("Backup Error:", error);
            window.showToast("❌ เกิดข้อผิดพลาดในการดึงข้อมูล โปรดลองอีกครั้ง", "error");
        }
      };
// BLANK