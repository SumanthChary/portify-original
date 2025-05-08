const PRODUCTS_API_URL = 'https://yourdomain.com/products.json';

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
    btn.onclick = () => {
      // Send product to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillForm', product });
      });
    };
    container.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  renderProducts(products);
});

document.getElementById('uploadBtn').onclick = async () => {
  const fileInput = document.getElementById('fileInput');
  if (!fileInput.files.length) {
    alert('Please select a products.json file.');
    return;
  }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const products = JSON.parse(e.target.result);
      if (!Array.isArray(products) || !products.length) {
        alert('Invalid or empty products.json!');
        return;
      }
      // Inject script into Payhip tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (products) => {
          // Fill the form for the first product (can be extended for multiple)
          const product = products[0];
          document.querySelector('input[name="product_name"]').value = product.product_title;
          document.querySelector('textarea[name="product_description"]').value = product.description;
          document.querySelector('input[name="product_price"]').value = product.price.toString();
        },
        args: [products]
      });
      alert('Product data filled! Review and submit on Payhip.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
  reader.readAsText(file);
};
