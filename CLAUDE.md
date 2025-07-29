# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Route.dog is a full-stack address mapping application that extracts delivery addresses from images using OpenAI Vision and geocodes them using the US Census API. The project consists of a Go API backend (`/api/`) and a React frontend (`/ui/`) that work together to provide an interactive mapping experience.

## Core Architecture

### Backend (Go API)
The API follows clean architecture principles with clear separation of concerns:

- **cmd/server/main.go** - Application entry point with server setup and dependency injection
- **internal/handler/** - HTTP request handlers that orchestrate service calls
- **internal/service/** - Business logic services (OpenAI Vision integration, geocoding)
- **internal/model/** - Data models and API request/response structures
- **test/** - Integration tests using both Go httptest and Hurl

### Key Data Flow
1. Frontend uploads image via POST /v1/addresses with base64 data
2. OpenAI Vision extracts address strings from the image
3. US Census Geocoding API validates/standardizes addresses and provides coordinates
4. Response includes original, standardized addresses with lat/lng coordinates
5. Failed geocoding attempts still return the address with 0,0 coordinates
6. Frontend displays addresses on interactive map with markers

### Frontend (React UI)
The React frontend follows modern best practices with clean component architecture:

- **ui/src/components/** - React components (MapView, AddressListPanel, etc.)
- **ui/src/store/** - Zustand state management
- **ui/src/components/ui/** - Shadcn/UI component library
- **ui/tailwind.config.js** - Tailwind CSS 4.0 configuration with dark mode

### Environment Configuration
- **Backend**: Requires `OPENAI_API_KEY` environment variable
- **Frontend**: Node.js 20+ (specified in .nvmrc)
- Uses US Census Geocoding API (no API key required)
- CORS configured for frontend development (localhost:3000, localhost:5173)

## Development Commands

### Backend Setup
```bash
cd api
cp .env.example .env
# Add your OpenAI API key to .env
go mod tidy
```

### Frontend Setup
```bash
cd ui
pnpm install
```

### Run Development Servers
```bash
# Terminal 1: Start Go API server
cd api && go run cmd/server/main.go

# Terminal 2: Start React dev server  
cd ui && pnpm run dev
```

### Frontend Build
```bash
cd ui
pnpm run build
pnpm run preview  # Preview production build
```

### Testing Commands
```bash
# Backend: Go integration tests (httptest)
cd api
go test -v ./test/...
go test -v ./test/ -run TestParseAddresses_Success

# Backend: Hurl API tests (requires server running)
cd api
hurl --variables-file test/environments/local.env --test test/addresses.hurl
hurl --variable host=http://localhost:8080 --test test/addresses.hurl

# Frontend: Type checking and linting
cd ui
pnpm run type-check  # TypeScript compilation check
pnpm run lint        # ESLint
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