const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

async function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      items_json TEXT NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  });

  const row = await get('SELECT COUNT(*) AS count FROM products');
  if (!row || row.count === 0) {
    const products = [
      {
        name: 'Urban Sneakers',
        description: 'Lightweight sneakers with all-day comfort and street-ready style.',
        price: 69.99,
        category: 'Footwear',
        image: 'images/urban-sneakers.svg'
      },
      {
        name: 'Blissful Backpack',
        description: 'Durable backpack with padded laptop sleeve and organizer pockets.',
        price: 49.99,
        category: 'Accessories',
        image: 'images/blissful-backpack.svg'
      },
      {
        name: 'Rapid Charger',
        description: 'Fast USB-C charger with compact design for modern devices.',
        price: 24.99,
        category: 'Electronics',
        image: 'images/rapid-charger.svg'
      },
      {
        name: 'Everyday Hoodie',
        description: 'Soft cotton hoodie with a relaxed fit and vivid color palette.',
        price: 39.99,
        category: 'Apparel',
        image: 'images/everyday-hoodie.svg'
      }
    ];

    for (const product of products) {
      await run(
        'INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.image, product.category]
      );
    }
  }
}

module.exports = { run, get, all, init };
