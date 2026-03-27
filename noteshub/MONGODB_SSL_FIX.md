# MongoDB SSL/TLS Connection Fix for Python 3.14

## Problem
The application was failing to start on Render with the following error:
```
pymongo.errors.ServerSelectionTimeoutError: SSL handshake failed
[SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error (_ssl.c:1081)
```

This error occurred during application startup when trying to connect to MongoDB Atlas from Python 3.14.

## Root Cause
Python 3.14 has stricter SSL/TLS requirements and the MongoDB connection was not properly configured with:
1. Explicit TLS/SSL parameters
2. Proper CA certificate bundle (certifi)
3. Correct connection string parameters

## Solution Applied

### 1. Updated `database.py`
Added proper TLS/SSL configuration with certifi for certificate validation:

```python
import certifi

tls_config = {
    'tls': True,
    'tlsAllowInvalidCertificates': False,
    'tlsAllowInvalidHostnames': False,
    'tlsCAFile': certifi.where(),  # Use certifi's CA bundle
}

client = AsyncIOMotorClient(
    settings.MONGODB_URL,
    **tls_config,
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=30000,
    socketTimeoutMS=30000
)
```

### 2. Updated MongoDB Connection String
Modified the connection string in `.env` to include proper parameters:

```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=noteshub
```

### 3. Updated `requirements.txt`
Added specific versions and certifi package:

```
motor>=3.3.0
pymongo>=4.5.0
certifi>=2023.7.22
```

## Deployment Steps

### For Render Deployment:

1. **Update Environment Variables on Render:**
   - Go to your Render service dashboard
   - Navigate to "Environment" tab
   - Update `MONGODB_URL` to include the query parameters:
     ```
     mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=noteshub
     ```

2. **Commit and Push Changes:**
   ```bash
   git add .
   git commit -m "Fix MongoDB SSL/TLS connection for Python 3.14"
   git push origin main
   ```

3. **Render will automatically redeploy** with the new configuration.

### For Local Testing:

1. **Update your local `.env` file** with the new MongoDB URL format

2. **Install updated dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Test the connection:**
   ```bash
   python run.py
   ```

## Verification

After deployment, check the Render logs for:
```
Successfully connected to MongoDB: noteshub
```

This confirms the SSL/TLS connection is working properly.

## Additional Notes

- The `certifi` package provides Mozilla's CA bundle, which is trusted by MongoDB Atlas
- The TLS configuration explicitly disables invalid certificates for security
- Connection timeouts are set to 30 seconds to allow for slower network conditions
- The connection is tested with a `ping` command before proceeding with index creation

## Troubleshooting

If you still encounter SSL errors:

1. **Verify MongoDB Atlas IP Whitelist:**
   - Ensure `0.0.0.0/0` is added to allow connections from Render

2. **Check MongoDB Atlas Version:**
   - Ensure your cluster supports TLS 1.2 or higher

3. **Verify Credentials:**
   - Ensure username and password are URL-encoded if they contain special characters

4. **Check Render Logs:**
   - Look for specific SSL error messages
   - Verify the connection string is being read correctly from environment variables
