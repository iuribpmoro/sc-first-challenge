const axios = require('axios');
const qs = require('qs');

async function validateSolution() {
    try {
        const serverUrl = 'http://localhost:3000';
        const axiosInstance = axios.create({ baseURL: serverUrl });

        // Login
        console.log('[Login]');
        const loginPayload = { email: 'bob@example.com', password: 'password2' };
        const loginResponse = await axiosInstance.post('/login', qs.stringify(loginPayload), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        // console.log(loginResponse.request.path);
        const userPath = loginResponse.request.path;

        if (loginResponse.data.includes('User Profile')) {
            console.log('Login successful');
        } else {
            console.log('Login failed');
            return;
        }
        const userCookies = loginResponse.headers['set-cookie'];

        // XSS vulnerability validation
        console.log('\n[XSS Validation]');
        const xssPayload = '<script>alert("XSS vulnerability");</script>';
        const commentPayload = { comment: xssPayload };
        const xssResponse = await axiosInstance.post('/comments', commentPayload, { headers: { Cookie: userCookies } });
        if (xssResponse.status !== 200) {
            console.log('XSS vulnerability successfully fixed');
        } else {
            console.log('XSS vulnerability still present');
        }

        // Broken Access Control vulnerability validation
        console.log('\n[Broken Access Control Validation]');
        const profileResponse = await axiosInstance.get(userPath);
        if (profileResponse.data.includes('User not found')) {
            console.log('Broken Access Control vulnerability successfully fixed');
        } else {
            console.log('Broken Access Control vulnerability still present');
        }

        // IDOR vulnerability validation
        console.log('\n[IDOR Validation]');
        const userId = userPath.split('/user/')[1];
        //If userId is int IDOR is still present
        if (isNaN(userId)) {
            console.log('IDOR vulnerability successfully fixed');
        } else {
            console.log('IDOR vulnerability still present');
        }

    } catch (error) {
        console.error('Error occurred during validation:', error.message);
    }
}

validateSolution();
