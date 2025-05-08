const PRODUCTS_API_URL = 'https://portify-original.lovable.app/products.json';
let selectedProduct = null;
let products = [];

function renderProducts(productsList) {
  const container = document.getElementById('products');
  container.innerHTML = '';
  productsList.forEach((product, idx) => {
    const div = document.createElement('div');
    div.textContent = product.product_title;
    div.className = 'product-item';
    div.onclick = () => {
      Array.from(container.children).forEach(child => child.classList.remove('selected'));
      div.classList.add('selected');
      selectedProduct = product;
      document.getElementById('status').textContent = `Selected: ${product.product_title}`;
    };
    container.appendChild(div);
  });
}

document.getElementById('selectFileBtn').onclick = () => {
  document.getElementById('fileInput').click();
};

document.getElementById('fileInput').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      products = JSON.parse(event.target.result);
      renderProducts(products);
      document.getElementById('status').textContent = 'Products loaded!';
    } catch (err) {
      document.getElementById('status').textContent = 'Invalid JSON file.';
    }
  };
  reader.readAsText(file);
};

document.getElementById('uploadBtn').onclick = () => {
  if (!selectedProduct) {
    document.getElementById('status').textContent = 'Please select a product first!';
    return;
  }
  // Open Payhip product add page in current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.update(tabs[0].id, { url: 'https://payhip.com/product/add/digital' }, () => {
      // Wait a moment for the page to load, then send the product
      setTimeout(() => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillForm', product: selectedProduct });
        document.getElementById('status').textContent = 'Product sent to Payhip form!';
      }, 2000);
    });
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  renderProducts(products);
});
