const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Configuration for target services
const USER_SERVICE_URL = 'http://localhost:5001';
const RECIPE_SERVICE_URL = 'http://localhost:5000';
const AUTHORIZER_SERVICE_URL = 'http://localhost:5002';

// CORS configuration for Expo development
app.use(cors({
  origin: [
    'http://localhost:8081',      // Expo Dev Server
    'exp://localhost:8081',       // Expo tunneling
    'http://127.0.0.1:8081',     // Alternative localhost
    'http://192.168.1.100:8081', // Common local network IP (adjust as needed)
    'exp://192.168.1.100:8081',  // Expo on local network
    /^https?:\/\/.*\.ngrok\.io$/, // ngrok tunnels
    /^https?:\/\/.*\.tunnels\.dev$/ // Expo tunnels
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Log headers in development
  if (req.headers.authorization) {
    console.log('  Auth: Bearer token present');
  }
  
  next();
});

// Authorization middleware for recipe routes
const authorizeRequest = async (req, res, next) => {
  // Skip authorization for non-recipe routes
  if (!req.path.startsWith('/recipes')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: 'Authorization header missing',
      message: 'Please provide a valid authorization token'
    });
  }

  try {
    console.log('🔐 Calling Authorizer Lambda for authorization...');
    
    // Call the Authorizer Lambda function
    const authResponse = await axios.post(`${AUTHORIZER_SERVICE_URL}/authorize`, {
      authorizationToken: authHeader.replace('Bearer ', ''),
      methodArn: `execute-api:/*/${req.method}${req.path}`,
      httpMethod: req.method,
      headers: req.headers
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (authResponse.data && authResponse.data.policyDocument?.statement?.[0]?.effect === 'Allow') {
      // Authorization successful - extract user context
      const context = authResponse.data.context || {};
      const userId = context.userId || authResponse.data.principalId;
      
      console.log('✅ Authorization successful for user:', userId);
      
      // Add user context to request headers for the Recipe Lambda
      req.headers['X-User-Id'] = userId;
      if (context.email) {
        req.headers['X-User-Email'] = context.email;
      }
      
      return next();
    } else {
      console.log('❌ Authorization denied by Authorizer Lambda');
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      });
    }
  } catch (error) {
    console.error('❌ Authorization error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        error: 'Authorizer service unavailable',
        message: `Failed to connect to Authorizer Lambda at ${AUTHORIZER_SERVICE_URL}`,
        suggestion: 'Make sure the Authorizer Lambda is running on port 5002'
      });
    }
    
    return res.status(401).json({
      error: 'Authorization failed',
      message: 'Unable to verify your authorization token'
    });
  }
};

// Apply authorization middleware globally
app.use(authorizeRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      user: USER_SERVICE_URL,
      recipe: RECIPE_SERVICE_URL,
      authorizer: AUTHORIZER_SERVICE_URL
    }
  });
});

// Auth service proxy - routes /auth/* to User Lambda on port 5001
app.use('/auth', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/auth': '/auth' // Keep the /auth path for the target service
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for User service:`, err.message);
    res.status(502).json({
      error: 'User service unavailable',
      message: `Failed to connect to ${USER_SERVICE_URL}`,
      suggestion: 'Make sure the User Lambda is running on port 5001'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying to User service: ${req.method} ${USER_SERVICE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ User service response: ${proxyRes.statusCode}`);
  }
}));

// Recipe service proxy - routes /recipes/* to Recipe Lambda on port 5000
app.use('/recipes', createProxyMiddleware({
  target: RECIPE_SERVICE_URL,
  changeOrigin: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/recipes': '/recipes' // Keep the /recipes path for the target service
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for Recipe service:`, err.message);
    res.status(502).json({
      error: 'Recipe service unavailable',
      message: `Failed to connect to ${RECIPE_SERVICE_URL}`,
      suggestion: 'Make sure the Recipe Lambda is running on port 5000'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying to Recipe service: ${req.method} ${RECIPE_SERVICE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Recipe service response: ${proxyRes.statusCode}`);
  }
}));

// Catch-all for unmatched routes
app.use('*', (req, res) => {
  console.log(`⚠️  Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `No service configured for ${req.originalUrl}`,
    availableRoutes: [
      '/auth/* -> User service (port 5001)',
      '/recipes/* -> Recipe service (port 5000) [with authorization]',
      '/health -> Gateway health check'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Gateway error',
    message: err.message
  });
});

// Start the gateway server
app.listen(PORT, () => {
  console.log(`🚀 Local API Gateway running on http://localhost:${PORT}`);
  console.log('📍 Route configuration:');
  console.log(`   /auth/*    -> ${USER_SERVICE_URL}`);
  console.log(`   /recipes/* -> ${RECIPE_SERVICE_URL} [with authorization via ${AUTHORIZER_SERVICE_URL}]`);
  console.log(`   /health    -> Gateway health check`);
  console.log('');
  console.log('💡 Make sure all Lambda services are running:');
  console.log(`   User Lambda:       ${USER_SERVICE_URL}`);
  console.log(`   Recipe Lambda:     ${RECIPE_SERVICE_URL}`);
  console.log(`   Authorizer Lambda: ${AUTHORIZER_SERVICE_URL}`);
  console.log('');
  console.log('🔍 Test the gateway:');
  console.log(`   curl http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Gateway shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Gateway shutting down...');
  process.exit(0);
});