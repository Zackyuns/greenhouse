// Lokal: backend Express berjalan di port 3000.
// Deployment: setelah backend berhasil dideploy, ganti URL di bawah dengan URL project backend Vercel.
const LOCAL_API_URL = "http://localhost:3000/api";
const DEPLOYED_BACKEND_URL = "https://greenhousebackend.vercel.app";
const IS_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:";
const API_URL = IS_LOCAL
    ? LOCAL_API_URL
    : `${DEPLOYED_BACKEND_URL.replace(/\/+$/, "")}/api`;

// Utility function untuk API calls dengan retry logic dan error handling
async function apiRequest(url, options = {}, retries = 3) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                success: false,
                message: `HTTP ${response.status}: ${response.statusText}`
            }));
            throw new Error(errorData.message || "Request gagal");
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeout);

        // Retry logic untuk network errors
        if (retries > 0 && (error.name === "AbortError" || error.message.includes("Failed to fetch"))) {
            console.warn(`Retry ${4 - retries}/3 untuk ${url}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tunggu 1 detik sebelum retry
            return apiRequest(url, options, retries - 1);
        }

        throw error;
    }
}

// Helper untuk menampilkan error message
function showError(message, container = null) {
    const errorHtml = `
        <div class="error-message" style="background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 4px; margin: 10px 0;">
            <strong>Error:</strong> ${message}
        </div>
    `;

    if (container) {
        const errorDiv = document.createElement("div");
        errorDiv.innerHTML = errorHtml;
        container.insertBefore(errorDiv.firstElementChild, container.firstChild);

        // Auto-remove setelah 5 detik
        setTimeout(() => {
            const errorEl = container.querySelector(".error-message");
            if (errorEl) errorEl.remove();
        }, 5000);
    } else {
        console.error(message);
    }
}

// Helper untuk menampilkan success message
function showSuccess(message, container = null) {
    const successHtml = `
        <div class="success-message" style="background: #efe; border: 1px solid #cfc; color: #3c3; padding: 12px; border-radius: 4px; margin: 10px 0;">
            <strong>Sukses:</strong> ${message}
        </div>
    `;

    if (container) {
        const successDiv = document.createElement("div");
        successDiv.innerHTML = successHtml;
        container.insertBefore(successDiv.firstElementChild, container.firstChild);

        // Auto-remove setelah 3 detik
        setTimeout(() => {
            const successEl = container.querySelector(".success-message");
            if (successEl) successEl.remove();
        }, 3000);
    } else {
        console.log(message);
    }
}

// Helper untuk show/hide loading indicator
function setLoading(isLoading, button = null) {
    if (button) {
        button.disabled = isLoading;
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = "Loading...";
        } else if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
    }
}
