
# N8n Workflow Setup Instructions

## Step 1: Update Playwright Node Configuration

1. **Open your n8n workflow**: https://portify-beta.app.n8n.cloud
2. **Click on the "Enhanced Playwright Migration" node**
3. **Replace the code in the "Actions" > "Evaluate" field with the content from `N8nInlinePlaywrightScript.js`**

## Step 2: Configure Environment Variables in N8n

1. Go to n8n Settings > Environment Variables
2. Add these variables:
   ```
   PAYHIP_EMAIL=enjoywithpandu@gmail.com
   PAYHIP_PASSWORD=phc@12345
   ```

## Step 3: Enable CORS in N8n Webhook

1. Go to your webhook node settings
2. Enable "CORS" option
3. Set allowed origins to: `*` (for testing) or your specific domain

## Step 4: Test the Workflow

1. Use the "Test webhook" button in n8n
2. Send a test payload:
   ```json
   {
     "user_email": "test@example.com",
     "product_title": "Test Product",
     "description": "Test Description",
     "price": "9.99",
     "gumroad_product_id": "test123"
   }
   ```

## Step 5: Monitor Execution

1. Check the execution logs in n8n
2. Look for console.log outputs from the Playwright script
3. Verify the migration record is created in Supabase

## Common Issues & Solutions

### Issue: "Cannot find module" error
**Solution**: Copy the entire script content directly into the n8n node instead of importing

### Issue: Authentication fails
**Solution**: Check if environment variables are properly set in n8n

### Issue: CAPTCHA blocking
**Solution**: The script has built-in CAPTCHA handling, but some may require manual intervention

### Issue: Network timeout
**Solution**: Increase timeout values in the script or check network connectivity

## Success Indicators

✅ No errors in n8n execution log
✅ Playwright script logs show successful login
✅ Product creation logs appear
✅ Supabase database record is updated
✅ Email notification is sent
