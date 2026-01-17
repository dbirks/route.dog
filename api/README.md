# Route.dog API - Python Workers

Address extraction and geocoding service running on Cloudflare Workers with Python.

## Tech Stack

- **Runtime**: Cloudflare Workers (Python/Pyodide)
- **Framework**: FastAPI
- **Package Manager**: uv (fast, modern Python tooling)
- **Linting/Formatting**: ruff (auto-format, import sorting)
- **Type Checking**: ty (Astral's type checker)
- **Vision API**: OpenAI GPT-5.2 via httpx
- **Geocoding**: US Census API via httpx

## Setup

### Prerequisites

- Python 3.11+
- Node.js (for Wrangler CLI)
- uv (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Installation

```bash
# Install dependencies with uv
uv sync

# Install Wrangler CLI (if not already installed)
npx wrangler --version
```

### Configuration

1. Copy environment variables:
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars with your actual keys
   ```

2. Set up Cloudflare secrets (production):
   ```bash
   npx wrangler secret put OPENAI_API_KEY
   npx wrangler secret put CLOUDFLARE_API_KEY
   ```

## Development

```bash
# Run local development server
npx wrangler dev

# Format code
uv run ruff format .

# Lint code
uv run ruff check .

# Fix linting issues automatically
uv run ruff check --fix .

# Type check (once ty is set up)
uv run ty check src/
```

## Deployment

```bash
# Deploy to dev environment
npx wrangler deploy --env dev

# Deploy to production
npx wrangler deploy --env production
```

## Project Structure

```
api/
├── src/
│   ├── index.py          # FastAPI app entry point
│   ├── models/           # Pydantic models
│   ├── services/         # Business logic (OpenAI, geocoding)
│   └── routes/           # API endpoints
├── wrangler.toml         # Cloudflare Workers config
├── pyproject.toml        # Python project config (uv, ruff, ty)
├── .dev.vars             # Local environment variables (gitignored)
└── README.md
```

## API Endpoints

### `POST /v1/addresses`
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

### `PUT /v1/geocode-address`
Geocode a single address.

**Request:**
```json
{
  "address": "123 Main St, Springfield, IL"
}
```

**Response:**
```json
{
  "original": "123 Main St, Springfield, IL",
  "standardized": "123 MAIN ST, SPRINGFIELD IL 62701",
  "latitude": 39.123456,
  "longitude": -89.654321
}
```

## Best Practices

1. **Type Hints**: Use type hints everywhere (enforced by ty)
2. **Import Sorting**: Automatic via ruff
3. **Code Formatting**: Run `ruff format` before committing
4. **Linting**: Fix issues with `ruff check --fix`
5. **Environment Variables**: Never commit secrets - use .dev.vars locally and Wrangler secrets in production

## Migration from Go

This is a rewrite of the original Go API. The Go code has been preserved in `../api-old/` for reference.

Key changes:
- Go chi router → FastAPI
- Go net/http → Python httpx
- OpenAI Go SDK → httpx direct REST calls (GPT-5.2)
- Synchronous → Async (FastAPI/httpx)
