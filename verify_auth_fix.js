const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 8080;

function request(method, path, body, cookies = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000',
            },
        };

        if (cookies) {
            options.headers['Cookie'] = cookies;
        }

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data ? JSON.parse(data) : null,
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function verify() {
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;
    const password = 'password123';
    const name = `Test User ${timestamp}`;

    console.log(`1. Signing up user: ${email}`);
    const signupRes = await request('POST', '/api/auth/signup', JSON.stringify({
        email,
        password,
        name
    }));

    if (signupRes.statusCode !== 200) {
        console.error('Signup failed:', signupRes.statusCode, signupRes.data);
        process.exit(1);
    }

    let cookies = signupRes.headers['set-cookie'];
    if (!cookies) {
        const loginRes = await request('POST', '/api/auth/login', JSON.stringify({
            email,
            password
        }));
        cookies = loginRes.headers['set-cookie'];
    }

    if (!cookies) {
        console.error('No cookies obtained');
        process.exit(1);
    }

    const cookieString = cookies
        .map(c => c.split(';')[0])
        .filter(c => c.startsWith('auth_token='))
        .join('; ');

    console.log('2. Accessing /api/auth/me');
    const meRes = await request('GET', '/api/auth/me', null, cookieString);
    if (meRes.statusCode !== 200) {
        console.error('/me failed', meRes.statusCode);
        process.exit(1);
    }
    console.log('/me success', meRes.data);

    console.log('3. Attempting to add product');
    const productPayload = JSON.stringify({
        name: `Test Product ${timestamp}`,
        price: 100.0,
        image: 'http://example.com/image.png',
        category: 'GENERAL',
        shortDescription: 'Short desc',
        fullDescription: 'Full desc'
    });

    const productRes = await request('POST', '/api/products', productPayload, cookieString);
    console.log('Add Product Status:', productRes.statusCode);
    if (productRes.statusCode === 200) {
        console.log('SUCCESS: Product added.');
        console.log('Response:', productRes.data);
    } else {
        console.error('FAILURE: Failed to add product.');
        console.error('Response:', productRes.data);
    }
}

verify().catch(console.error);
