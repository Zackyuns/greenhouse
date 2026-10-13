function getScheduleMinutes(
    scheduleTime
) {

    const time =
        String(
            scheduleTime
        )
            .substring(0, 5)
            .split(":");


    const hour =
        Number(
            time[0]
        );


    const minute =
        Number(
            time[1]
        );


    return (
        hour * 60 +
        minute
    );
}

function updateScheduleStats(data) {

    const active =
        data
            .filter(
                item => item.is_active
            )
            .map(
                item => ({
                    ...item,

                    minutes:
                        getScheduleMinutes(
                            item.schedule_time
                        )
                })
            )
            .sort(
                (a, b) =>
                    a.minutes - b.minutes
            );


    // =========================================
    // JUMLAH JADWAL AKTIF
    // =========================================

    setText(
        "activeScheduleCount",
        active.length
    );


    // =========================================
    // WAKTU SEKARANG
    // =========================================

    const now =
        new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    // =========================================
    // CARI JADWAL BERIKUTNYA
    // =========================================

    let next =
        active.find(
            item =>
                item.minutes >
                currentMinutes
        );


    let tomorrow = false;


    // =========================================
    // KALAU SEMUA JADWAL SUDAH LEWAT
    // AMBIL JADWAL BESOK
    // =========================================

    if (!next && active.length > 0) {
        next = active[0];
        tomorrow = true;
    }


    // =========================================
    // TAMPILKAN JADWAL BERIKUTNYA
    // =========================================

    setText(
        "nextScheduleSummary",
        next
            ? String(
                  next.schedule_time
              ).substring(0, 5)
            : "--:--"
    );


    // =========================================
    // TOTAL DURASI HARIAN
    // =========================================

    const total =
        active.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.duration_seconds ||
                    0
                ),
            0
        );


    setText(
        "totalDuration",
        `${total} dtk`
    );
}

function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
const modal = document.getElementById("scheduleModal");
const scheduleList = document.getElementById("scheduleList");
const errorContainer = document.querySelector(".content-container") || document.body;

const modalTitle = document.getElementById("modalTitle");
const scheduleIdInput = document.getElementById("scheduleId");
const timeInput = document.getElementById("time");
const durationInput = document.getElementById("duration");
const statusGroup = document.getElementById("statusGroup");
const isActiveSelect = document.getElementById("isActive");
const submitBtn = document.getElementById("submitBtn");

// Event listeners to open/close modal
document.getElementById("addScheduleBtn")?.addEventListener("click", () => {
    // Reset Form for creation
    if (scheduleIdInput) scheduleIdInput.value = "";
    if (timeInput) timeInput.value = "";
    if (durationInput) durationInput.value = "60";
    if (statusGroup) statusGroup.style.display = "none";
    if (modalTitle) modalTitle.textContent = "Tambah Jadwal";
    if (submitBtn) submitBtn.textContent = "Simpan Jadwal";

    modal?.classList.add("show");
});

document.getElementById("closeModal")?.addEventListener("click", () => {
    modal?.classList.remove("show");
});

modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("show");
    }
});

async function loadSchedules() {
    if (!scheduleList) return;

    try {
        const result = await apiRequest(`${API_URL}/schedules`);

        if (!result.success) {
            scheduleList.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #c33; padding: 20px;">Gagal memuat jadwal</td>
                </tr>
            `;
            return;
        }

        if (result.data.length === 0) {
            scheduleList.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #777; padding: 20px;">Belum ada jadwal.</td>
                </tr>
            `;
            return;
        }

        // Store in global schedules list for caching
        window.schedulesCache = result.data;
        updateScheduleStats(result.data);

        scheduleList.innerHTML = result.data.map((item, index) => {
            // Format waktu: hilangkan detik (dari HH:MM:SS menjadi HH:MM)
            const timeFormatted = item.schedule_time.substring(0, 5);

            return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${timeFormatted}</strong></td>
                <td>${item.duration_seconds} detik</td>
                <td>
                    <span class="done-badge ${item.is_active ? "" : "off"}">
                        ${item.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button
                            class="btn btn-warning"
                            onclick="openEditSchedule(${item.id})"
                            data-id-edit="${item.id}">
                            Edit
                        </button>
                        <button
                            class="btn btn-danger"
                            onclick="deleteSchedule(${item.id})"
                            data-id="${item.id}">
                            Hapus
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    } catch (error) {
        console.error("Load schedules error:", error);
        scheduleList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #c33; padding: 20px;">Gagal memuat jadwal: ${error.message}</td>
            </tr>
        `;
        showError(`Gagal memuat jadwal: ${error.message}`, errorContainer);
    }
}

// Function to populate and open Edit Modal
window.openEditSchedule = function(id) {
    if (!window.schedulesCache) return;
    const schedule = window.schedulesCache.find(item => item.id === id);
    if (!schedule) return;

    const timeFormatted = schedule.schedule_time.substring(0, 5);

    if (scheduleIdInput) scheduleIdInput.value = schedule.id;
    if (timeInput) timeInput.value = timeFormatted;
    if (durationInput) durationInput.value = schedule.duration_seconds;
    if (statusGroup) statusGroup.style.display = "block";
    if (isActiveSelect) isActiveSelect.value = schedule.is_active ? "true" : "false";
    if (modalTitle) modalTitle.textContent = "Edit Jadwal";
    if (submitBtn) submitBtn.textContent = "Perbarui Jadwal";

    modal?.classList.add("show");
};

document.getElementById("scheduleForm")?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const submitBtnEl = event.target.querySelector("button[type='submit']") || submitBtn;
        const time = timeInput.value;
        const duration = durationInput.value;
        const id = scheduleIdInput ? scheduleIdInput.value : "";
        const isActive = isActiveSelect ? (isActiveSelect.value === "true") : true;

        if (!time || !duration) {
            showError("Waktu dan durasi harus diisi", errorContainer);
            return;
        }

        setLoading(true, submitBtnEl);

        try {
            let result;
            if (id) {
                // Update existing schedule
                result = await apiRequest(
                    `${API_URL}/schedules/${id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            schedule_time: time,
                            duration_seconds: Number(duration),
                            is_active: isActive
                        })
                    }
                );
            } else {
                // Create new schedule
                result = await apiRequest(
                    `${API_URL}/schedules`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            schedule_time: time,
                            duration_seconds: Number(duration)
                        })
                    }
                );
            }

            if (!result.success) {
                showError(result.message || "Gagal menyimpan jadwal", errorContainer);
                return;
            }

            showSuccess(id ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan", errorContainer);
            modal?.classList.remove("show");
            event.target.reset();
            loadSchedules();

        } catch (error) {
            console.error("Save schedule error:", error);
            showError(`Gagal menyimpan jadwal: ${error.message}`, errorContainer);
        } finally {
            setLoading(false, submitBtnEl);
        }
    }
);

async function deleteSchedule(id) {
    if (!confirm("Hapus jadwal ini?")) return;

    const button = document.querySelector(`button[data-id="${id}"]`);
    setLoading(true, button);

    try {
        const result = await apiRequest(`${API_URL}/schedules/${id}`, {
            method: "DELETE"
        });

        if (result.success) {
            showSuccess("Jadwal berhasil dihapus", errorContainer);
            loadSchedules();
        } else {
            showError(result.message || "Gagal menghapus jadwal", errorContainer);
        }
    } catch (error) {
        console.error("Delete schedule error:", error);
        showError(`Gagal menghapus jadwal: ${error.message}`, errorContainer);
    } finally {
        setLoading(false, button);
    }
}

// Expose deleteSchedule globally
window.deleteSchedule = deleteSchedule;

loadSchedules();