import pkg from 'pg';  // Import module pg dưới dạng mặc định
const { Client } = pkg;  // Trích xuất Client từ module pg

import express from 'express';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';  // Đảm bảo dùng đúng cú pháp
import { static as serveStatic } from 'express';

const app = express();
const PORT = 3000;

// Đường dẫn thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware serving static files
app.use(serveStatic(join(__dirname, '../public')));

// Sử dụng CORS để cho phép các yêu cầu từ nguồn khác
app.use(cors());

// Kết nối đến PostgreSQL
const client = new Client({
  user: 'dashboard',
  host: '34.80.252.31',
  database: 'combined',
  password: 'btcanalysishust',
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1); // Dừng ứng dụng nếu không kết nối được database
  });

// API lấy dữ liệu từ PostgreSQL
app.get('/api/data', async (req, res) => {
  const { crypto } = req.query;  // Lấy giá trị crypto từ query string, ví dụ: /api/data?crypto=BTC

  // Nếu không có tham số crypto, trả về lỗi 400
  if (!crypto) {
    return res.status(400).send('Crypto parameter is required');
  }

  try {
    const result = await client.query(`
      SELECT base, date, open, close, high, low, volume 
      FROM bigdata.price 
      WHERE BASE = $1  -- Sử dụng tham số để tránh SQL injection
      ORDER BY date ASC
    `, [crypto]);  // Truyền tham số crypto vào câu query

    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Error retrieving data');
  }
});

app.get('/api/price', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      'SELECT * FROM bigdata.price_24h WHERE base = $1 ORDER BY updated_at DESC LIMIT 1',
      [crypto] // Dùng parameterized query để tránh SQL injection
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});


// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Đảm bảo đóng kết nối khi server dừng lại
process.on('SIGINT', () => {
  client.end()
    .then(() => {
      console.log('Disconnected from PostgreSQL');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error disconnecting from PostgreSQL', err);
      process.exit(1);
    });
});
