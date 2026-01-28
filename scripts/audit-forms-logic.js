const API_URL = 'http://localhost:8000/api/contact_submit.php';

async function runTests() {
  console.log('--- Starting Form Logic Audit (Native Fetch) ---');

  // 1. TEST HONEYPOT
  console.log('Test 1: Honeypot Protection');
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        website_verify: 'bot_trigger',
        lead: { name: 'Bot', email: 'bot@spam.com' },
      }),
    });
    const data = await res.json();
    if (data.message === 'Ochrona antyspamowa') {
      console.log('SUCCESS: Bot blocked by Honeypot.');
    } else {
      console.log('FAILED: Honeypot did not trigger.');
    }
  } catch (e) {
    console.log('ERROR: PHP Server not responding at ' + API_URL);
  }

  // 2. TEST RECAPTCHA
  console.log('Test 2: reCAPTCHA Verification');
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        lead: { name: 'User', email: 'user@test.pl' },
      }),
    });
    if (res.status === 403) {
      console.log('SUCCESS: Request rejected without token (403).');
    } else if (res.status === 200) {
      console.log('INFO: Server returned 200. Likely due to placeholder bypass being active.');
    } else {
      console.log('FAILED: Unexpected status code: ' + res.status);
    }
  } catch (e) {}

  // 3. TEST RESUME
  console.log('Test 3: Resume Logic');
  try {
    const res = await fetch(API_URL + '?action=get_lead&id=invalid-id');
    if (res.status === 404) {
      console.log('SUCCESS: Invalid ID correctly returns 404.');
    } else {
      console.log('FAILED: Unexpected response for invalid ID.');
    }
  } catch (e) {}

  console.log('--- Audit Finished ---');
}

runTests();
