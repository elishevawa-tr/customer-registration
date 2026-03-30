const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database(path.join(__dirname, 'data', 'registrations.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    telephone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/registrations', (req, res) => {
  const { name, telephone } = req.body;
  if (!name || !telephone) {
    return res.status(400).json({ error: 'Name and telephone are required' });
  }
  const stmt = db.prepare('INSERT INTO registrations (name, telephone) VALUES (?, ?)');
  const result = stmt.run(name, telephone);
  res.status(201).json({ id: result.lastInsertRowid, name, telephone });
});

app.get('/api/registrations', (_req, res) => {
  const rows = db.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all();
  res.json(rows);
});

app.delete('/api/registrations/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM registrations WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
