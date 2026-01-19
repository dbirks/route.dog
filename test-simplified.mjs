#!/usr/bin/env node
import puppeteer from 'puppeteer';

async function testSimplified() {
  console.log('🧪 Testing updated design (no cursive, street map, geolocator)...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Monitor console for errors
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));

  try {
    console.log('📍 Loading https://f412b6e7.route-dog.pages.dev...\n');
    await page.goto('https://f412b6e7.route-dog.pages.dev', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✅ Page loaded\n');

    // Take initial screenshot
    await page.screenshot({ path: '../test-updated-1-initial.png' });
    console.log('📸 Initial screenshot saved\n');

    // Check for design elements
    const designCheck = await page.evaluate(() => {
      const logo = document.querySelector('.logo-sketch');
      return {
        title: document.querySelector('h1')?.textContent,
        hasLogo: logo !== null,
        logoFont: logo ? window.getComputedStyle(logo).fontFamily : 'none',
        demoButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent.includes('Demo')
        ),
        uploadButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent.includes('Upload')
        ),
        fonts: {
          body: window.getComputedStyle(document.body).fontFamily
        },
        // Check for geolocator control button
        hasGeolocator: document.querySelector('.maplibregl-ctrl-geolocate') !== null
      };
    });

    console.log('🎨 Design Elements:');
    console.log(`   Title: ${designCheck.title}`);
    console.log(`   Logo class: ${designCheck.hasLogo ? '✅' : '❌'}`);
    console.log(`   Logo font: ${designCheck.logoFont}`);
    console.log(`   Demo button: ${designCheck.demoButton ? '✅' : '❌'}`);
    console.log(`   Upload button: ${designCheck.uploadButton ? '✅' : '❌'}`);
    console.log(`   Geolocator control: ${designCheck.hasGeolocator ? '✅' : '❌'}`);
    console.log(`   Body font: ${designCheck.fonts.body}`);

    // Click the demo button
    console.log('\n🎯 Clicking Demo button...');
    const demoClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(btn => btn.textContent.includes('Demo'));
      if (demoBtn) {
        demoBtn.click();
        return true;
      }
      return false;
    });

    if (!demoClicked) {
      console.log('❌ Could not find Demo button');
      await browser.close();
      return;
    }

    // Wait for addresses to load and panel to open
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot after clicking demo
    await page.screenshot({ path: '../test-updated-2-demo.png', fullPage: true });
    console.log('📸 Demo screenshot saved\n');

    // Check if addresses loaded
    const afterDemo = await page.evaluate(() => {
      const addressPanel = document.querySelector('[role="dialog"]');
      const hasPanel = addressPanel !== null;

      // Check for map markers
      const mapContainer = document.querySelector('[class*="maplibre"]') ||
                          document.querySelector('canvas');

      return {
        hasPanel,
        hasMap: mapContainer !== null,
        panelVisible: hasPanel && window.getComputedStyle(addressPanel).display !== 'none',
        addressCount: document.body.textContent.match(/\d+ stop/)?.[0] || 'not found'
      };
    });

    console.log('📊 After Demo Click:');
    console.log(`   Address panel: ${afterDemo.hasPanel ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Panel visible: ${afterDemo.panelVisible ? '✅ Yes' : '❌ No'}`);
    console.log(`   Map element: ${afterDemo.hasMap ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Address count: ${afterDemo.addressCount}`);

    // Check console for errors
    const errors = consoleMessages.filter(msg => msg.startsWith('[error]'));
    console.log(`\n🔍 Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('❌ Errors found:');
      errors.forEach(err => console.log(`   ${err}`));
    }

    if (afterDemo.hasPanel && afterDemo.hasMap) {
      console.log('\n✅ SUCCESS: Demo button works! Addresses loaded and map is present.');
    } else {
      console.log('\n⚠️  Demo loaded but some elements missing. Check screenshots.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '../test-updated-error.png' });
  } finally {
    await browser.close();
  }
}

testSimplified().catch(console.error);
