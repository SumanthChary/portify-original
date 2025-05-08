// content.js
// Listen for messages from popup.js and fill the Payhip product form

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm' && request.product) {
    const product = request.product;
    // Try to fill the form fields (update selectors if Payhip changes them)
    const titleInput = document.querySelector('input[name="product_name"], input[name="title"]');
    const descTextarea = document.querySelector('textarea[name="product_description"], textarea[name="description"]');
    const priceInput = document.querySelector('input[name="product_price"], input[name="price"]');
    if (titleInput && descTextarea && priceInput) {
      titleInput.value = product.product_title;
      descTextarea.value = product.description.replace(/<[^>]+>/g, '');
      priceInput.value = product.price.toString();
      // Trigger input events for Payhip's JS listeners
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      descTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      priceInput.dispatchEvent(new Event('input', { bubbles: true }));
      // Try to auto-submit the form if possible
      const form = titleInput.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    } else {
      alert('Could not find one or more form fields on Payhip.');
    }
  }
});
