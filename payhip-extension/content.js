// content.js
// Listen for messages from popup.js and fill the Payhip product form

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm' && request.product) {
    const product = request.product;
    // Try to fill the form fields (update selectors if Payhip changes them)
    const titleInput = document.querySelector('input[name="title"]');
    const descTextarea = document.querySelector('textarea[name="description"]');
    const priceInput = document.querySelector('input[name="price"]');
    if (titleInput && descTextarea && priceInput) {
      titleInput.value = product.product_title;
      descTextarea.value = product.description.replace(/<[^>]+>/g, '');
      priceInput.value = product.price.toString();
      // Optionally, trigger input events if Payhip uses JS listeners
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      descTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      priceInput.dispatchEvent(new Event('input', { bubbles: true }));
      alert('Product data filled! Review and submit on Payhip.');
    } else {
      alert('Could not find one or more form fields on Payhip.');
    }
  }
});
