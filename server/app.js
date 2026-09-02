// Load variables from server/.env before any code reads process.env.
// Keep JWT_SECRET on the server. Browser JavaScript must never receive it.
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';

// ES modules do not provide __dirname automatically. These lines rebuild it
// so Express can find the public folder regardless of where Node is started.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// These values come from server/.env locally or Render environment variables
// in production. PORT has a fallback so local development uses port 3000.
const { DEMO_PASSWORD, DEMO_USERNAME, JWT_SECRET, PORT = 3000 } = process.env;

// Fail early with a useful message instead of making insecure tokens or
// silently accepting undefined credentials.
if (!DEMO_USERNAME || !DEMO_PASSWORD || !JWT_SECRET) {
  throw new Error('Set DEMO_USERNAME, DEMO_PASSWORD, and JWT_SECRET in server/.env.');
}

// Read JSON sent by fetch and form fields sent by a normal HTML form.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, '../public')));

const projects = [
  { title: 'Server Time', lesson: 'GET a value from Express' },
  { title: 'Message', lesson: 'POST form data to Express' },
  { title: 'JWT Login', lesson: 'Protect a server route' },
];

// Protected-route middleware reads the token sent in this request header:
// Authorization: Bearer <token>
// jwt.verify checks the signature and expiry using the server-only secret.
function requireJwt(req, res, next) {
  const authorization = String(req.get('authorization') || '');
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    res.status(401).json({ error: 'A bearer token is required.' });
    return;
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'The token is invalid or expired.' });
  }
}

// 1. Server sends a value to the browser.
app.get('/api/time', (req, res) => {
  res.json({ time: new Date().toLocaleTimeString() });
});

// 2a. A GET form puts values in the URL. Express reads them from req.query.
app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'friend';
  res.json({ message: `Hello, ${name}.`, receivedFrom: 'req.query.name' });
});

// 2b. A POST form puts values in the request body. express.urlencoded()
// makes the form field available as req.body.message.
app.post('/api/messages', (req, res) => {
  const message = String(req.body.message || '').trim();
  res.json({ message: message || 'No message sent.', receivedFrom: 'req.body.message' });
});

// 3. Login checks server-side .env values and sends a short-lived JWT.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ token });
});

// 4. This route runs only after requireJwt verifies the bearer token.
app.get('/api/protected', requireJwt, (req, res) => {
  res.json({ message: `Protected route reached by ${req.user.username}.` });
});

// 5. Today this is hardcoded data. Later, replace this response with MongoDB.
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// Explicitly serve the app home page at the root URL.
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public', 'home.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});