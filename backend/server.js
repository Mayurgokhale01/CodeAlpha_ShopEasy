const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'shopEasySecret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const createToken = (user) => jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '2h' });

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  const token = authorization.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = payload;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const user = { id: result.lastID, name, email };
    res.json({ token: createToken(user), user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.get('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not load product' });
  }
});

app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!Array.isArray(items) || typeof total !== 'number') {
      return res.status(400).json({ error: 'Order data is invalid' });
    }

    const createdAt = new Date().toISOString();
    const result = await db.run(
      'INSERT INTO orders (user_id, items_json, total, created_at) VALUES (?, ?, ?, ?)',
      [req.user.id, JSON.stringify(items), total, createdAt]
    );

    res.json({ id: result.lastID, user_id: req.user.id, items, total, created_at: createdAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Order processing failed' });
  }
});

app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const orders = await db.all('SELECT id, items_json, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const parsedOrders = orders.map((order) => ({
      ...order,
      items: JSON.parse(order.items_json)
    }));
    res.json(parsedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not load orders' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

(async () => {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database', error);
    process.exit(1);
  }
})();
