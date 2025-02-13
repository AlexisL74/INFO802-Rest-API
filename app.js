import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './router/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // To parse JSON request bodies

dotenv.config();

app.use('/api', router);

app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname, '/public/pages/index.html'));
});

app.get('/testMap', (_, res) => {
    res.sendFile(path.join(__dirname, '/public/pages/test.html'));
});

app.get('/testLeaf', (_, res) => {
    res.sendFile(path.join(__dirname, '/public/pages/testLeafletjs.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});