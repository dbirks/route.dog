#!/bin/bash
# Manual testing script for Route.dog API

set -e

API_URL="https://route-dog-prod.pig.workers.dev"

echo "=== Route.dog API Manual Tests ==="
echo ""

# Test 1: Health check
echo "Test 1: Health Check"
echo "curl -s $API_URL/health"
response=$(curl -s "$API_URL/health")
echo "Response: $response"
echo ""

# Test 2: Geocode single address
echo "Test 2: Geocode Single Address"
echo "Address: 1600 Amphitheatre Parkway, Mountain View, CA 94043"
response=$(curl -s -X PUT "$API_URL/v1/geocode-address" \
  -H "Content-Type: application/json" \
  -d '{"address":"1600 Amphitheatre Parkway, Mountain View, CA 94043"}')
echo "Response: $response"
echo ""

# Test 3: Test multiple addresses
echo "Test 3: Multiple Address Geocoding"
addresses=(
  "93 NORTH 9TH STREET, BROOKLYN NY 11211"
  "380 WESTMINSTER ST, PROVIDENCE RI 02903"
  "177 MAIN STREET, LITTLETON NH 03561"
)

for addr in "${addresses[@]}"; do
  echo "Testing: $addr"
  response=$(curl -s -X PUT "$API_URL/v1/geocode-address" \
    -H "Content-Type: application/json" \
    -d "{\"address\":\"$addr\"}")
  echo "Response: $response"
  echo ""
done

echo "=== All tests completed ==="
