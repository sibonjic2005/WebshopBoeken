import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: { title: "Bookshop API", version: "1.0.0" },
    paths: {
      "/api/cart": {
        get: { tags: ["Cart"], summary: "Get user cart", parameters: [{ name: "userId", in: "query", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Cart items" }, 400: { description: "Missing userId" }, 500: { description: "Server error" } } },
        post: { tags: ["Cart"], summary: "Add item to cart", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { userId: { type: "integer" }, bookId: { type: "integer" }, quantity: { type: "integer" } }, required: ["userId", "bookId"] } } } }, responses: { 201: { description: "Item added" }, 400: { description: "Missing fields" }, 500: { description: "Server error" } } },
      },
      "/api/cart/{bookId}": {
        put: { tags: ["Cart"], summary: "Update item quantity", parameters: [{ name: "bookId", in: "path", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { userId: { type: "integer" }, quantity: { type: "integer" } }, required: ["userId", "quantity"] } } } }, responses: { 200: { description: "Cart updated" }, 400: { description: "Missing fields" }, 500: { description: "Server error" } } },
        delete: { tags: ["Cart"], summary: "Remove item from cart", parameters: [{ name: "bookId", in: "path", required: true, schema: { type: "integer" } }, { name: "userId", in: "query", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Item removed" }, 400: { description: "Missing userId" }, 500: { description: "Server error" } } },
      },
      "/api/orders": {
        get: { tags: ["Orders"], summary: "Get user orders", parameters: [{ name: "userId", in: "query", required: true, schema: { type: "integer" } }], responses: { 200: { description: "List of orders" }, 400: { description: "Missing userId" }, 500: { description: "Server error" } } },
        post: { tags: ["Orders"], summary: "Place a new order", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { userId: { type: "integer" }, firstName: { type: "string" }, lastName: { type: "string" }, email: { type: "string" }, paymentMethod: { type: "string" } }, required: ["userId"] } } } }, responses: { 201: { description: "Order placed" }, 400: { description: "Cart empty or missing userId" }, 500: { description: "Server error" } } },
      },
    },
  };
  return NextResponse.json(spec);
}
