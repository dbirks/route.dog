# Route.dog API

A Go API service that extracts delivery addresses from images using OpenAI Vision and geocodes them using the US Census API.

## Features

- Extract addresses from images using OpenAI GPT-4o Vision
- Geocode addresses using the free US Census Geocoding API
- RESTful API with proper error handling
- CORS support for frontend integration
- Comprehensive testing with both Go tests and Hurl

## Project Structure

```
api/
├── cmd/server/          # Application entry point
├── internal/
│   ├── handler/         # HTTP request handlers
│   ├── model/           # Data models and structs
│   └── service/         # Business logic services
├── test/                # Integration tests
│   ├── integration_test.go  # Go httptest integration tests
│   └── addresses.hurl       # Hurl API tests
├── .env.example         # Environment variables template
└── README.md
```

## Setup

1. **Install dependencies:**
   ```bash
   go mod tidy
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run the server:**
   ```bash
   go run cmd/server/main.go
   ```

   Server will start on `http://localhost:8080`

## API Endpoints

### POST /v1/addresses

Extract and geocode addresses from an image.

**Request:**
```json
{
    "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
    "addresses": [
        {
            "original": "123 Main St, Springfield, IL",
            "standardized": "123 MAIN ST, SPRINGFIELD IL 62701",
            "latitude": 39.123456,
            "longitude": -89.654321
        }
    ]
}
```

**Error Response:**
```json
{
    "error": "Error message"
}
```

## Testing

### Go Integration Tests (httptest)

Run the Go integration tests:

```bash
# Run all tests
go test ./test/...

# Run with verbose output
go test -v ./test/...

# Run specific test
go test -v ./test/ -run TestParseAddresses_Success
```

**Pros of httptest:**
- ✅ Fast in-memory testing
- ✅ Precise control and mocking
- ✅ Integrated with Go toolchain
- ✅ No external dependencies

### Hurl API Tests

First, install Hurl:
```bash
# macOS
brew install hurl

# Ubuntu/Debian
curl --location --remote-name https://github.com/Orange-OpenSource/hurl/releases/latest/download/hurl_4.3.0_amd64.deb
sudo dpkg -i hurl_4.3.0_amd64.deb

# Or download binary from: https://github.com/Orange-OpenSource/hurl/releases
```

**Running Hurl Tests (Multiple Environment Support):**

```bash
# Option 1: Using environment files (recommended)
# Local development
hurl --variables-file test/environments/local.env --test test/addresses.hurl

# Staging environment
hurl --variables-file test/environments/staging.env --test test/addresses.hurl

# Production environment  
hurl --variables-file test/environments/production.env --test test/addresses.hurl

# Option 2: Using command line variables
hurl --variable host=http://localhost:8080 --test test/addresses.hurl
hurl --variable host=https://staging-api.route.dog --test test/addresses.hurl

# Option 3: Default local testing (requires server running)
hurl --variable host=http://localhost:8080 --test test/addresses.hurl

# Generate HTML report
hurl --variables-file test/environments/local.env --test --report-html test-results test/addresses.hurl

# Verbose output for debugging
hurl --variables-file test/environments/local.env --test --very-verbose test/addresses.hurl
```

**Environment Configuration Files:**
- `test/environments/local.env` - Local development (localhost:8080)
- `test/environments/staging.env` - Staging environment
- `test/environments/production.env` - Production environment

**Pros of Hurl:**
- ✅ Language-agnostic, simple syntax
- ✅ Easy environment switching with variables
- ✅ Great for CI/CD and external testing  
- ✅ Easy to read and maintain
- ✅ Fast execution, no startup overhead
- ✅ Same tests work across all environments

## Testing Strategy

1. **Unit Tests** - Use Go's built-in testing for individual functions
2. **Integration Tests** - Use `httptest` for internal Go testing  
3. **API Tests** - Use Hurl for external API testing and CI/CD
4. **End-to-End Tests** - Use Hurl against deployed environments

## CI/CD Pipeline Testing

Example CI/CD usage with different environments:

```yaml
# .github/workflows/test.yml
- name: Test Local
  run: hurl --variables-file test/environments/local.env --test test/addresses.hurl

- name: Test Staging  
  run: hurl --variables-file test/environments/staging.env --test test/addresses.hurl
  
- name: Smoke Test Production
  run: hurl --variables-file test/environments/production.env --test test/addresses.hurl
```

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Server port (default: 8080)
- `CORS_ORIGINS` - Allowed CORS origins (default: localhost:3000,localhost:5173)

## Development

To add new features:

1. **Models** - Add data structures in `internal/model/`
2. **Services** - Add business logic in `internal/service/`
3. **Handlers** - Add HTTP handlers in `internal/handler/`
4. **Tests** - Add both Go tests and Hurl tests

## Deployment

Build for production:
```bash
go build -o server cmd/server/main.go
./server
```

Or use Docker:
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]
```