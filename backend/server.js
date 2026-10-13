// Entry point untuk menjalankan backend secara lokal dengan Node.js.
require("dotenv").config();
process.env.TZ = process.env.TZ || "Asia/Jakarta";

const app = require("./app");
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan pada port ${PORT}`);
});
