const http = require('http');

console.log('Testing API connection...');
http.get('http://localhost:3001/api/test', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response data:', data);
    console.log('API connection successful!');
  });
}).on('error', (err) => {
  console.error('Error connecting to API:', err.message);
  console.log('Please make sure the server is running on port 3001');
  console.log('Try running: node server.js');
});
