// Netlify Functions - API Proxy
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
    const { path, method = 'GET', body, apiKey } = JSON.parse(event.body || '{}');
    
    const apiUrl = `https://hzmbackandveritabani-production-c660.up.railway.app${path}`;
    
    console.log('Proxy Request:', { apiUrl, method });

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || 'hzm_1ce98c92189d4a109cd604b22bfd86b7',
      },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(apiUrl, fetchOptions);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Proxy error occurred'
      }),
    };
  }
}; 