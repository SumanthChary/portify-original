// Injected script that runs in page context for deeper automation
(function() {
  'use strict';
  
  // Enhanced platform-specific automation helpers
  const platformHelpers = {
    payhip: {
      // Multiple selector fallbacks for Payhip forms
      selectors: {
        email: ['#email', 'input[name="email"]', 'input[type="email"]', '.email-input'],
        password: ['#password', 'input[name="password"]', 'input[type="password"]', '.password-input'],
        loginBtn: ['button[type="submit"]', '.login-btn', '.submit-btn', 'input[type="submit"]'],
        productName: ['input[name="product_name"]', '#product_name', 'input[name="name"]', '.product-name-input'],
        productDescription: ['textarea[name="product_description"]', '#product_description', 'textarea[name="description"]', '.product-description'],
        productPrice: ['input[name="product_price"]', '#product_price', 'input[name="price"]', '.price-input'],
        fileUpload: ['input[type="file"]', '#product_file', 'input[name="file"]', '.file-upload'],
        imageUpload: ['input[type="file"][accept*="image"]', '#product_image', 'input[name="image"]', '.image-upload'],
        submitBtn: ['button[type="submit"]', '.submit-btn', '.publish-btn', 'input[type="submit"]']
      },

      waitForElement: (selectors, timeout = 15000) => {
        return new Promise((resolve, reject) => {
          const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
          const startTime = Date.now();
          
          const check = () => {
            for (const selector of selectorArray) {
              const element = document.querySelector(selector);
              if (element && element.offsetParent !== null) { // Check if visible
                resolve(element);
                return;
              }
            }
            
            if (Date.now() - startTime > timeout) {
              reject(new Error(`None of these selectors found: ${selectorArray.join(', ')}`));
            } else {
              setTimeout(check, 200);
            }
          };
          check();
        });
      },
      
      fillFormField: async (selectors, value) => {
        const element = await platformHelpers.payhip.waitForElement(selectors);
        
        // Clear existing value
        element.focus();
        element.select();
        
        // Type value realistically
        element.value = '';
        for (let char of value) {
          element.value += char;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('keyup', { bubbles: true }));
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        }
        
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        
        // Verify the value was set
        if (element.value !== value) {
          throw new Error(`Failed to set value for field. Expected: ${value}, Got: ${element.value}`);
        }
      },
      
      smartClick: async (selectors) => {
        const element = await platformHelpers.payhip.waitForElement(selectors);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if element is clickable
        if (element.disabled) {
          throw new Error('Element is disabled and cannot be clicked');
        }
        
        // Simulate realistic human-like click
        element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 200));
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 150));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        // Also try the direct click method as fallback
        element.click();
      },

      downloadImageAsFile: async (imageUrl) => {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
          
          const blob = await response.blob();
          const fileName = imageUrl.split('/').pop().split('?')[0] || 'product-image.jpg';
          
          return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        } catch (error) {
          console.error('Failed to download image:', error);
          throw error;
        }
      },

      uploadFile: async (selectors, file) => {
        const fileInput = await platformHelpers.payhip.waitForElement(selectors);
        
        // Create FileList
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Trigger events
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        fileInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Wait for upload to process
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };
  
  // Enhanced automation functions with real Payhip integration
  window.portifyAutomation = {
    async loginToPayhip(email, password) {
      try {
        console.log('🔐 Starting Payhip login process...');
        
        // Navigate to login if not already there
        if (!window.location.href.includes('payhip.com/login')) {
          console.log('📍 Navigating to login page...');
          window.location.href = 'https://payhip.com/login';
          return { status: 'navigating', message: 'Navigating to login page' };
        }
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('✍️ Filling email field...');
        await platformHelpers.payhip.fillFormField(
          platformHelpers.payhip.selectors.email, 
          email
        );
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('🔑 Filling password field...');
        await platformHelpers.payhip.fillFormField(
          platformHelpers.payhip.selectors.password, 
          password
        );
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('🚀 Clicking login button...');
        await platformHelpers.payhip.smartClick(
          platformHelpers.payhip.selectors.loginBtn
        );
        
        return { status: 'success', message: 'Login form submitted successfully' };
      } catch (error) {
        console.error('❌ Login failed:', error);
        return { status: 'error', message: `Login failed: ${error.message}` };
      }
    },
    
    async createPayhipProduct(productData) {
      try {
        console.log('🛍️ Starting product creation for:', productData.title);
        
        // Navigate to product creation if not already there
        if (!window.location.href.includes('product/add') && !window.location.href.includes('products/new')) {
          console.log('📍 Navigating to product creation page...');
          window.location.href = 'https://payhip.com/product/add/digital';
          return { status: 'navigating', message: 'Navigating to product creation page' };
        }
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✍️ Filling product title...');
        await platformHelpers.payhip.fillFormField(
          platformHelpers.payhip.selectors.productName, 
          productData.title
        );
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('📝 Filling product description...');
        await platformHelpers.payhip.fillFormField(
          platformHelpers.payhip.selectors.productDescription, 
          productData.description || ''
        );
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('💰 Setting product price...');
        await platformHelpers.payhip.fillFormField(
          platformHelpers.payhip.selectors.productPrice, 
          productData.price.toString()
        );
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Handle image uploads if provided
        if (productData.images && productData.images.length > 0) {
          console.log('🖼️ Uploading product images...');
          await this.uploadProductImages(productData.images);
        }
        
        console.log('✅ Product form filled successfully!');
        return { status: 'success', message: `Product "${productData.title}" form filled successfully` };
      } catch (error) {
        console.error('❌ Product creation failed:', error);
        return { status: 'error', message: `Product creation failed: ${error.message}` };
      }
    },

    async uploadProductImages(imageUrls) {
      try {
        console.log('📸 Starting image upload process...');
        
        for (let i = 0; i < Math.min(imageUrls.length, 3); i++) { // Limit to 3 images
          const imageUrl = imageUrls[i];
          console.log(`🖼️ Processing image ${i + 1}/${imageUrls.length}: ${imageUrl}`);
          
          try {
            // Download image
            const imageFile = await platformHelpers.payhip.downloadImageAsFile(imageUrl);
            console.log('✅ Image downloaded:', imageFile.name);
            
            // Upload to Payhip
            await platformHelpers.payhip.uploadFile(
              platformHelpers.payhip.selectors.imageUpload,
              imageFile
            );
            console.log('✅ Image uploaded successfully');
            
            // Wait between uploads
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.warn(`⚠️ Failed to upload image ${i + 1}:`, error);
            // Continue with other images
          }
        }
        
        console.log('🎉 Image upload process completed');
        return { status: 'success', message: 'Images uploaded successfully' };
      } catch (error) {
        console.error('❌ Image upload failed:', error);
        return { status: 'error', message: `Image upload failed: ${error.message}` };
      }
    },

    async submitProduct() {
      try {
        console.log('🚀 Submitting product...');
        
        await platformHelpers.payhip.smartClick(
          platformHelpers.payhip.selectors.submitBtn
        );
        
        // Wait for submission to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ Product submitted successfully!');
        return { status: 'success', message: 'Product submitted successfully' };
      } catch (error) {
        console.error('❌ Product submission failed:', error);
        return { status: 'error', message: `Product submission failed: ${error.message}` };
      }
    },
    
    async uploadFile(fileSelector, fileData) {
      try {
        console.log('📁 Starting file upload...');
        const fileInput = await platformHelpers.payhip.waitForElement(fileSelector);
        
        // Create a blob from file data
        const blob = new Blob([fileData], { type: 'application/octet-stream' });
        const file = new File([blob], 'product-file.zip', { type: 'application/zip' });
        
        // Upload file
        await platformHelpers.payhip.uploadFile([fileSelector], file);
        
        console.log('✅ File uploaded successfully');
        return { status: 'success', message: 'File uploaded successfully' };
      } catch (error) {
        console.error('❌ File upload failed:', error);
        return { status: 'error', message: `File upload failed: ${error.message}` };
      }
    },
    
    async getPageInfo() {
      return {
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
        readyState: document.readyState,
        isLoginPage: window.location.href.includes('login'),
        isProductPage: window.location.href.includes('product/add') || window.location.href.includes('products/new'),
        isDashboard: window.location.href.includes('dashboard') || window.location.href.includes('account'),
        forms: Array.from(document.forms).map(form => ({
          action: form.action,
          method: form.method,
          fields: Array.from(form.elements).map(el => ({
            name: el.name,
            type: el.type,
            value: el.value?.substring(0, 50) // Limit value length for privacy
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
      
      console.log('🤖 Received automation command:', command.type);
      
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
        case 'UPLOAD_PRODUCT_IMAGES':
          result = await window.portifyAutomation.uploadProductImages(command.imageUrls);
          break;
        case 'SUBMIT_PRODUCT':
          result = await window.portifyAutomation.submitProduct();
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
      
      console.log('🤖 Command result:', result);
      
      // Send result back
      window.postMessage({
        type: 'PORTIFY_AUTOMATION_RESULT',
        commandId: command.id,
        result
      }, '*');
    }
  });
  
})();