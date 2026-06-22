const apiBase = 'http://localhost:3000/api';

async function fetchProduct(id) {
  const response = await fetch(`${apiBase}/products/${id}`);
  if (!response.ok) throw new Error('Product not found');
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

async function renderProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('product-detail').textContent = 'Product ID is missing.';
    return;
  }

  try {
    const product = await fetchProduct(id);
    document.getElementById('product-detail').innerHTML = `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="card-body">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p class="price">$${product.price.toFixed(2)}</p>
          <button type="button" id="addToCartBtn">Add to Cart</button>
        </div>
      </div>
    `;

    document.getElementById('addToCartBtn').onclick = () => addToCart(product);
  } catch (error) {
    document.getElementById('product-detail').textContent = error.message;
  }
}

renderProduct();
