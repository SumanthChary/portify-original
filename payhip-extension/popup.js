const PRODUCTS_API_URL = 'https://portify-original.lovable.app/products.json';
let selectedProduct = null;

async function fetchProducts() {
  const res = await fetch(PRODUCTS_API_URL);
  return res.json();
}

function renderProducts(products) {
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach((product, idx) => {
    const btn = document.createElement('button');
    btn.textContent = product.product_title;
    btn.className = 'product-btn';
    btn.onclick = () => {
      // Visually indicate selection
      Array.from(container.children).forEach(child => child.classList.remove('selected'));
      btn.classList.add('selected');
      selectedProduct = product;
      document.getElementById('status').textContent = `Selected: ${product.product_title}`;
      // Immediately send the product to the content script for auto write
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillForm', product: selectedProduct });
        document.getElementById('status').textContent = 'Product sent to Payhip form!';
      });
    };
    container.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  renderProducts(products);
});
