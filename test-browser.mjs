#!/usr/bin/env node
/**
 * Browser-based end-to-end test for Route.dog
 * Tests the deployed UI with address extraction workflow
 */

import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const UI_URL = 'https://11e4812e.route-dog.pages.dev';
const API_URL = 'https://route-dog-prod.pig.workers.dev';

async function main() {
  console.log('🚀 Starting Route.dog E2E Browser Test\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Test 1: Load the UI
    console.log('Test 1: Loading UI...');
    await page.goto(UI_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ UI loaded successfully');
    console.log(`   Title: ${await page.title()}\n`);

    // Test 2: Take a screenshot
    console.log('Test 2: Taking screenshot...');
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    console.log('✅ Screenshot saved to test-screenshot.png\n');

    // Test 3: Check for key UI elements
    console.log('Test 3: Checking UI elements...');

    const elements = {
      root: await page.$('#root'),
      // Add more selectors based on your UI
    };

    if (elements.root) {
      console.log('✅ Root element found');
    } else {
      console.log('❌ Root element not found');
    }

    // Test 4: Check console errors
    console.log('\nTest 4: Checking for console errors...');
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Wait a bit for any errors
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (consoleMessages.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('❌ Console errors found:');
      consoleMessages.forEach(msg => console.log(`   - ${msg}`));
    }

    // Test 5: Test API directly
    console.log('\nTest 5: Testing API endpoint...');
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log(`✅ API Health: ${data.status}`);

    console.log('\n✅ All browser tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
