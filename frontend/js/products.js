const apiBase = 'http://localhost:3000/api';

async function fetchProducts() {
  const response = await fetch(`${apiBase}/products`);
  return response.json();
}

function getCart() {
  return JSON.parse(localStorage.getItem('shopEasyCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('shopEasyCart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === product.id);
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  alert(`${product.name} added to cart`);
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div class="card-body">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="actions">
        <span class="price">$${product.price.toFixed(2)}</span>
        <div>
          <button type="button" onclick="viewProduct(${product.id})">View</button>
          <button type="button" onclick='addToCart(${JSON.stringify(product)})'>Add</button>
        </div>
      </div>
    </div>
  `;
  return card;
}

function viewProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

async function renderProducts() {
  const container = document.getElementById('products');
  if (!container) return;
  const products = await fetchProducts();
  container.innerHTML = '';

  products.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

renderProducts();
