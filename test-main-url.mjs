#!/usr/bin/env node
import puppeteer from 'puppeteer';

async function testMainURL() {
  console.log('🔍 Testing main production URL...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to https://route-dog.pages.dev...');
    await page.goto('https://route-dog.pages.dev', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ Page loaded!\n');

    // Wait for fonts
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    await page.screenshot({ path: '../test-main-url.png', fullPage: true });
    console.log('📸 Screenshot saved: test-main-url.png\n');

    // Check for redesign
    const redesignCheck = await page.evaluate(() => {
      return {
        dogMascot: !!document.querySelector('svg[viewBox="0 0 100 100"]'),
        handwrittenTitle: !!document.querySelector('h1.handwritten'),
        fonts: {
          body: window.getComputedStyle(document.body).fontFamily,
          h1: window.getComputedStyle(document.querySelector('h1')).fontFamily
        },
        bgColor: window.getComputedStyle(document.body).backgroundColor,
        title: document.querySelector('h1')?.textContent
      };
    });

    console.log('🎨 Redesign Check:');
    console.log(`   🐕 Dog mascot: ${redesignCheck.dogMascot ? '✅ YES!' : '❌ Not yet'}`);
    console.log(`   ✍️  Handwritten title: ${redesignCheck.handwrittenTitle ? '✅ YES!' : '❌ Not yet'}`);
    console.log(`   📝 Body font: ${redesignCheck.fonts.body}`);
    console.log(`   📝 H1 font: ${redesignCheck.fonts.h1}`);
    console.log(`   🎨 Background: ${redesignCheck.bgColor}`);
    console.log(`   📌 Title: ${redesignCheck.title}`);

    if (redesignCheck.dogMascot && redesignCheck.handwrittenTitle) {
      console.log('\n🎉 REDESIGN IS LIVE ON MAIN URL!');
    } else {
      console.log('\n⏳ Old version still showing (may need cache clear)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testMainURL().catch(console.error);
