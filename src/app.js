const express = require("express");
const { getAllLogs } = require("./controllers/logController");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/songs", require("./routes/songs"));
app.use("/songs/:songId/reviews", require("./routes/reviews"));
app.use("/songs/:songId/logs",    require("./routes/logs"));
app.get("/logs", getAllLogs);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Music Journal API is running", version: "1.0.0" });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    status: "ERROR",
    message: "Route not found",
    data: null,
    errors: [`Cannot ${req.method} ${req.originalUrl}`],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "ERROR",
    message: "Internal server error",
    data: null,
    errors: [err.message],
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Music Journal API running on port ${PORT}`));
}

module.exports = app;
