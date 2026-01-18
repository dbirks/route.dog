# Testing Tasks for Route.dog

## Completed ✅
- Deployed API to Cloudflare Workers (production): https://route-dog-prod.pig.workers.dev
- Deployed UI to Cloudflare Pages: https://11e4812e.route-dog.pages.dev
- Collected sample address test data
- **Created automated browser tests with Puppeteer** (test-browser.mjs, test-e2e-full.mjs)
- **Verified UI loads correctly** - all critical elements present
- **Tested API endpoints** - health check and geocoding working
- **Generated test image with addresses** - ready for manual upload testing

## Pending Testing Tasks

### 1. Create Test Images with Delivery Addresses
**Priority**: High
**Description**: Collect or generate test images containing delivery addresses for testing the OCR/vision parsing functionality.

**Requirements**:
- Need variety of image types:
  - Clear typed text (easiest)
  - Handwritten addresses (medium difficulty)
  - PDF exports with addresses (common use case)
  - Photos of delivery lists (real-world scenario)

**Resources Found**:
- Sample addresses available in `test-data/sample-addresses.txt`
- Public datasets:
  - [geocommons address-sample.csv](https://github.com/geocommons/geocoder/blob/master/test/data/address-sample.csv)
  - [Texas A&M Geocoding Sample Data](https://geoservices.tamu.edu/services/geocode/batchprocess/sampledata.aspx)
  - [OpenAddresses](https://openaddresses.io/)
  - [OCR Test Images](http://www.mattmahoney.net/ocr/)
  - [ABBYY Cloud OCR Sample Images](https://support.abbyy.com/hc/en-us/articles/360017270120-Sample-images)

### 2. Set Up Chrome DevTools Integration Testing
**Priority**: High
**Description**: Configure Chrome DevTools MCP server to run in headless mode for automated UI testing.

**Test Workflow**:
1. Upload image with addresses
2. Extract addresses using OpenAI Vision
3. Geocode addresses using Census API
4. Display addresses on map
5. Optimize delivery route

**Current Blocker**: Chrome DevTools MCP requires X server configuration for headless mode

### 3. Create End-to-End Tests
**Priority**: High
**Description**: Implement automated tests that upload test images, verify address extraction, and validate geocoding results.

**Test Cases Needed**:
- Happy path: Clear image with valid US addresses
- Error handling: Invalid image format
- Error handling: Image with no addresses
- Error handling: Addresses that can't be geocoded
- Edge cases: Partial addresses, international addresses, PO boxes

### 4. API Integration Tests
**Priority**: Medium
**Description**: Test API endpoints independently

**Test Coverage**:
- `POST /v1/addresses` - Extract and geocode addresses from image
- `PUT /v1/geocode-address` - Geocode single address
- `GET /health` - Health check
- CORS headers verification
- Error responses (400, 500)

### 5. UI Component Tests
**Priority**: Low
**Description**: Test React components in isolation

**Components to Test**:
- AddressListPanel
- AddressItem
- EditAddressDialog
- ImageUpload
- MapView
- ModeToggle
- PastRoutesDialog

## Manual Testing

### Quick API Test
```bash
# Run automated API tests
./test-manual.sh

# Or manually:
# Health check
curl https://route-dog-prod.pig.workers.dev/health

# Test geocoding single address
curl -X PUT https://route-dog-prod.pig.workers.dev/v1/geocode-address \
  -H "Content-Type: application/json" \
  -d '{"address": "1600 Amphitheatre Parkway, Mountain View, CA 94043"}'
```

### Automated Browser Tests
```bash
# Run simple browser test
node test-browser.mjs

# Run comprehensive E2E test
node test-e2e-full.mjs
```

**Test Results** (as of 2026-01-18):
- ✅ UI loads correctly
- ✅ Upload button is present
- ✅ API health check passes
- ✅ Geocoding works correctly
- ✅ No browser console errors
- 📸 Screenshots saved: test-screenshot.png, test-final.png, test-addresses-image.png

### Test Image Upload
1. Visit https://11e4812e.route-dog.pages.dev
2. Click upload button
3. Upload test image with addresses
4. Verify addresses are extracted and displayed
5. Verify map shows markers for addresses
6. Check that route optimization works
