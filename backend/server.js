import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

app.use(cors());
app.use(bodyParser.json());

// Helpers
function authMiddleware(req,res,next){
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')? header.slice(7) : null;
  if(!token) return res.status(401).json({ error: 'Missing token' });
  try{
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  }catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Signup
app.post('/signup', async (req,res)=>{
  const { name, email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email/password required' });
  const hash = await bcrypt.hash(password, 10);
  try{
    await db.execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)',[name||'',email,hash]);
    res.json({ ok: true });
  }catch(e){
    if(e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email exists' });
    res.status(500).json({ error: 'DB error', details: e.message });
  }
});

// Login
app.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const [rows] = await db.execute('SELECT id,name,email,password_hash FROM users WHERE email=?',[email]);
  if(!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id:user.id, email:user.email, name:user.name }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// Get me
app.get('/me', authMiddleware, (req,res)=>{
  res.json(req.user);
});

// Products (public)
app.get('/products', async (req,res)=>{
  const [rows] = await db.execute('SELECT id,name,description,price,image_url FROM products');
  res.json(rows);
});

app.get('/products/:id', async (req,res)=>{
  const [rows] = await db.execute('SELECT id,name,description,price,image_url FROM products WHERE id=?',[req.params.id]);
  if(!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// Cart
app.post('/cart', authMiddleware, async (req,res)=>{
  const { productId, qty } = req.body;
  const userId = req.user.id;
  if(!productId || !qty) return res.status(400).json({ error: 'productId, qty required' });
  await db.execute('INSERT INTO cart (user_id, product_id, qty) VALUES (?,?,?)',[userId, productId, qty]);
  res.json({ ok: true });
});

app.get('/cart', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const [rows] = await db.execute(`
    SELECT c.id, c.product_id, c.qty, p.name, p.price, p.image_url
    FROM cart c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `,[userId]);
  res.json(rows);
});

// Checkout
app.post('/checkout', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const [items] = await db.execute(`
    SELECT c.product_id, c.qty, p.price
    FROM cart c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `,[userId]);
  if(!items.length) return res.status(400).json({ error: 'Cart empty' });
  const total = items.reduce((s,i)=> s + Number(i.price)*Number(i.qty), 0);
  const [orderResult] = await db.execute('INSERT INTO orders (user_id, total, status) VALUES (?,?,?)',[userId, total, 'PENDING']);
  const orderId = orderResult.insertId;
  for(const it of items){
    await db.execute('INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?,?,?,?)',[orderId, it.product_id, it.qty, it.price]);
  }

  // Mock payment: 90% success
  const ok = Math.random() < 0.9;
  if(ok){
    await db.execute('UPDATE orders SET status=? WHERE id=?',['PAID', orderId]);
    await db.execute('DELETE FROM cart WHERE user_id=?',[userId]);
    return res.json({ orderId, status: 'PAID' });
  }else{
    await db.execute('UPDATE orders SET status=? WHERE id=?',['FAILED', orderId]);
    return res.status(402).json({ orderId, status: 'FAILED' });
  }
});

// Orders for user
app.get('/orders', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const [rows] = await db.execute('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC',[userId]);
  res.json(rows);
});

// Health
app.get('/health', (req,res)=> res.json({ ok:true }));

app.listen(PORT, ()=> console.log(`Backend on ${PORT}`));

