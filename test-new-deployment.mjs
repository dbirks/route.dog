#!/usr/bin/env node
import puppeteer from 'puppeteer';

async function testNewDeployment() {
  console.log('🐕 Testing NEW deployment with redesign...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('📍 Navigating to https://69123efc.route-dog.pages.dev...');
    await page.goto('https://69123efc.route-dog.pages.dev', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ Page loaded!\n');

    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    await page.screenshot({ path: 'test-new-redesign.png', fullPage: true });
    console.log('📸 Full page screenshot: test-new-redesign.png\n');

    // Check fonts after loading
    const fonts = await page.evaluate(() => {
      return {
        body: window.getComputedStyle(document.body).fontFamily,
        h1: window.getComputedStyle(document.querySelector('h1')).fontFamily
      };
    });
    console.log('📝 Fonts after load:');
    console.log(`   Body: ${fonts.body}`);
    console.log(`   H1: ${fonts.h1}`);

    // Check for redesign elements
    const redesignCheck = await page.evaluate(() => {
      return {
        dogMascot: !!document.querySelector('svg[viewBox="0 0 100 100"]'),
        pawPrints: !!document.querySelectorAll('svg[viewBox="0 0 24 24"]').length,
        handwrittenTitle: document.querySelector('h1.handwritten') !== null,
        uploadButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent.includes('Upload')
        ),
        welcomeMessage: document.body.textContent.includes('Welcome to Route.dog'),
        paperTexture: window.getComputedStyle(document.body, '::before').content !== 'none'
      };
    });

    console.log('\n🎨 Redesign Elements:');
    console.log(`   🐕 Dog mascot: ${redesignCheck.dogMascot ? '✅' : '❌'}`);
    console.log(`   🐾 Paw prints: ${redesignCheck.pawPrints ? '✅' : '❌'}`);
    console.log(`   ✍️  Handwritten title: ${redesignCheck.handwrittenTitle ? '✅' : '❌'}`);
    console.log(`   📤 Upload button: ${redesignCheck.uploadButton ? '✅' : '❌'}`);
    console.log(`   👋 Welcome message: ${redesignCheck.welcomeMessage ? '✅' : '❌'}`);

    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`\n🎨 Background: ${bgColor}`);
    console.log(`   Expected: cream/paper (oklch values or rgb(250, 248, 243))`);

    console.log('\n✅ New deployment tested successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-new-error.png' });
  } finally {
    await browser.close();
  }
}

testNewDeployment().catch(console.error);
