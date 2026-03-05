import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  throw new Error("SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN environment variables are required");
}

const SHOPIFY_API_BASE = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10`;

// Create server instance
const server = new McpServer({
  name: "shopify-mcp-server",
  version: "1.0.0",
});

// Helper function to make Shopify API requests
async function shopifyRequest(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${SHOPIFY_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Register tools
server.registerTool(
  "list_products",
  {
    title: "List Products",
    description: "List products from the Shopify store",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of products to return (max 250)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number for pagination",
          default: 1,
        },
      },
    },
  },
  async ({ limit = 50, page = 1 }) => {
    try {
      const products = await shopifyRequest('/products.json', {
        limit: Math.min(limit, 250).toString(),
        page: page.toString(),
      });

      const content = products.products.map((product: any) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        status: product.status,
        variants: product.variants.map((variant: any) => ({
          id: variant.id,
          title: variant.title,
          price: variant.price,
          sku: variant.sku,
        })),
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(content, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error listing products: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "search_products",
  {
    title: "Search Products",
    description: "Search products by title or handle",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for product title or handle",
        },
        limit: {
          type: "number",
          description: "Number of products to return (max 250)",
          default: 50,
        },
      },
      required: ["query"],
    },
  },
  async ({ query, limit = 50 }) => {
    try {
      // Shopify doesn't have a direct search endpoint, so we'll filter products
      const products = await shopifyRequest('/products.json', {
        limit: "250", // Get more to filter
      });

      const filteredProducts = products.products.filter((product: any) =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.handle.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);

      const content = filteredProducts.map((product: any) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        status: product.status,
        variants: product.variants.map((variant: any) => ({
          id: variant.id,
          title: variant.title,
          price: variant.price,
          sku: variant.sku,
        })),
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(content, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error searching products: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shopify MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});