let monitoringChart;

function formatDatabaseDate(value){
    if(!value) return "-";
    const d=new Date(value);
    if(Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID",{timeZone:"Asia/Jakarta",day:"2-digit",month:"2-digit",year:"numeric",
    hour:"2-digit",minute:"2-digit",second:"2-digit"});
}

function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}

function createMonitoringChart() {
    const canvas = document.getElementById("monitoringChart");

    if (!canvas || !window.Chart) {
        return null;
    }

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

async function loadMonitoring(){
    try{
        const result=await apiRequest(`${API_URL}/sensors/latest`);
        if(!result.success||!result.data)return;
        const data=result.data;
        const temperature=Number(data.temperature);
        const humidity=Number(data.humidity);
        const light=Number(data.light_intensity);
        setText("temperature",`${temperature.toFixed(1)} °C`);
        setText("humidity",`${humidity.toFixed(1)} %`);
        setText("light",`${light.toFixed(2)} lux`);
        setText("monitorUpdated",formatDatabaseDate(data.created_at));
        // Koneksi ESP32 ditentukan dari /system/status, bukan sekadar adanya data lama.
    }catch(error){
        console.error("Monitoring:",error);
        setText("temperature","-- °C");
        setText("humidity","-- %");
        setText("light","-- lux");
    }
}

async function loadMonitoringHistory(){
    try{
        const result=await apiRequest(`${API_URL}/sensors/history?limit=24`);
        if(!result.success)return;
        const chartData = [...result.data].reverse();
        const tableData = [...result.data];
        const table = document.getElementById("monitorHistory");

        if (table) {
            table.innerHTML = tableData.length
                ? tableData.map(item => `
                    <tr>
                        <td>${formatDatabaseDate(item.created_at)}</td>
                        <td>${Number(item.temperature).toFixed(1)} °C</td>
                        <td>${Number(item.humidity).toFixed(1)} %</td>
                        <td>${Number(item.light_intensity).toFixed(2)} lux</td>
                    </tr>
                `).join("")
                : '<tr><td colspan="4">Belum ada data.</td></tr>';
        }

        if (monitoringChart) {
            monitoringChart.data.labels = chartData.map(item =>
                new Date(item.created_at).toLocaleTimeString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit"
                })
            );

            monitoringChart.data.datasets[0].data =
                chartData.map(item => Number(item.temperature));

            monitoringChart.data.datasets[1].data =
                chartData.map(item => Number(item.humidity));

            monitoringChart.data.datasets[2].data =
                chartData.map(item => Number(item.light_intensity));

            monitoringChart.update();
        }
    }catch(error){console.error("Monitoring history:",error);}
}



// Cuaca luar greenhouse dari Open-Meteo (sama seperti Dashboard)
async function loadWeather() {
    const lat = -7.5755;
    const lon = 110.8243;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Cuaca tidak tersedia");
        }

        const data = await response.json();
        const weatherMap = {
            0: ["Cerah", "sun"],
            1: ["Cerah berawan", "cloud-sun"],
            2: ["Berawan sebagian", "cloud-sun"],
            3: ["Berawan", "cloud"],
            45: ["Berkabut", "cloud-fog"],
            48: ["Kabut tebal", "cloud-fog"],
            51: ["Gerimis ringan", "cloud-drizzle"],
            53: ["Gerimis", "cloud-drizzle"],
            55: ["Gerimis lebat", "cloud-rain"],
            61: ["Hujan ringan", "cloud-drizzle"],
            63: ["Hujan", "cloud-rain"],
            65: ["Hujan lebat", "cloud-rain"],
            80: ["Hujan", "cloud-drizzle"],
            81: ["Hujan", "cloud-rain"],
            82: ["Hujan sangat lebat", "cloud-lightning"],
            95: ["Badai petir", "cloud-lightning"]
        };

        const info = weatherMap[data.current.weather_code] || ["Tidak diketahui", "cloud-sun"];
        window.GreenhouseIcons?.setWeatherIcon("weatherIcon", data.current.weather_code);
        setText("weatherCondition", info[0]);
        setText("weatherTemperature", `${data.current.temperature_2m}°C`);
    } catch (error) {
        console.error("Cuaca:", error);
        setText("weatherCondition", "Tidak tersedia");
        setText("weatherTemperature", "--°C");
    }
}

async function loadMonitoringWateringStatus() {
    try {
        const result = await apiRequest(`${API_URL}/watering/status`);

        if (!result.success || !result.data) {
            return;
        }

        const isOn = Boolean(result.data.isOn);
        setText("wateringStatus", isOn ? "ON" : "OFF");

        const badge = document.getElementById("wateringBadge");
        if (badge) {
            badge.textContent = isOn ? "Aktif" : "Nonaktif";
            badge.className = `metric-badge${isOn ? "" : " off"}`;
        }
    } catch (error) {
        console.error("Watering status:", error);
        setText("wateringStatus", "--");
        setText("wateringBadge", "Tidak diketahui");
    }
}

monitoringChart=createMonitoringChart();
loadMonitoring();
loadMonitoringHistory();
loadWeather();
loadMonitoringWateringStatus();
setInterval(loadMonitoring,5000);
setInterval(loadMonitoringHistory,10000);
setInterval(loadWeather,600000);
setInterval(loadMonitoringWateringStatus,5000);

async function loadConnectionStatus() {
    let connected = false;
    try {
        const result = await apiRequest(`${API_URL}/system/status`);
        connected = Boolean(result.success && result.data && result.data.connected);
    } catch (error) {
        connected = false;
    }
    const element = document.getElementById("monitorConnection");
    if (element) {
        element.textContent = connected ? "Terhubung" : "Terputus";
        element.className = connected ? "status-text connected" : "status-text disconnected";
    }
    const pill = document.getElementById("monitorConnectionPill");
    if (pill) {
        pill.textContent = connected ? "● TERHUBUNG" : "● TERPUTUS";
        pill.className = connected ? "live-pill" : "live-pill disconnected";
    }
}
loadConnectionStatus();
setInterval(loadConnectionStatus, 5000);
