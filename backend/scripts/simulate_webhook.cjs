const crypto = require('crypto');
const http = require('http');

const secretKey = 'sk_test_6a742379ef0b93583a2244e00c2d9a8ee554b6ce';
const payload = JSON.stringify({
  event: 'charge.success',
  data: {
    reference: '4b73a2f1-4e68-4ddc-a2ad-76eaf7c136e9',
    id: 123456,
    amount: 5000000,
    currency: 'NGN'
  }
});

const signature = crypto
  .createHmac('sha512', secretKey)
  .update(payload)
  .digest('hex');

console.log('Generated Signature:', signature);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/academy/payments/webhook/paystack',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-paystack-signature': signature,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', chunk => console.log(`BODY: ${chunk}`));
});

req.on('error', e => console.error(`Problem with request: ${e.message}`));
req.write(payload);
req.end();
