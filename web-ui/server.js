import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');

app.use(express.static(DIST_DIR));

app.listen(PORT, () => console.log(`web-ui listening on ${PORT}`));
