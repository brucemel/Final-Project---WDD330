require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Daily Inspiration Board' });
});

app.get('/favorites', (req, res) => {
  res.render('favorites', { title: 'My Favorites - Daily Inspiration Board' });
});

app.get('/api/quote', async (req, res) => {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    if (!response.ok) throw new Error(`ZenQuotes API error: ${response.status}`);
    const data = await response.json();
    const raw = data[0];
    res.json({
      _id: `zq_${Date.now()}`,
      content: raw.q,
      author: raw.a,
      tags: [req.query.tag || 'inspirational']
    });
  } catch (error) {
    console.error('Quote fetch error:', error.message);
    res.json({
      _id: 'fallback-1',
      content: 'The secret of getting ahead is getting started.',
      author: 'Mark Twain',
      tags: ['motivational']
    });
  }
});

app.get('/api/quote/search', async (req, res) => {
  try {
    const { query = '' } = req.query;
    if (!query.trim()) return res.status(400).json({ error: 'Query required' });
    const response = await fetch('https://zenquotes.io/api/quotes');
    if (!response.ok) throw new Error(`Search error: ${response.status}`);
    const data = await response.json();
    const matches = data.filter(q =>
      q.q.toLowerCase().includes(query.toLowerCase()) ||
      q.a.toLowerCase().includes(query.toLowerCase())
    );
    const results = (matches.length > 0 ? matches : data).slice(0, 3).map(raw => ({
      _id: `zq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      content: raw.q,
      author: raw.a,
      tags: ['inspirational']
    }));
    res.json({ results });
  } catch (error) {
    console.error('Quote search error:', error.message);
    res.status(500).json({ error: 'Failed to search quotes' });
  }
});

app.get('/api/photo', async (req, res) => {
  try {
    const keywords = [
      'motivation', 'nature sunrise', 'mountains peaceful',
      'success achievement', 'peaceful landscape',
      'inspiration light', 'ocean calm', 'forest path'
    ];
    const query = req.query.query ||
      keywords[Math.floor(Math.random() * keywords.length)];
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
    });
    if (!response.ok) throw new Error(`Unsplash error: ${response.status}`);
    const photo = await response.json();
    res.json({
      id:              photo.id,
      url:             photo.urls?.regular,
      thumb:           photo.urls?.small,
      alt:             photo.alt_description || 'Inspirational background',
      photographer:    photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || '#',
      color:           photo.color || '#2C3E50'
    });
  } catch (error) {
    console.error('Photo fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

app.use((req, res) => {
  res.status(404).render('index', { title: 'Daily Inspiration Board' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});