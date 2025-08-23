// Injected script that runs in page context for deeper automation
(function() {
  'use strict';
  
  // Platform-specific automation helpers
  const platformHelpers = {
    payhip: {
      waitForElement: (selector, timeout = 10000) => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const check = () => {
            const element = document.querySelector(selector);
            if (element) {
              resolve(element);
            } else if (Date.now() - startTime > timeout) {
              reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      },
      
      fillFormField: async (selector, value) => {
        const element = await platformHelpers.payhip.waitForElement(selector);
        
        // Clear existing value
        element.focus();
        element.select();
        
        // Type value character by character for better compatibility
        element.value = '';
        for (let char of value) {
          element.value += char;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
      },
      
      smartClick: async (selector) => {
        const element = await platformHelpers.payhip.waitForElement(selector);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate human-like click
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }
  };
  
  // Enhanced automation functions
  window.portifyAutomation = {
    async loginToPayhip(email, password) {
      try {
        // Navigate to login if not already there
        if (!window.location.href.includes('payhip.com/login')) {
          window.location.href = 'https://payhip.com/login';
          return { status: 'navigating', message: 'Navigating to login page' };
        }
        
        await platformHelpers.payhip.fillFormField('#email', email);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await platformHelpers.payhip.fillFormField('#password', password);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await platformHelpers.payhip.smartClick('button[type="submit"]');
        
        return { status: 'success', message: 'Login form submitted' };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    },
    
    async createPayhipProduct(productData) {
      try {
        // Navigate to product creation if not already there
        if (!window.location.href.includes('product/add')) {
          window.location.href = 'https://payhip.com/product/add/digital';
          return { status: 'navigating', message: 'Navigating to product creation page' };
        }
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fill product title
        await platformHelpers.payhip.fillFormField('input[name="product_name"]', productData.title);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fill description
        await platformHelpers.payhip.fillFormField('textarea[name="product_description"]', productData.description);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fill price
        await platformHelpers.payhip.fillFormField('input[name="product_price"]', productData.price.toString());
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return { status: 'success', message: 'Product form filled successfully' };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    },
    
    async uploadFile(fileSelector, fileData) {
      try {
        const fileInput = await platformHelpers.payhip.waitForElement(fileSelector);
        
        // Create a blob from file data
        const blob = new Blob([fileData], { type: 'application/octet-stream' });
        const file = new File([blob], 'product-file.zip', { type: 'application/zip' });
        
        // Create FileList
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        return { status: 'success', message: 'File uploaded successfully' };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    },
    
    async getPageInfo() {
      return {
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
        readyState: document.readyState,
        forms: Array.from(document.forms).map(form => ({
          action: form.action,
          method: form.method,
          fields: Array.from(form.elements).map(el => ({
            name: el.name,
            type: el.type,
            value: el.value
          }))
        }))
      };
    }
  };
  
  // Listen for commands from content script
  window.addEventListener('message', async (event) => {
    if (event.data.type === 'PORTIFY_AUTOMATION_COMMAND') {
      const command = event.data.command;
      let result;
      
      switch (command.type) {
        case 'LOGIN_PAYHIP':
          result = await window.portifyAutomation.loginToPayhip(
            command.credentials.email, 
            command.credentials.password
          );
          break;
        case 'CREATE_PAYHIP_PRODUCT':
          result = await window.portifyAutomation.createPayhipProduct(command.productData);
          break;
        case 'UPLOAD_FILE':
          result = await window.portifyAutomation.uploadFile(command.selector, command.fileData);
          break;
        case 'GET_PAGE_INFO':
          result = await window.portifyAutomation.getPageInfo();
          break;
        default:
          result = { status: 'error', message: `Unknown command: ${command.type}` };
      }
      
      // Send result back
      window.postMessage({
        type: 'PORTIFY_AUTOMATION_RESULT',
        commandId: command.id,
        result
      }, '*');
    }
  });
  
})();