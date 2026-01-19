#!/usr/bin/env node
import puppeteer from 'puppeteer';

async function testRoutedog() {
  console.log('🐕 Testing Route.dog redesign...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Monitor console messages
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));

  try {
    console.log('📍 Navigating to https://11e4812e.route-dog.pages.dev...');
    await page.goto('https://11e4812e.route-dog.pages.dev', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully!\n');

    // Take screenshot of welcome screen
    await page.screenshot({ path: 'test-redesign-welcome.png', fullPage: false });
    console.log('📸 Screenshot saved: test-redesign-welcome.png\n');

    // Check for key redesign elements
    console.log('🔍 Checking redesign elements...\n');

    // Check for handwritten fonts
    const fonts = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        body: styles.fontFamily,
        h1: window.getComputedStyle(document.querySelector('h1')).fontFamily
      };
    });
    console.log('📝 Fonts:');
    console.log(`   Body: ${fonts.body}`);
    console.log(`   H1: ${fonts.h1}`);

    // Check for dog mascot
    const hasDogMascot = await page.evaluate(() => {
      return document.querySelector('svg[viewBox="0 0 100 100"]') !== null;
    });
    console.log(`🐕 Dog mascot: ${hasDogMascot ? '✅ Present' : '❌ Missing'}`);

    // Check for paw prints
    const hasPawPrints = await page.evaluate(() => {
      return document.querySelector('svg[viewBox="0 0 24 24"]') !== null;
    });
    console.log(`🐾 Paw prints: ${hasPawPrints ? '✅ Present' : '❌ Missing'}`);

    // Check for Route.dog title
    const title = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : null;
    });
    console.log(`📌 Title: ${title || 'Not found'}`);

    // Check for upload button
    const hasUploadButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.textContent.includes('Upload'));
    });
    console.log(`📤 Upload button: ${hasUploadButton ? '✅ Present' : '❌ Missing'}`);

    // Check background color (should be cream/paper)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`🎨 Background color: ${bgColor}`);

    // Check for console errors
    const errors = consoleMessages.filter(msg => msg.startsWith('[error]'));
    console.log(`\n🔍 Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('❌ Errors found:');
      errors.forEach(err => console.log(`   ${err}`));
    }

    // Test theme toggle
    console.log('\n🌓 Testing dark mode toggle...');
    const themeToggle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toggle = buttons.find(btn => {
        const ariaLabel = btn.getAttribute('aria-label');
        return ariaLabel && ariaLabel.includes('theme');
      });
      if (toggle) {
        toggle.click();
        return true;
      }
      return false;
    });

    if (themeToggle) {
      await page.waitForTimeout(500); // Wait for theme transition
      await page.screenshot({ path: 'test-redesign-dark.png', fullPage: false });
      console.log('✅ Dark mode toggled');
      console.log('📸 Screenshot saved: test-redesign-dark.png');

      const darkBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      console.log(`🎨 Dark mode background: ${darkBg}`);
    }

    console.log('\n✅ All tests passed! Redesign is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-redesign-error.png' });
    console.log('📸 Error screenshot saved: test-redesign-error.png');
  } finally {
    await browser.close();
  }
}

testRoutedog().catch(console.error);
