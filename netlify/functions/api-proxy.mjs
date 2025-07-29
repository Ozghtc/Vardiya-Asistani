// Netlify Functions - API Proxy (3-Layer API Key System) - OPTIMIZED
const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika cache - Performance Boost
const cache = new Map();

export const handler = async (event, context) => {
  console.log('📡 Netlify Function başlatıldı - 3-Layer API Key System');
  
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { 
      path, 
      method = 'GET', 
      body, 
      apiKey: bodyApiKey, 
      userEmail: bodyUserEmail,
      projectPassword: bodyProjectPassword
    } = JSON.parse(event.body);
    
    // Cache key oluştur
    const cacheKey = `${method}:${path}:${JSON.stringify(body || {})}`;
    
    // GET istekleri için cache kontrolü
    if (method === 'GET' && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log('⚡ Cache hit:', cacheKey);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://vardiyaasistani.netlify.app',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-User-Email, X-Project-Password',
            'X-Cache': 'HIT',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
          },
          body: JSON.stringify(cachedData.data),
        };
      } else {
        cache.delete(cacheKey);
      }
    }
    
    console.log('Event method:', event.httpMethod);
    console.log('Event headers:', event.headers);
    console.log('Event body:', JSON.parse(event.body));
    
    const allowedOrigins = [
      'https://vardiyaasistani.netlify.app',
      'https://main--vardiyaasistani.netlify.app'
    ];
    
    const origin = event.headers.origin || event.headers.referer;
    console.log('🌐 Origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Allowed Origin:', origin);
    } else {
      console.log('✅ Allowed Origin: *');
    }
    
    // Build API URL with correct Railway backend
    const apiUrl = `https://hzmbackendveritabani-production.up.railway.app${path}`;
    
    // 3-Layer Authentication System
    const apiKey = bodyApiKey || event.headers['x-api-key'] || process.env.VITE_HZM_API_KEY;
    const userEmail = bodyUserEmail || event.headers['x-user-email'] || process.env.VITE_HZM_USER_EMAIL;
    const projectPassword = bodyProjectPassword || event.headers['x-project-password'] || process.env.VITE_HZM_PROJECT_PASSWORD;
    
    console.log('🔄 Proxy Request Details (3-Layer):', {
      apiUrl,
      method,
      hasBody: !!body,
      apiKey: apiKey ? 'PRESENT' : 'MISSING',
      userEmail: userEmail ? 'PRESENT' : 'MISSING',
      projectPassword: projectPassword ? 'PRESENT' : 'MISSING'
    });

    // Prepare request options - 3-Layer API Key System
    const requestOptions = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,           // Layer 1: API Key
        'X-User-Email': userEmail,     // Layer 2: User Email
        'X-Project-Password': projectPassword, // Layer 3: Project Password
        'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        'X-Client-Version': '1.0.0'
      },
    };
    
    console.log('🔑 3-Layer API Key ile authentication');
    
    console.log('📤 Request Headers (3-Layer):', {
      'X-API-Key': apiKey ? 'PRESENT' : 'MISSING',
      'X-User-Email': userEmail ? 'PRESENT' : 'MISSING', 
      'X-Project-Password': projectPassword ? 'PRESENT' : 'MISSING'
    });

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
      console.log('📤 Request body length:', JSON.stringify(body).length);
    }

    console.log('📡 Fetching:', apiUrl);
    
    // Timeout ile fetch işlemi
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout - API Key system için
    
    try {
      const response = await fetch(apiUrl, {
        ...requestOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    
      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      
      const responseText = await response.text();
      console.log('📨 Response text length:', responseText.length);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('✅ API Response parsed successfully (3-Layer)');
        
        // API Key usage bilgisini logla
        if (responseData.data && responseData.data.apiKeyUsage) {
          console.log('📊 API Key Usage:', responseData.data.apiKeyUsage);
        }
      } catch (e) {
        console.log('⚠️ API Response is not JSON:', responseText);
        responseData = { error: 'Invalid JSON response', raw: responseText };
      }

      // GET istekleri için cache'e kaydet
      if (method === 'GET' && response.status === 200) {
        cache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now()
        });
        console.log('💾 Cache set:', cacheKey);
      }

      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://vardiyaasistani.netlify.app',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-User-Email, X-Project-Password, X-Request-ID, X-Client-Version',
          'X-Cache': 'MISS',
          'X-API-System': '3-Layer-Authentication',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000'
        },
        body: JSON.stringify(responseData),
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('⏰ Request timeout after 10 seconds');
        return {
          statusCode: 408,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://vardiyaasistani.netlify.app',
          },
          body: JSON.stringify({
            error: 'Request Timeout',
            message: 'API request timed out after 10 seconds'
          }),
        };
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('🚨 Proxy Function Error (3-Layer):', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://vardiyaasistani.netlify.app',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-User-Email, X-Project-Password',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack,
        system: '3-Layer-API-Key-Authentication'
      }),
    };
  }
}; 