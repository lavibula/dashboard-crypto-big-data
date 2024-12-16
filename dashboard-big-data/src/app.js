import pkg from 'pg';  // Import module pg dưới dạng mặc định
const { Client } = pkg;  // Trích xuất Client từ module pg

import express from 'express';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';  // Đảm bảo dùng đúng cú pháp
import { static as serveStatic } from 'express';

const app = express();
const PORT = 3001;

// Đường dẫn thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware serving static files
app.use(serveStatic(join(__dirname, '../public')));

// Sử dụng CORS để cho phép các yêu cầu từ nguồn khác
app.use(cors());

// Kết nối đến PostgreSQL
const client = new Client({
  user: 'nmt',
  host: '34.80.252.31',
  database: 'combined',
  password: 'nmt_acc',
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
app.get('/api/rsi_pre', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      'SELECT "RSI_14" as key,"BASE","DATE" FROM bigdata.rsi WHERE "BASE"=$1 ORDER By "DATE" ASC',
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});
app.get('/api/rsi_now', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      'SELECT "RSI_14" FROM bigdata.rsi WHERE "BASE"=$1 ORDER By "DATE" DESC LIMIT 1',
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});

// app.get('/api/ema', async (req, res) => {
//   const { crypto } = req.query;  

//   // Nếu không có tham số crypto, trả về lỗi 400
//   if (!crypto) {
//     return res.status(400).send('Crypto parameter is required');
//   }

//   try {
//     const result = await client.query(`
//       SELECT * 
//       FROM bigdata.ema 
//       WHERE BASE = $1  -- Sử dụng tham số để tránh SQL injection
      
//     `, [crypto]);  // Truyền tham số crypto vào câu query

//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error executing query', err);
//     res.status(500).send('Error retrieving data');
//   }
// });
app.get('/api/sma_pre', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      'SELECT "SMA_5","SMA_10" as key,"SMA_20","SMA_50","SMA_100","SMA_200","BASE","DATE" FROM bigdata.sma WHERE "BASE"=$1 ORDER By "DATE" ASC',
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});
app.get('/api/sma_now', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      'SELECT "SMA_5","SMA_10" ,"SMA_20","SMA_50","SMA_100","SMA_200" FROM bigdata.sma WHERE "BASE"=$1 ORDER By "DATE" DESC LIMIT 1',
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});
app.get('/api/macd_pre', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      'SELECT "MACD" as key,"BASE","DATE" FROM bigdata.ema WHERE "BASE"=$1 ORDER By "DATE" ASC',
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});
app.get('/api/macd_now', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      'SELECT "MACD" FROM bigdata.ema WHERE "BASE"=$1 ORDER By "DATE" DESC LIMIT 1',
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});
app.get('/api/ema_pre', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      `SELECT "ema5","ema10","ema20","ema50","ema100","ema200","ema13","ema12","ema26","BASE","DATE" 
      FROM bigdata.ema 
      WHERE "BASE"=$1 
      ORDER By "DATE" ASC`,
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});
app.get('/api/ema_now', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      `SELECT "ema5","ema10","ema20","ema50","ema100","ema200","ema13","ema12","ema26" 
      FROM bigdata.ema 
      WHERE "BASE"=$1 
      ORDER By "DATE" DESC LIMIT 1`,
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Lỗi server");
  }
});


app.get('/api/bullbear', async (req, res) => {
  try {
    // Query để lấy dữ liệu từ bảng price_24h
    const { crypto } = req.query;
    const result = await client.query(
      `SELECT 
          p.base, 
          p.date, 
          e."ema13", 
          p.high,
          p.low,
          (p.high - e."ema13") AS bear, 
          (p.low - e."ema13") AS bull
      FROM 
          bigdata.price p
      JOIN 
          bigdata.ema e 
      ON 
          p.base = e."BASE" AND p.date = e."DATE"
      WHERE 
          p.base = $1
          AND TO_DATE(p.date, 'YYYY-MM-DD') >= (CURRENT_DATE - INTERVAL '2 month')
      ORDER BY 
          TO_DATE(p.date, 'YYYY-MM-DD') ASC;
      `,
      [crypto] // Dùng parameterized query để tránh SQL injection
    ); 
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
app.get('/api/macd_table', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT "BASE", "MACD", "DATE" 
      FROM bigdata.ema
      WHERE "BASE" IN ('BTC', 'ETH', 'USDT', 'ADA', 'DOGE', 'MATIC')
      ORDER BY "DATE" DESC LIMIT 1
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu MACD:", error);
    res.status(500).send("Lỗi server");
  }
})};
});

app.get('/api/rsi_table', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT "BASE", "RSI_14" as RSI, "DATE" 
      FROM bigdata.rsi
      WHERE "BASE" IN ('BTC', 'ETH', 'USDT', 'ADA', 'DOGE', 'MATIC')
      ORDER BY "DATE" DESC LIMIT 6
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu RSI:", error);
    res.status(500).send("Lỗi server");
  }
})

app.get('/api/sma_table', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT "BASE", "SMA_5", "SMA_10", "SMA_20", "SMA_50", "SMA_100", "SMA_200", "DATE" 
      FROM bigdata.sma
      WHERE "BASE" IN ('BTC', 'ETH', 'USDT', 'ADA', 'DOGE', 'MATIC')
      ORDER BY "DATE" DESC LIMIT 6
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu SMA:", error);
    res.status(500).send("Lỗi server");
  }
});

app.get('/api/ema_table', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT "BASE", "ema5", "ema10", "ema20", "ema50", "ema100", "ema200", "DATE" 
      FROM bigdata.ema
      WHERE "BASE" IN ('BTC', 'ETH', 'USDT', 'ADA', 'DOGE', 'MATIC')
      ORDER BY "DATE" DESC LIMIT 1
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu EMA:", error);
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
