import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4174; // Different port to avoid conflict with other tests
const URL = `http://localhost:${PORT}/contact/`; // Corrected URL with trailing slash

async function runTest() {
  console.log('🚀 Starting E2E Contact Form Test...');

  // 1. Start Server
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 5000));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // Set to false to see it running
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Log browser console
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    // Set user agent to avoid being detected as 'Headless'
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 1.5 Mock API requests since preview server doesn't run PHP
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().includes('/api/contact_submit.php')) {
            console.log(`💉 Mocking API request: ${request.method()} ${request.url()}`);
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, lead: { id: 'test-uuid-123' }, message: 'Mocked Success' })
            });
        } else {
            request.continue();
        }
    });

    // Set viewport to desktop
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`🌐 Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle0' });

    // 2. Open Modal
    console.log('🖱️ Clicking CTA button...');
    try {
        // Use a more robust selector for the button
        await page.waitForSelector('button', { visible: true });
        const ctaButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(b => b.innerText.includes('Wypełnij Brief Online'));
        });

        if (!ctaButton || !ctaButton.asElement()) throw new Error('CTA Button not found');
        await ctaButton.asElement().click();
    } catch (e) {
        console.error('❌ Could not find CTA button. Page text dump:');
        const text = await page.evaluate(() => document.body.innerText);
        console.log(text.substring(0, 1000) + '...');
        throw e;
    }

    console.log('✅ CTA Button clicked. Waiting for modal...');

    // Wait for Modal Title
    try {
        await page.waitForFunction(
            () => document.body.innerText.includes('Rozpocznijmy współpracę'),
            { timeout: 5000 }
        );
        console.log('✅ Modal opened.');
    } catch (e) {
        console.error('❌ Modal did not open or title not found.');
        throw e;
    }

    // 3. Step 1: Contact Details
    console.log('📝 Filling Step 1 (Contact Info)...');
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Test Automatyczny');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '123456789');
    
    // Click Privacy Checkbox
    await page.evaluate(() => {
        const checkbox = document.querySelector('input[name="privacy"]');
        if (checkbox) {
            checkbox.click();
            // Force change event if needed
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    // Click Next
    console.log('🖱️ Clicking Next (Step 1)...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(b => b.innerText.includes('Zapisz i przejdź dalej'));
        if (nextBtn) nextBtn.click();
        else throw new Error('Next button Step 1 not found');
    });

    // 4. Step 2: Project Details
    console.log('📝 Filling Step 2 (Project Details)...');
    // Wait for transition or modal title change
    await new Promise(r => setTimeout(r, 2000));
    
    // Determine if we have selects (web/marketing) or input (general)
    const hasSelects = await page.evaluate(() => !!document.querySelector('select[name="projectType"]'));
    
    if (hasSelects) {
        console.log('📊 Filling selects (ProjectType/Budget)...');
        await page.select('select[name="projectType"]', 'corporate');
        await page.select('select[name="budget"]', 'mid');
    } else {
        console.log('🌐 Filling website input (General flow)...');
        const websiteInput = await page.$('input[name="website"]');
        if (websiteInput) {
            await websiteInput.type('https://example.com');
        }
    }

    // Click Next
    console.log('🖱️ Clicking Next (Step 2)...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(b => b.innerText.includes('Dalej'));
        if (nextBtn) nextBtn.click();
        else {
            // Check if we are still on Step 1 (error occurred?)
            const step1Btn = buttons.find(b => b.innerText.includes('Zapisz i przejdź dalej'));
            if (step1Btn) throw new Error('Still on Step 1 - validation or API error?');
            throw new Error('Next button Step 2 not found');
        }
    });

    // 5. Step 3: Message
    console.log('📝 Filling Step 3 (Message)...');
    await new Promise(r => setTimeout(r, 2000));
    
    await page.waitForSelector('textarea[name="message"]');
    await page.type('textarea[name="message"]', 'To jest automatyczny test E2E. Proszę zignorować.');

    // Submit
    console.log('🚀 Submitting form...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(b => b.innerText.includes('Wyślij zgłoszenie'));
        if (submitBtn) submitBtn.click();
        else throw new Error('Submit button not found');
    });

    // 6. Verify Success
    console.log('✅ Verifying success...');
    try {
        await page.waitForFunction(
            () => document.body.innerText.includes('Zgłoszenie wysłane!'),
            { timeout: 10000 }
        );
        console.log('🎉 Test Passed: Contact form works!');
    } catch (e) {
        console.error('❌ Success message not found.');
        const text = await page.evaluate(() => document.body.innerText);
        console.log('Final Page Text:', text.substring(0, 1000));
        throw e;
    }

  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (server.pid) {
        try {
            process.kill(-server.pid, 'SIGTERM');
        } catch (e) {
            server.kill();
        }
    }
  }
}

runTest();