// Netlify Functions - API Proxy (ES MODULES)
export const handler = async (event, context) => {
  // İzin verilen domain'ler
  const allowedOrigins = [
    'https://vardiyaasistani.netlify.app',
    'https://vardiyaasistani.netlify.app/',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8888',
    'https://localhost:8888'
  ];
  
  const origin = event.headers?.origin || event.headers?.Origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    console.log('📡 Netlify Function başlatıldı');
    console.log('Event method:', event.httpMethod);
    console.log('Event headers:', event.headers);
    console.log('Event body:', event.body);
    console.log('🌐 Origin:', origin);
    console.log('✅ Allowed Origin:', allowedOrigin);
    
    // Body parsing
    let requestData = {};
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (parseError) {
        console.error('❌ Body parse hatası:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid JSON in request body',
            details: parseError.message,
            receivedBody: event.body?.substring(0, 200)
          }),
        };
      }
    }

    const { path, method = 'GET', body, apiKey } = requestData;
    
    if (!path) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Path parameter is required',
          received: requestData
        }),
      };
    }
    
    const apiUrl = `https://hzmbackandveritabani-production-c660.up.railway.app${path}`;
    
    console.log('🔄 Proxy Request Details:', { 
      apiUrl, 
      method, 
      hasBody: !!body,
      apiKey: apiKey ? 'PRESENT' : 'MISSING'
    });

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
      },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      console.log('📤 Request body length:', fetchOptions.body.length);
    }

    console.log('📡 Fetching:', apiUrl);
    
    // Modern fetch() kullan
    const response = await fetch(apiUrl, fetchOptions);
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);
    
    // Response body'yi bir kez al
    const responseText = await response.text();
    console.log('📨 Response text length:', responseText.length);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('❌ Response JSON parse hatası:', jsonError);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON response from API',
          statusCode: response.status,
          textResponse: responseText.substring(0, 300),
          parseError: jsonError.message
        }),
      };
    }

    console.log('✅ API Response parsed successfully');

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('🚨 Proxy Function Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        type: error.constructor.name,
        message: 'Netlify Function proxy error',
        nodeVersion: process.version
      }),
    };
  }
}; 