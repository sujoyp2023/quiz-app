// server/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

// PostgreSQL DB setup
const pool = new Pool({
  user: 'postgres',            // ✅ default PostgreSQL user
  host: 'localhost',
  database: 'quizapp1',         // ✅ your created database
  password: '7536',// ❗ use the real password you use in pgAdmin or psql
  port: 5432,
});



// GET endpoint to fetch questions
app.get('/api/questions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM questions LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error('DB Error:', err); // ✅ log actual error
res.status(500).json({ error: 'Database error' });

    }
});

app.listen(3002, () => {
    console.log('Server running on http://localhost:3002');
});
