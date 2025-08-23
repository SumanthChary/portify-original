# 🚀 Portify Browser Extension Setup Guide

## Quick Setup (3 minutes)

### Step 1: Install the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `browser-extension` folder from this project
5. Pin the extension to your toolbar

### Step 2: Connect to Web App
1. Click the Portify extension icon in your toolbar
2. Click "Connect to Web App"
3. Copy the session ID that appears
4. Go to: https://portify-original.lovable.app/live-automation
5. Paste the session ID and click "Connect"

### Step 3: Start Automating!
🎉 You'll now see your browser live in the web app and can control it remotely!

## How It Works

### The Magic Behind Live Browser Automation

**🎯 100% Free Solution**
- No cloud servers needed
- Runs entirely in your browser
- Uses WebRTC for real-time streaming

**🔧 Technical Architecture**
```
Your Browser Extension ↔ WebRTC ↔ Web App Interface
     ↓                              ↓
Real Browser Actions          Live Video Stream
     ↓                              ↓
Platform Login/Migration      Command Center
```

**⚡ Real-time Features**
- Live screen sharing (10-15 FPS)
- Instant command execution
- Progress tracking
- Error handling & recovery

## Extension Features

### 🤖 Smart Automation
- **Platform Login**: Automatically log into Gumroad, Payhip, etc.
- **Form Filling**: Smart form detection and filling
- **Product Migration**: Full product data transfer
- **File Uploads**: Handle zip files and media
- **Error Recovery**: Retry failed actions

### 📺 Live Monitoring
- **Real-time View**: See exactly what's happening
- **Action Overlay**: Current step displayed on screen
- **Progress Tracking**: Know exactly where you are
- **Fullscreen Mode**: Watch in detail

### 🔒 Privacy & Security
- **Local Processing**: Everything runs on your machine
- **No Data Storage**: No sensitive data leaves your browser
- **Encrypted Connection**: WebRTC uses DTLS encryption
- **Session-based**: Temporary connections only

## Supported Platforms

### ✅ Currently Supported
- **Payhip**: Full automation (login, product creation, file upload)
- **Gumroad**: Product extraction and migration
- **Generic Forms**: Any website with standard forms

### 🔄 Coming Soon
- **Teachable**: Course migration
- **Etsy**: Product listing automation
- **eBay**: Bulk listing tools
- **Shopify**: Store migration

## Advanced Usage

### Custom Commands
You can send custom automation commands:

```javascript
// Navigate to any URL
sendCommand({ 
  type: 'NAVIGATE', 
  data: { url: 'https://example.com' } 
});

// Fill any form
sendCommand({ 
  type: 'FILL_FORM', 
  data: { 
    '#email': 'user@example.com',
    '#password': 'password123'
  } 
});

// Click any element
sendCommand({ 
  type: 'CLICK', 
  data: { selector: '.submit-button' } 
});
```

### Platform-Specific Actions
```javascript
// Login to Payhip
sendCommand({
  type: 'LOGIN_PAYHIP',
  data: {
    credentials: {
      email: 'your@email.com',
      password: 'yourpassword'
    }
  }
});

// Create a product
sendCommand({
  type: 'CREATE_PAYHIP_PRODUCT',
  data: {
    title: 'My Product',
    description: 'Product description',
    price: '9.99'
  }
});
```

## Troubleshooting

### Common Issues

**❌ "Extension not connecting"**
- Make sure you're on the live-automation page
- Check that the session ID is correct
- Try refreshing both the extension popup and web page

**❌ "No video stream"**
- Click "Allow" when prompted for screen sharing
- Make sure you select the correct browser tab
- Check Chrome permissions for the extension

**❌ "Commands not executing"**
- Ensure the target website is fully loaded
- Check if the form selectors have changed
- Try manual mode first to test

**❌ "Login failing"**
- Verify your credentials are correct
- Check for CAPTCHA or 2FA requirements
- Some sites may block automated logins

### Performance Tips

**🚀 Optimize Video Quality**
- Lower resolution for faster streaming
- Close unnecessary tabs
- Use a fast internet connection

**⚡ Speed Up Automation**
- Pre-login to platforms manually first
- Keep forms simple and clean
- Test with one product before bulk migration

## Development

### Extending the Extension

Want to add support for a new platform? Here's how:

1. **Add Platform Config** in `content.js`:
```javascript
const platformConfigs = {
  yourplatform: {
    loginUrl: 'https://yourplatform.com/login',
    emailSelector: '#email',
    passwordSelector: '#password',
    submitSelector: 'button[type="submit"]'
  }
};
```

2. **Add Automation Logic** in `injected.js`:
```javascript
async loginToYourPlatform(email, password) {
  // Custom login logic here
}
```

3. **Test and Deploy**!

### Building from Source

```bash
# No build step needed! Pure vanilla JS
# Just load the browser-extension folder directly
```

## Support

Need help? Found a bug? Want a new feature?

- 🐛 **Bug Reports**: Open an issue with browser version and steps to reproduce
- 💡 **Feature Requests**: Describe your use case and platform needs  
- 🤝 **Contributing**: PRs welcome! Focus on adding new platform support
- 📧 **Contact**: reach out for enterprise/custom solutions

---

**🎉 Ready to automate? Install the extension and start migrating!**

The future of browser automation is here - completely free, private, and powerful. No more manual copy-pasting, no more repetitive tasks. Just pure automation magic! ✨