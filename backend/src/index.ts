import express from 'express';
import cors from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import symptomRoutes from './routes/symptomRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import wellnessRoutes from './routes/wellnessRoutes';

dotenv.config();

const app = express();

app.use(express.json());
// We are using cors correctly this way
app.use(require('cors')());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/wellness', wellnessRoutes);

app.get('/', (req, res) => {
  res.send('Health Companion API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
