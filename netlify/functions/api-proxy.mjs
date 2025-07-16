// Netlify Functions - API Proxy (ES MODULES)
export const handler = async (event, context) => {
  console.log('📡 Netlify Function başlatıldı');
  
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { path, method = 'GET', body, apiKey: bodyApiKey } = JSON.parse(event.body);
    
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
    const apiUrl = `https://rare-courage-production.up.railway.app${path}`;
    
    // API Key - body'den veya header'dan al
    const apiKey = bodyApiKey || event.headers['x-hzm-api-key'] || 'hzm_1ce98c92189d4a109cd604b22bfd86b7';
    
    console.log('🔄 Proxy Request Details:', {
      apiUrl,
      method,
      hasBody: !!body,
      apiKey: apiKey ? 'PRESENT' : 'MISSING',
      apiKeyFirst10: apiKey ? apiKey.substring(0, 10) : 'NONE'
    });

    // Prepare request options
    const requestOptions = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
    };
    
    console.log('📤 Request Headers:', requestOptions.headers);

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
      console.log('📤 Request body length:', JSON.stringify(body).length);
    }

    console.log('📡 Fetching:', apiUrl);
    
    const response = await fetch(apiUrl, requestOptions);
    
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

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify(responseData),
    };

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