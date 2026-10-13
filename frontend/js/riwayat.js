
function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
function updateHistoryStats(data){
    setText("totalHistory",data.length);
    setText("manualHistory",data.filter(x=>x.watering_type==="manual").length);
    setText("scheduleHistory",data.filter(x=>x.watering_type!=="manual").length);
    const box=document.getElementById("activitySummary");
    if(!box)return;
    if(!data.length){box.innerHTML='<div class="empty-state">Belum ada aktivitas penyiraman.</div>';return;}
    box.innerHTML=data.slice(0,
    3).map(item=>{const src=item.watering_type==="manual"?"Manual":"Jadwal";return `<div class="activity-item"><div class="activity-icon">${window.GreenhouseIcons.svg("droplet",22)}</div><div><strong>${src}</strong><small>${new Date(item.started_at).toLocaleString("id-ID", {timeZone: "Asia/Jakarta"})}</small></div><strong>${item.duration_seconds||0} dtk</strong></div>`}).join("");
    const selectionInfo=document.getElementById("selectionInfo"); if(selectionInfo)selectionInfo.textContent="0 dipilih";
}
﻿const historyList = document.getElementById("historyList");
const selectAll = document.getElementById("selectAll");
const deleteSelected = document.getElementById("deleteSelected");
const errorContainer = document.querySelector(".content-container") || document.body;

// =====================================================
// LOAD RIWAYAT
// =====================================================
async function loadHistory() {
    if (!historyList) return;

    try {
        const result = await apiRequest(`${API_URL}/watering/logs`);

        if (!result.success) {
            throw new Error(result.message || "Gagal mengambil data riwayat");
        }

        updateHistoryStats(result.data);

        // Tidak ada data
        if (!result.data || result.data.length === 0) {
            historyList.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color: #777; padding: 20px;">
                        Belum ada riwayat penyiraman.
                    </td>
                </tr>
            `;
            updateDeleteButton();
            return;
        }

        const sortedData = [...result.data].sort(
            (a, b) =>
                new Date(b.started_at) -
                new Date(a.started_at)
        );
        
        historyList.innerHTML = sortedData.map((item) => {
            const waktu = new Date(item.started_at).toLocaleString("id-ID");
            const sumber = item.watering_type === "manual" ? "Manual" : "Jadwal";
            const isCompleted = item.status === "completed";
            const status = isCompleted ? "Selesai" : "Aktif";
            const durasi = item.duration_seconds ? `${item.duration_seconds} detik` : "-";

            return `
                <tr>
                    <td>
                        <input
                            type="checkbox"
                            class="history-checkbox"
                            value="${item.id}"
                        >
                    </td>
                    <td>${waktu}</td>
                    <td>${sumber}</td>
                    <td>
                        <span class="done-badge ${isCompleted ? "" : "active"}">
                            ${status}
                        </span>
                    </td>
                    <td>${durasi}</td>
                </tr>
            `;
        }).join("");

        // Reset checkbox Pilih Semua
        if (selectAll) selectAll.checked = false;
        updateDeleteButton();

    } catch (error) {
        console.error("Gagal mengambil riwayat:", error);
        historyList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; color: #c33; padding: 20px;">
                    Gagal mengambil riwayat: ${error.message}
                </td>
            </tr>
        `;
    }
}

// =====================================================
// UPDATE TOMBOL HAPUS
// =====================================================
function updateDeleteButton() {
    if (!deleteSelected) return;
    const selected = document.querySelectorAll(".history-checkbox:checked");
    deleteSelected.disabled = selected.length === 0;
    setText("selectionInfo", `${selected.length} dipilih`);
}

// =====================================================
// PILIH SEMUA
// =====================================================
if (selectAll) {
    selectAll.addEventListener("change", () => {
        const checkboxes = document.querySelectorAll(".history-checkbox");
        checkboxes.forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
        });
        updateDeleteButton();
    });
}

// =====================================================
// CHECKBOX INDIVIDUAL
// =====================================================
if (historyList) {
    historyList.addEventListener("change", (event) => {
        if (!event.target.classList.contains("history-checkbox")) return;

        const checkboxes = document.querySelectorAll(".history-checkbox");
        const checked = document.querySelectorAll(".history-checkbox:checked");

        if (selectAll) {
            selectAll.checked = checkboxes.length > 0 && checked.length === checkboxes.length;
        }
        updateDeleteButton();
    });
}

// =====================================================
// HAPUS BANYAK
// =====================================================
if (deleteSelected) {
    deleteSelected.addEventListener("click", async () => {
        const selected = Array.from(document.querySelectorAll(".history-checkbox:checked"))
            .map((checkbox) => Number(checkbox.value));

        if (selected.length === 0) return;

        const confirmation = confirm(`Hapus ${selected.length} riwayat yang dipilih?`);
        if (!confirmation) return;

        setLoading(true, deleteSelected);

        try {
            const result = await apiRequest(`${API_URL}/watering/logs`, {
                method: "DELETE",
                body: JSON.stringify({ ids: selected })
            });

            if (!result.success) {
                showError(result.message || "Gagal menghapus riwayat", errorContainer);
                return;
            }

            showSuccess(result.message || "Riwayat berhasil dihapus", errorContainer);
            if (selectAll) selectAll.checked = false;
            loadHistory();

        } catch (error) {
            console.error("Gagal menghapus banyak riwayat:", error);
            showError(`Gagal menghapus riwayat: ${error.message}`, errorContainer);
        } finally {
            setLoading(false, deleteSelected);
        }
    });
}

// Load riwayat awal
loadHistory();

// Refresh otomatis setiap 10 detik
setInterval(loadHistory, 10000);
