// Wandernest - Travel Accommodation Platform
// Express server with hotel listings + admin CRUD

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234%%%%%6';
const DATA_FILE = path.join(__dirname, 'data', 'hotels.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- helpers -----------------------------------------------------------------
function loadHotels() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function saveHotels(hotels) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(hotels, null, 2));
}

function requireAuth(req, res, next) {
  if (req.cookies && req.cookies.admin_auth === 'ok') return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// --- public API --------------------------------------------------------------
app.get('/api/hotels', (req, res) => {
  res.json(loadHotels());
});

app.get('/api/hotels/:id', (req, res) => {
  const hotel = loadHotels().find(h => String(h.id) === String(req.params.id));
  if (!hotel) return res.status(404).json({ error: 'Not found' });
  res.json(hotel);
});

// --- admin auth --------------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    res.cookie('admin_auth', 'ok', { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 });
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Invalid password' });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('admin_auth');
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: req.cookies && req.cookies.admin_auth === 'ok' });
});

// --- admin CRUD --------------------------------------------------------------
app.post('/api/hotels', requireAuth, (req, res) => {
  const hotels = loadHotels();
  const newHotel = {
    id: Date.now(),
    name: req.body.name || 'Untitled',
    city: req.body.city || '',
    price: Number(req.body.price) || 0,
    description: req.body.description || '',
    image: req.body.image || '',
    rating: Number(req.body.rating) || 4.5,
  };
  hotels.push(newHotel);
  saveHotels(hotels);
  res.json(newHotel);
});

app.put('/api/hotels/:id', requireAuth, (req, res) => {
  const hotels = loadHotels();
  const idx = hotels.findIndex(h => String(h.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  hotels[idx] = { ...hotels[idx], ...req.body, id: hotels[idx].id };
  saveHotels(hotels);
  res.json(hotels[idx]);
});

app.delete('/api/hotels/:id', requireAuth, (req, res) => {
  let hotels = loadHotels();
  const before = hotels.length;
  hotels = hotels.filter(h => String(h.id) !== String(req.params.id));
  if (hotels.length === before) return res.status(404).json({ error: 'Not found' });
  saveHotels(hotels);
  res.json({ ok: true });
});

// --- routes ------------------------------------------------------------------
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Wandernest running on port ${PORT}`);
});
