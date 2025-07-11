// Netlify Functions - API Proxy (DÜZELTME)
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Body parsing - DÜZELTME
    let requestData;
    try {
      requestData = event.body ? JSON.parse(event.body) : {};
    } catch (parseError) {
      console.error('❌ Body parse hatası:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
      };
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
      console.log('📤 Request body:', fetchOptions.body);
    }

    console.log('📡 Fetching:', apiUrl);
    const response = await fetch(apiUrl, fetchOptions);
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ Response JSON parse hatası:', jsonError);
      const textResponse = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON response from API',
          statusCode: response.status,
          textResponse: textResponse.substring(0, 500) // İlk 500 karakter
        }),
      };
    }

    console.log('✅ API Response:', data);

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
        stack: error.stack,
        message: 'Netlify Function proxy error'
      }),
    };
  }
}; 