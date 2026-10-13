const statusElement=document.getElementById("status");
const descriptionElement=document.getElementById("description");
const errorContainer=document.querySelector(".content-container")||document.body;

function updateDisplay(isOn){
    statusElement.textContent=isOn?"ON":"OFF";
    statusElement.style.color=isOn?"#31774d":"#263239";
    descriptionElement.textContent=isOn?"Katup solenoid terbuka. Air sedang dialirkan ke tanaman.":"Katup solenoid tertutup. Sistem siap digunakan.";
    const relayDot=document.getElementById("relayDot");const solenoidDot=document.getElementById("solenoidDot");
    if(relayDot)relayDot.className=`state-dot ${isOn?"online":""}`;
    if(solenoidDot)solenoidDot.className=`state-dot ${isOn?"online":""}`;
    const relayLabel=document.getElementById("relayDeviceStatus");
    const solenoidLabel=document.getElementById("solenoidDeviceStatus");
    if(relayLabel){relayLabel.textContent=isOn?"ON":"OFF";relayLabel.className=isOn?"status-text connected":"status-text disconnected";}
    if(solenoidLabel){solenoidLabel.textContent=isOn?"Terbuka":"Tertutup";solenoidLabel.className=isOn?"status-text connected":"status-text disconnected";}
    const wateringLabel=document.getElementById("wateringStateLabel");
    if(wateringLabel)wateringLabel.textContent=isOn?"Penyiraman Aktif":"Penyiraman Nonaktif";
}
async function loadStatus(){try{const result=await apiRequest(`${API_URL}/watering/status`);if(result.success)updateDisplay(Boolean(result.data.isOn));}catch(error){console.error(error);}}

function getScheduleMinutes(
    scheduleTime
) {
    const time =
        String(scheduleTime)
            .substring(0, 5)
            .split(":");

    const hour =
        Number(time[0]);

    const minute =
        Number(time[1]);

    return (
        hour * 60 +
        minute
    );
}

async function loadScheduleInfo() {
    try {
        const result =
            await apiRequest(
                `${API_URL}/schedules`
            );

        if (
            !result.success ||
            !result.data ||
            result.data.length === 0
        ) {
            setText(
                "nextWateringTime",
                "--:--"
            );

            setText(
                "nextWateringDuration",
                "-- detik"
            );

            setText(
                "nextWateringInfo",
                "Belum ada jadwal aktif"
            );

            return;
        }


        // =========================================
        // AMBIL JADWAL YANG AKTIF
        // =========================================

        const activeSchedules =
            result.data
                .filter(
                    item => item.is_active
                )
                .map(item => ({
                    ...item,
                    minutes:
                        getScheduleMinutes(
                            item.schedule_time
                        )
                }))
                .sort(
                    (a, b) =>
                        a.minutes - b.minutes
                );


        if (
            activeSchedules.length === 0
        ) {
            setText(
                "nextWateringTime",
                "--:--"
            );

            setText(
                "nextWateringDuration",
                "-- detik"
            );

            setText(
                "nextWateringInfo",
                "Belum ada jadwal aktif"
            );

            return;
        }


        // =========================================
        // WAKTU SEKARANG
        // =========================================

        const now =
            new Date();

        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();


        // =========================================
        // CARI JADWAL SETELAH SEKARANG
        // =========================================

        let nextSchedule =
            activeSchedules.find(
                item =>
                    item.minutes >
                    currentMinutes
            );


        // =========================================
        // KALAU TIDAK ADA
        // AMBIL JADWAL BESOK PALING AWAL
        // =========================================

        let tomorrow = false;

        if (!nextSchedule) {
            nextSchedule =
                activeSchedules[0];

            tomorrow = true;
        }


        // =========================================
        // TAMPILKAN
        // =========================================

        const scheduleTime =
            String(
                nextSchedule.schedule_time
            ).substring(0, 5);


        setText(
            "nextWateringTime",
            scheduleTime
        );


        setText(
            "nextWateringDuration",
            `${nextSchedule.duration_seconds} detik`
        );


        setText(
            "nextWateringInfo",
            tomorrow
                ? "Jadwal berikutnya besok"
                : "Jadwal aktif berikutnya"
        );

    } catch (error) {

        console.error(
            "Schedule error:",
            error
        );

        setText(
            "nextWateringTime",
            "--:--"
        );

        setText(
            "nextWateringDuration",
            "-- detik"
        );

        setText(
            "nextWateringInfo",
            "Gagal mengambil jadwal"
        );
    }
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


async function loadLastActivity() {
    // kode kamu yang sekarang
}

async function loadLastActivity(){try{const result=await apiRequest(`${API_URL}/watering/logs`);if(result.success&&result.data.length){const item=result.data[0];const source=item.watering_type==="manual"?"Penyiraman manual":"Penyiraman jadwal";setText("lastWateringActivity",
`${source} • ${item.status}`);}}catch(error){console.error(error);}}
async function sendCommand(command,button){setLoading(true,
button);try{const result=await apiRequest(`${API_URL}/watering/${command}`,
{method:"POST"});if(result.success){updateDisplay(Boolean(result.data.isOn));showSuccess(`Penyiraman berhasil ${command==="start"?"dimulai":"dihentikan"}`,errorContainer);}else showError(result.message||"Gagal mengirim perintah",errorContainer);}catch(error){showError(`Gagal mengirim perintah: ${error.message}`,errorContainer);}finally{setLoading(false,
button);}}
document.getElementById("startBtn")?.addEventListener("click",function(){sendCommand("start",this);});
document.getElementById("stopBtn")?.addEventListener("click",function(){sendCommand("stop",this);});
loadStatus();loadScheduleInfo();loadLastActivity();setInterval(loadStatus,5000);setInterval(loadScheduleInfo,
10000);setInterval(loadLastActivity,10000);

async function loadConnectionStatus() {
    let connected = false;
    try {
        const result = await apiRequest(`${API_URL}/system/status`);
        connected = Boolean(result.success && result.data && result.data.connected);
    } catch (error) {
        connected = false;
    }
    const element = document.getElementById("deviceConnectionStatus");
    const dot = document.getElementById("deviceConnectionDot");
    const pill = document.getElementById("wateringLive");
    if (element) {
        element.textContent = connected ? "Terhubung" : "Terputus";
        element.className = connected ? "status-text connected" : "status-text disconnected";
    }
    if (dot) dot.className = connected ? "state-dot online" : "state-dot";
    if (pill) {
        pill.textContent = connected ? "● TERHUBUNG" : "● TERPUTUS";
        pill.className = connected ? "live-pill" : "live-pill disconnected";
    }
}
loadConnectionStatus();
setInterval(loadConnectionStatus, 5000);
