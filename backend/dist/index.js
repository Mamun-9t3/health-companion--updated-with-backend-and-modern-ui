"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const symptomRoutes_1 = __importDefault(require("./routes/symptomRoutes"));
const hospitalRoutes_1 = __importDefault(require("./routes/hospitalRoutes"));
const wellnessRoutes_1 = __importDefault(require("./routes/wellnessRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// We are using cors correctly this way
app.use(require('cors')());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/symptoms', symptomRoutes_1.default);
app.use('/api/hospitals', hospitalRoutes_1.default);
app.use('/api/wellness', wellnessRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Health Companion API is running...');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
