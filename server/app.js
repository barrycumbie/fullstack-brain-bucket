import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(express.static(join(__dirname, '../public')));

// app.get('/', (req, res) => {
//   res.send('Hello World')
// })

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
})

app.get('/whatever', (req, res) => {
  res.send('Hello World whatever')
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})