# Sentry Setup Guide

This guide covers setting up Sentry for error tracking in Route Dog.

## 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up or log in
2. Create a new project:
   - Platform: **React**
   - Alert frequency: **On every new issue**
3. Copy your **DSN** (Data Source Name) - it looks like:
   ```
   https://[key]@[org].ingest.sentry.io/[project-id]
   ```

## 2. Configure Environment Variables

Create a `.env` file in the `ui/` directory:

```bash
cd ui
cp .env.example .env
```

Edit `.env` and add your Sentry DSN:

```env
VITE_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_DEBUG=false
```

## 3. Install Dependencies

```bash
cd ui
npm install
```

This will install `@sentry/react` which has already been added to `package.json`.

## 4. Test Sentry Integration

1. Start the dev server: `npm run dev`
2. Open the browser console
3. Trigger a test error by adding this to your code temporarily:
   ```typescript
   import { captureError } from '@/lib/sentry'
   captureError(new Error('Test error'))
   ```
4. Check your Sentry dashboard for the error

## 5. Set Up Sentry MCP Server (Optional)

The Sentry MCP server allows Claude Code to interact with your Sentry issues directly.

### Get Sentry Auth Token

1. Go to Sentry Settings → Auth Tokens
2. Create a new token with these scopes:
   - `event:read`
   - `project:read`
   - `org:read`
3. Copy the token (you'll only see it once!)

### Configure MCP Server

The MCP server configuration is in `.claude/mcp-servers.json`. To activate it:

1. Copy the config to your Claude Code configuration:
   ```bash
   mkdir -p ~/.config/claude
   cp .claude/mcp-servers.json ~/.config/claude/
   ```

2. Edit `~/.config/claude/mcp-servers.json` and fill in your credentials:
   ```json
   {
     "mcpServers": {
       "sentry": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-sentry"],
         "env": {
           "SENTRY_AUTH_TOKEN": "your-auth-token-here",
           "SENTRY_ORG": "your-org-slug",
           "SENTRY_PROJECT": "your-project-slug"
         }
       }
     }
   }
   ```

3. Restart Claude Code

4. The Sentry MCP server should now be available, allowing Claude to:
   - List recent issues
   - Read issue details and stack traces
   - Search for specific errors
   - Mark issues as resolved

## Features Enabled

- **Error Tracking**: Automatic capture of unhandled errors and exceptions
- **Performance Monitoring**: Track page load times and API call performance (10% sample rate in production)
- **Session Replay**: Record 10% of sessions, and 100% of sessions with errors
- **Source Maps**: Production builds include source maps for better stack traces
- **Environment Tracking**: Separate development/staging/production environments

## Usage in Code

### Manually Capture Errors

```typescript
import { captureError } from '@/lib/sentry'

try {
  // risky operation
} catch (error) {
  captureError(error as Error, {
    context: 'additional info',
    userId: '123'
  })
}
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/sentry'

addBreadcrumb('User clicked upload button', 'user-action', {
  fileCount: 3
})
```

### Set User Context

```typescript
import { setUserContext } from '@/lib/sentry'

setUserContext({
  id: 'user-123',
  email: 'user@example.com'
})
```

## Production Deployment

Sentry is automatically enabled in production builds. Make sure to:

1. Set environment variables in Cloudflare Pages:
   - `VITE_SENTRY_DSN`
   - `VITE_SENTRY_ENVIRONMENT=production`

2. Deploy and test

3. Monitor your Sentry dashboard for incoming errors

## Troubleshooting

### Sentry not capturing errors in development

Set `VITE_SENTRY_DEBUG=true` in your `.env` file to enable Sentry in development.

### MCP server not connecting

1. Check that you're using the correct auth token with proper scopes
2. Verify org and project slugs match your Sentry account
3. Check Claude Code logs for connection errors
4. Try running the MCP server manually:
   ```bash
   SENTRY_AUTH_TOKEN=xxx SENTRY_ORG=xxx SENTRY_PROJECT=xxx \
   npx @modelcontextprotocol/server-sentry
   ```
