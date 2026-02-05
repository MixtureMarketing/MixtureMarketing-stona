/**
 * Test script for Cloudflare Pages Functions
 * Run this after starting 'npx wrangler pages dev'
 */
const http = require('http');

const testLead = {
    action: 'create',
    source_url: 'http://localhost:8888/test',
    lead: {
        id: 'test-uuid-' + Date.now(),
        name: 'Tester Cloudflare',
        email: 'test@mixturemarketing.pl',
        phone: '123456789',
        service_interest: 'web'
    }
};

console.log('🚀 Sending test lead to local Cloudflare API...');

const req = http.request({
    hostname: 'localhost',
    port: 8888, // Default wrangler port
    path: '/api/contact_submit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        if (res.statusCode === 200) {
            console.log('✅ SUCCESS: API responded correctly!');
        } else {
            console.log('❌ FAILED: Check wrangler logs for errors.');
        }
    });
});

req.on('error', (err) => {
    console.error('❌ Error: Could not connect to local server. Make sure "npx wrangler pages dev" is running.');
});

req.write(JSON.stringify(testLead));
req.end();
