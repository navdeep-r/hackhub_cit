# Render Backend Deployment Configuration

# This file tells Render how to deploy the backend
# Visit: https://dashboard.render.com to deploy

## Instructions:

1. **Create Web Service on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   
2. **Configure the service:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   
3. **Environment Variables** (Add these in Render dashboard):
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=8080
   SEC_KEY=your_faculty_secret_code
   GEMINI_API_KEY=your_gemini_api_key (optional)
   ```

4. **Important Settings:**
   - Auto-Deploy: Yes (deploys on git push)
   - Instance Type: Free or Starter
   - Region: Choose closest to your users

## Alternative: Using render.yaml

You can also create a `render.yaml` file in the root directory for automatic configuration.

## MongoDB Setup

If you don't have MongoDB:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to Render environment variables

## Testing Deployment

After deployment:
- Your API will be at: `https://your-app-name.onrender.com`
- Test: `https://your-app-name.onrender.com/api/hackathons`
- Update frontend `.env` with your backend URL

## Common Issues

**Build fails:**
- Check if all dependencies are in package.json
- Ensure Node.js version is compatible

**App crashes:**
- Check Render logs
- Verify all environment variables are set
- Ensure MongoDB connection string is correct
