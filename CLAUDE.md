# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Route.dog is a full-stack address mapping application that extracts delivery addresses from images using OpenAI Vision and geocodes them using the US Census API. The current implementation focuses on the Go API backend (located in `/api/`), with a planned React frontend using Vite, TypeScript, Tailwind CSS 4.0, Shadcn/UI, Zustand, and MapLibre GL.

## Core Architecture

### Backend (Go API)
The API follows clean architecture principles with clear separation of concerns:

- **cmd/server/main.go** - Application entry point with server setup and dependency injection
- **internal/handler/** - HTTP request handlers that orchestrate service calls
- **internal/service/** - Business logic services (OpenAI Vision integration, geocoding)
- **internal/model/** - Data models and API request/response structures
- **test/** - Integration tests using both Go httptest and Hurl

### Key Data Flow
1. POST /v1/addresses receives base64 image data
2. OpenAI Vision extracts address strings from the image
3. US Census Geocoding API validates/standardizes addresses and provides coordinates
4. Response includes original, standardized addresses with lat/lng coordinates
5. Failed geocoding attempts still return the address with 0,0 coordinates

### Environment Configuration
- Requires `OPENAI_API_KEY` environment variable
- Uses US Census Geocoding API (no API key required)
- CORS configured for frontend development (localhost:3000, localhost:5173)

## Development Commands

### Setup
```bash
cd api
cp .env.example .env
# Add your OpenAI API key to .env
go mod tidy
```

### Run Server
```bash
go run cmd/server/main.go
```

### Testing Commands
```bash
# Go integration tests (httptest)
go test -v ./test/...
go test -v ./test/ -run TestParseAddresses_Success

# Hurl API tests (requires server running)
hurl --variables-file test/environments/local.env --test test/addresses.hurl
hurl --variable host=http://localhost:8080 --test test/addresses.hurl

# Hurl with reports
hurl --variables-file test/environments/local.env --test --report-html test-results test/addresses.hurl
```

### Build
```bash
go build -o server cmd/server/main.go
```

## Testing Strategy

The project uses a dual testing approach:

1. **Go httptest** (./test/integration_test.go) - Fast in-memory integration tests with precise control
2. **Hurl** (./test/addresses.hurl) - External API tests that can target different environments

Hurl tests support environment variables through files in `test/environments/`:
- `local.env` - localhost:8080
- `staging.env` - staging-api.route.dog  
- `production.env` - api.route.dog

This allows the same test suite to run against development, staging, and production environments.

## Code Conventions

### Commit Messages
Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug`
- `refactor: restructure code`
- `test: add or modify tests`
- `docs: update documentation`

### Error Handling
- Services return errors that handlers convert to appropriate HTTP status codes
- Failed geocoding doesn't fail the entire request - addresses are returned with 0,0 coordinates
- All errors are logged for debugging

### Dependency Injection
Services are instantiated in main.go and injected into handlers. This pattern makes testing easier and follows Go best practices.

## Future Frontend Integration

The planned React frontend will:
- Use MapLibre GL for interactive mapping (no API keys required)
- Support dark mode with Tailwind class-based theming
- Manage state with Zustand
- Display address lists with editing capabilities
- Show past routes with thumbnails (thumbnail generation not yet implemented)

When adding frontend features, consider the existing API structure and ensure the `/v1/addresses` endpoint meets frontend requirements.