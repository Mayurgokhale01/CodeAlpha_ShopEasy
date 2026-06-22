const apiBase = 'http://localhost:3000/api';

function getCart() {
  return JSON.parse(localStorage.getItem('shopEasyCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('shopEasyCart', JSON.stringify(cart));
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const emptyEl = document.getElementById('empty-cart');

  if (!cart.length) {
    list.innerHTML = '<p>Your cart is empty.</p>';
    totalEl.textContent = '$0.00';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  list.innerHTML = ''; 
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    const li = document.createElement('li');
    li.innerHTML = `
      <a class="cart-item-link" href="product.html?id=${item.id}">
        <img src="${item.image}" alt="${item.name}">
      </a>
      <div class="cart-item-details">
        <a class="cart-item-link" href="product.html?id=${item.id}"><strong>${item.name}</strong></a>
        <span>Quantity: ${item.quantity}</span>
      </div>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
      <button type="button" data-index="${index}">Remove</button>
    `;
    li.querySelector('button').onclick = () => {
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    };
    list.appendChild(li);
  });

  totalEl.textContent = `$${total.toFixed(2)}`;
}

async function submitOrder(event) {
  event.preventDefault();
  const cart = getCart();
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }

  const token = localStorage.getItem('shopEasyToken');
  if (!token) {
    alert('Please login before placing an order.');
    window.location.href = 'login.html';
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const response = await fetch(`${apiBase}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ items: cart, total })
  });

  const result = await response.json();
  if (!response.ok) {
    alert(result.error || 'Could not place order.');
    return;
  }

  localStorage.removeItem('shopEasyCart');
  alert('Order placed successfully!');
  renderCart();
}

renderCart();
const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', submitOrder);
}
