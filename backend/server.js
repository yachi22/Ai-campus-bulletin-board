const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bulletinRoutes = require("./routes/bulletinRoutes");
const eventRoutes = require("./routes/eventRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reactionRoutes = require("./routes/reactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes =
    require("./routes/notificationRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const projectMatcherRoutes = require("./routes/projectMatcherRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const documentRoutes = require("./routes/documentRoutes");
const campusIssueRoutes = require("./routes/campusIssueRoutes");

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

app.use('/api/health', healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/bulletins", bulletinRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/reactions", reactionRoutes);

app.use("/api/ai", aiRoutes);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/project-matcher", projectMatcherRoutes);
app.use("/api/projects", projectMatcherRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/campus-issues", campusIssueRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testConnection();
});
