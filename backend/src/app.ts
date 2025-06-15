import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import postRoutes from './routes/posts' 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/posts', postRoutes)

app.get('/', (req, res) => {
  res.send('API is working!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
