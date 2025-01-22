import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors'; // Add this import

dotenv.config();

const app = express();
app.use(express.json());

// Add CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://grfbeta.vercel.app', 'https://www.getreadyfast.in'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Database connection
const pool = mysql.createPool({
  host: 'srv1339.hstgr.io',
  user: 'u794390554_grf',
  password: '7fN!+JUqAp2G',
  database: 'u794390554_grf',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all posts
app.get('/posts', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT 
        id,
        thumbnail,
        date_time,
        shirt_src,
        shirt_buy_link,
        pants_src,
        pants_buy_link,
        shoes_src,
        shoes_buy_link,
        jacket_src,
        jacket_buy_link,
        views,
        is_featured
      FROM posts
      WHERE is_published = 1 
      AND is_approved = 1
      ORDER BY date_time ASC
    `);

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
app.get('/posts/:id', async (req, res) => {
  try {
    const [post] = await pool.query(`
      SELECT 
        id,
        thumbnail,
        date_time,
        shirt_src,
        shirt_buy_link,
        pants_src,
        pants_buy_link,
        shoes_src,
        shoes_buy_link,
        jacket_src,
        jacket_buy_link,
        views,
        is_featured
      FROM posts
      WHERE id = ?
      AND is_published = 1 
      AND is_approved = 1
    `, [req.params.id]);

    if (post.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5005;

// Graceful shutdown handler
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await pool.end();
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
