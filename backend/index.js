const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Setup
const dbPath = path.resolve(__dirname, 'calories.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Failed to connect to DB:', err.message);
  console.log('Connected to SQLite database ✅');
});

// USDA Autocomplete Proxy
app.post('/api/usdaSearch', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query term' });

  try {
    const usdaRes = await axios.post(
      'https://api.nal.usda.gov/fdc/v1/foods/search',
      { query, pageSize: 5 },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { api_key: process.env.USDA_API_KEY },
      }
    );

    const items = usdaRes.data.foods.map(f => {
      const kcal = f.foodNutrients?.find(n =>
        n.nutrientName === 'Energy' || n.nutrientName === 'Energy (kcal)'
      )?.value;
      return { name: f.description, calories: kcal ? Math.round(kcal) : null };
    });

    res.json(items);
  } catch (err) {
    console.error('USDA proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch USDA data' });
  }
});

// DB Setup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food TEXT NOT NULL,
    calories INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS goal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target INTEGER NOT NULL
  )`);

  db.get(`SELECT COUNT(*) as count FROM goal`, (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO goal (target) VALUES (2000)`);
    }
  });
});

// API Endpoints
app.post('/api/logFood', (req, res) => {
  const { food, calories } = req.body;
  db.run(`INSERT INTO logs (food, calories) VALUES (?, ?)`, [food, calories], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

app.get('/api/today', (req, res) => {
  db.all(`SELECT * FROM logs WHERE DATE(timestamp) = DATE('now', 'localtime')`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/todayStats', (req, res) => {
  db.get(`SELECT SUM(calories) as total FROM logs WHERE DATE(timestamp) = DATE('now', 'localtime')`, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = row.total || 0;
    db.get(`SELECT target FROM goal LIMIT 1`, [], (err2, goalRow) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const target = goalRow.target;
      const percent = Math.min(Math.round((total / target) * 100), 100);
      res.json({ total, target, percent });
    });
  });
});

app.delete('/api/food/:id', (req, res) => {
  db.run(`DELETE FROM logs WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true, id: req.params.id });
  });
});

app.put('/api/goal', (req, res) => {
  const { target } = req.body;
  db.run(`UPDATE goal SET target = ? WHERE id = 1`, [target], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: true, target });
  });
});

// Start Server — just once!
app.listen(PORT, () => {
  console.log(`Backend live on port ${PORT}`);
});
