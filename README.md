# Shopify MCP Server

A Model Context Protocol (MCP) server that provides integration with Shopify for product listing and search functionality.

## Features

- **List Products**: Retrieve a list of products from your Shopify store
- **Search Products**: Search products by title or handle

## Prerequisites

- Node.js 18 or higher
- A Shopify store with Admin API access
- Shopify access token with appropriate permissions

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Shopify credentials:
   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your-access-token
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### With Claude Desktop

Add the server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": ["/path/to/your/mcp/build/index.js"],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

### Direct execution

You can also run the server directly:

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com SHOPIFY_ACCESS_TOKEN=your-token node build/index.js
```

## Available Tools

### list_products
Lists products from the Shopify store.

**Parameters:**
- `limit` (optional): Number of products to return (max 250, default 50)
- `page` (optional): Page number for pagination (default 1)

### search_products
Searches products by title or handle.

**Parameters:**
- `query` (required): Search query
- `limit` (optional): Number of products to return (max 250, default 50)

## Development

To modify the server:

1. Edit files in the `src/` directory
2. Run `npm run build` to compile TypeScript
3. Test your changes

## License

MIT