# Test the addresses API endpoint
# Run with: hurl --test test/addresses.hurl
# Or with variables: hurl --variable host=localhost:8080 --test test/addresses.hurl

# Test successful address parsing (with dummy image)
POST {{host}}/v1/addresses
Content-Type: application/json
{
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
}

HTTP 200
[Asserts]
jsonpath "$.addresses" exists
jsonpath "$.addresses" isCollection

# Test missing image field
POST {{host}}/v1/addresses
Content-Type: application/json
{
    "image": ""
}

HTTP 400
[Asserts]
jsonpath "$.error" == "Image is required"

# Test invalid JSON
POST {{host}}/v1/addresses
Content-Type: application/json
{
    "image": invalid json
}

HTTP 400
[Asserts]
jsonpath "$.error" == "Invalid JSON payload"

# Test CORS preflight request
OPTIONS {{host}}/v1/addresses
Origin: http://localhost:3000

HTTP 200
[Asserts]
header "Access-Control-Allow-Origin" == "*"
header "Access-Control-Allow-Methods" contains "POST"
header "Access-Control-Allow-Headers" contains "Content-Type"

# Health check - ensure server is running
# (This is a simple test to verify the server responds)
POST {{host}}/v1/addresses
Content-Type: application/json
{
    "image": "test"
}

# Should return 500 or 400 depending on OpenAI API availability
# but server should respond (not connection refused)
HTTP *
[Asserts]
status >= 400
status < 600