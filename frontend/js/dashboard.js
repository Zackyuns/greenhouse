function formatDate(value) {
    return value
        ? new Date(value).toLocaleString("id-ID")
        : "-";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateSensorStatus(temperature, humidity, light) {
    const temperatureStatus =
        document.getElementById("temperatureStatus");

    const humidityStatus =
        document.getElementById("humidityStatus");

    const lightStatus =
        document.getElementById("lightStatus");


    // =========================================
    // STATUS SUHU
    // =========================================

    if (temperatureStatus) {
        if (temperature < 20) {
            temperatureStatus.textContent = "Dingin";
        } else if (temperature <= 30) {
            temperatureStatus.textContent = "Normal";
        } else {
            temperatureStatus.textContent = "Panas";
        }
    }


    // =========================================
    // STATUS KELEMBAPAN
    // =========================================

    if (humidityStatus) {
        if (humidity < 40) {
            humidityStatus.textContent = "Kering";
        } else if (humidity <= 80) {
            humidityStatus.textContent = "Normal";
        } else {
            humidityStatus.textContent = "Lembap";
        }
    }


    // =========================================
    // STATUS CAHAYA
    // =========================================

    if (lightStatus) {
        if (light < 200) {
            lightStatus.textContent = "Gelap";
        } else if (light <= 1000) {
            lightStatus.textContent = "Cukup";
        } else {
            lightStatus.textContent = "Terang";
        }
    }
}

async function loadSensorData(container = null) {
    try {
        const result =
            await apiRequest(
                `${API_URL}/sensors/latest`
            );

        if (!result.success || !result.data) {
            setText("temperature", "--");
            setText("humidity", "--");
            setText("light", "--");

            return;
        }

        const data = result.data;

        const temperature =
            Number(data.temperature);

        const humidity =
            Number(data.humidity);

        const light =
            Number(data.light_intensity);


        // =========================================
        // NILAI SENSOR
        // =========================================

        setText(
            "temperature",
            `${temperature.toFixed(1)} °C`
        );

        setText(
            "humidity",
            `${humidity.toFixed(1)} %`
        );

        setText(
            "light",
            `${light.toFixed(2)} lux`
        );


        // =========================================
        // DETAIL SENSOR
        // =========================================

        setText(
            "detailTemperature",
            `${temperature.toFixed(1)} °C`
        );

        setText(
            "detailHumidity",
            `${humidity.toFixed(1)} %`
        );

        setText(
            "detailLight",
            `${light.toFixed(2)} lux`
        );


        // =========================================
        // UPDATE STATUS
        // =========================================

        updateSensorStatus(
            temperature,
            humidity,
            light
        );


        // =========================================
        // WAKTU UPDATE
        // =========================================

        setText(
            "updatedTime",
            formatDate(data.created_at)
        );

    } catch (error) {
        console.error(
            "Sensor:",
            error
        );

        showError(
            `Gagal memuat data sensor terbaru: ${error.message}`,
            container
        );
    }
}

async function loadWateringStatus(container = null) {
    try {
        const result = await apiRequest(`${API_URL}/watering/status`);

        if (!result.success) return;

        const isOn = Boolean(result.data.isOn);

        setText("wateringStatus", isOn ? "ON" : "OFF");

        const badge = document.getElementById("wateringBadge");

        if (badge) {
            badge.textContent = isOn ? "Aktif" : "Nonaktif";
            badge.className =
                `metric-badge${isOn ? "" : " off"}`;
        }
    } catch (error) {
        console.error("Watering status error:", error);
        showError(`Gagal mengambil status penyiraman: ${error.message}`, container);
    }
}

async function loadNextSchedule(container = null) {
    try {
        const result = await apiRequest(`${API_URL}/schedules/next`);

        if (!result.success) return;

        if (result.data) {
            setText("modeValue", "Manual / Jadwal");
        } else {
            setText("modeValue", "Kontrol Manual Only");
        }
    } catch (error) {
        console.error("Schedule error:", error);
        showError(`Gagal memeriksa status jadwal: ${error.message}`, container);
    }
}

async function loadHistory(container = null) {
    const table = document.getElementById("historyTableBody");

    if (!table) return;

    try {
        const result = await apiRequest(`${API_URL}/watering/logs`);

        if (!result.success || result.data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #777; padding: 20px;">Belum ada riwayat penyiraman</td>
                </tr>
            `;
            return;
        }

        table.innerHTML = result.data.slice(0, 5).map((item) => `
            <tr>
                <td>${formatDate(item.started_at)}</td>
                <td>${item.duration_seconds || 0} detik</td>
                <td>${item.watering_type === "manual" ? "Manual" : "Jadwal"}</td>
                <td>
                    <span class="done-badge ${item.status === "completed" ? "" : "active"}">
                        ${item.status === "completed" ? "Selesai" : "Aktif"}
                    </span>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        console.error("History error:", error);
        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #c33; padding: 20px;">Gagal memuat riwayat: ${error.message}</td>
            </tr>
        `;
    }
}

function createChart() {
    const canvas = document.getElementById("environmentChart");

    if (!canvas || !window.Chart) return;

    return new Chart(canvas, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Suhu",
                    data: [],
                    borderColor: "#428b68",
                    backgroundColor: "#428b68",
                    tension: 0.25,
                    borderWidth: 2
                },
                {
                    label: "Kelembapan",
                    data: [],
                    borderColor: "#4289c1",
                    backgroundColor: "#4289c1",
                    tension: 0.25,
                    borderWidth: 2
                },
                {
                    label: "Cahaya",
                    data: [],
                    borderColor: "#f59d00",
                    backgroundColor: "#f59d00",
                    tension: 0.25,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function loadChartData(chart, container = null) {
    if (!chart) return;

    try {
        const result = await apiRequest(`${API_URL}/sensors/history?limit=24`);

        if (!result.success) return;

        const data = [...result.data].reverse();

        chart.data.labels = data.map((item) =>
            new Date(item.created_at).toLocaleTimeString(
                "id-ID",
                {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
        );

        chart.data.datasets[0].data =
            data.map((item) => Number(item.temperature));

        chart.data.datasets[1].data =
            data.map((item) => Number(item.humidity));

        chart.data.datasets[2].data =
            data.map((item) => Number(item.light_intensity));

        chart.update();
    } catch (error) {
        console.error("Chart error:", error);
    }
}

async function loadDashboard(chart) {
    const errorContainer = document.querySelector(".content-container") || document.body;

    // Gunakan Promise.allSettled agar satu fetch gagal tidak membatalkan yang lain
    await Promise.allSettled([
        loadSensorData(errorContainer),
        loadWateringStatus(errorContainer),
        loadNextSchedule(errorContainer),
        loadHistory(errorContainer),
        loadChartData(chart, errorContainer)
    ]);
}

const dashboardChart = createChart();

if (dashboardChart) {
    loadDashboard(dashboardChart);
    setInterval(() => {
        loadDashboard(dashboardChart);
    }, 10000);
} else {
    // Jalankan tanpa chart jika chart tidak didukung / error
    const runWithoutChart = () => {
        const errorContainer = document.querySelector(".content-container") || document.body;
        Promise.allSettled([
            loadSensorData(errorContainer),
            loadWateringStatus(errorContainer),
            loadNextSchedule(errorContainer),
            loadHistory(errorContainer)
        ]);
    };
    runWithoutChart();
    setInterval(runWithoutChart, 10000);
}

function updateClock() {
    const clock = document.getElementById("clock");

    if (clock) {
        clock.textContent =
            new Date().toLocaleTimeString("id-ID");
    }
}

setInterval(updateClock, 1000);
updateClock();


async function loadWeather(){
    const lat = -7.5755;
    const lon = 110.8243;
    try{
        const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
        const response=await fetch(url);
        if(!response.ok)throw new Error("Cuaca tidak tersedia");
        const data=await response.json();
        const map={0:["Cerah","sun"],1:["Cerah berawan","cloud-sun"],2:["Berawan sebagian","cloud-sun"],3:["Berawan","cloud"],
        45:["Berkabut","cloud-fog"],48:["Kabut tebal","cloud-fog"],51:["Gerimis ringan","cloud-drizzle"],53:["Gerimis","cloud-drizzle"],
        55:["Gerimis lebat","cloud-rain"],61:["Hujan ringan","cloud-drizzle"],63:["Hujan","cloud-rain"],65:["Hujan lebat","cloud-rain"],
        80:["Hujan","cloud-drizzle"],81:["Hujan","cloud-rain"],82:["Hujan sangat lebat","cloud-lightning"],95:["Badai petir","cloud-lightning"]};
        const info=map[data.current.weather_code]||["Tidak diketahui","cloud-sun"];
        window.GreenhouseIcons?.setWeatherIcon("weatherIcon", data.current.weather_code);setText("weatherCondition",info[0]);setText("weatherTemperature",
        `${data.current.temperature_2m}°C`);
    }catch(error){setText("weatherCondition","Tidak tersedia");setText("weatherTemperature","--°C");}
}
loadWeather();setInterval(loadWeather,600000);

async function loadConnectionStatus() {
    try {

        const result =
            await apiRequest(
                `${API_URL}/system/status`
            );

        if (!result.success || !result.data) {
            throw new Error("Status koneksi tidak tersedia");
        }

        const connected =
            result.data.connected;


        // =========================================
        // STATUS KONEKSI
        // =========================================

        const statusText =
            connected
                ? "Terhubung"
                : "Terputus";

        // Pill koneksi di header Dashboard, konsisten dengan Monitoring/Penyiraman
        const dashboardPill = document.getElementById("dashboardConnectionPill");
        if (dashboardPill) {
            dashboardPill.textContent = connected ? "● TERHUBUNG" : "● TERPUTUS";
            dashboardPill.className = connected ? "live-pill" : "live-pill disconnected";
        }


        const statusElement =
            document.getElementById(
                "connectionStatus"
            );

        if (statusElement) {

            statusElement.textContent =
                statusText;

            statusElement.className =
                connected
                    ? "value connected"
                    : "value disconnected";
        }


        // =========================================
        // DOT
        // =========================================

        const dot =
            document.getElementById(
                "connectionDot"
            );

        if (dot) {

            dot.className =
                connected
                    ? "state-dot online"
                    : "state-dot";
        }

    } catch (error) {
        const dashboardPill = document.getElementById("dashboardConnectionPill");
        if (dashboardPill) {
            dashboardPill.textContent = "● TERPUTUS";
            dashboardPill.className = "live-pill disconnected";
        }
        const statusElement = document.getElementById("connectionStatus");
        if (statusElement) {
            statusElement.textContent = "Terputus";
            statusElement.className = "value disconnected";
        }
        const dot = document.getElementById("connectionDot");
        if (dot) dot.className = "state-dot";
        console.error("Connection status:", error);
    }
}

loadConnectionStatus();

setInterval(
    loadConnectionStatus,
    5000
);