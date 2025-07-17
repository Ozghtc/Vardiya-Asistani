// Netlify Functions - API Proxy (ES MODULES) - OPTIMIZED
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache
const cache = new Map();

export const handler = async (event, context) => {
  console.log('📡 Netlify Function başlatıldı - OPTIMIZED');
  
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { path, method = 'GET', body, apiKey: bodyApiKey, jwtToken } = JSON.parse(event.body);
    
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Cache': 'HIT'
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
    const apiUrl = `https://hzmbackandveritabani-production-c660.up.railway.app${path}`;
    
    // API Key öncelikli - JWT token karmaşık olduğu için
    const apiKey = bodyApiKey || event.headers['x-hzm-api-key'] || 'hzm_1ce98c92189d4a109cd604b22bfd86b7';
    
    console.log('🔄 Proxy Request Details:', {
      apiUrl,
      method,
      hasBody: !!body,
      hasJwtToken: !!jwtToken,
      apiKey: apiKey ? 'PRESENT' : 'MISSING',
      jwtTokenFirst10: jwtToken ? jwtToken.substring(0, 10) : 'NONE'
    });

    // Prepare request options - API Key öncelikli
    const requestOptions = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey, // Her zaman API key gönder
      },
    };
    
    // JWT token varsa ek olarak Bearer header da ekle
    if (jwtToken && jwtToken !== apiKey) {
      requestOptions.headers['Authorization'] = `Bearer ${jwtToken}`;
      console.log('🔐 Hem JWT Token hem API Key ile authentication');
    } else {
      console.log('🔑 API Key ile authentication');
    }
    
    console.log('📤 Request Headers:', requestOptions.headers);

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
      console.log('📤 Request body length:', JSON.stringify(body).length);
    }

    console.log('📡 Fetching:', apiUrl);
    
    // Timeout ile fetch işlemi
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 saniye timeout
    
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
        console.log('✅ API Response parsed successfully');
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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'X-Cache': 'MISS'
        },
        body: JSON.stringify(responseData),
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('⏰ Request timeout after 25 seconds');
        return {
          statusCode: 408,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: 'Request Timeout',
            message: 'API request timed out after 25 seconds'
          }),
        };
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('🚨 Proxy Function Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack
      }),
    };
  }
}; 