import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/db";
import { getCart, clearCart } from "@/app/cart/actions";

// POST /api/orders - Place an order
export async function POST(request: NextRequest) {
    try {
        const { userId, firstName, lastName, email, paymentMethod } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        // Step 1: Get all items from cart
        const cartItems = await getCart(userId);

        if (cartItems.length === 0) {
            return NextResponse.json(
                { error: "Cart is empty" },
                { status: 400 }
            );
        }

        // Step 2: Calculate total price from cart items
        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);
        const totalAmount = totalPrice / 100; // Convert cents to euros

        // Step 3: Create shop_order record
        const orderRows = await query<{ id: number }>(
            "INSERT INTO shop_order (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING id",
            [userId, "completed", totalAmount]
        );
        const orderId = orderRows[0].id;

        // Step 4: Create order_line records for each cart item
        for (const item of cartItems) {
            await query(
                "INSERT INTO order_line (order_id, book_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)",
                [orderId, item.bookId, item.quantity, (item.price_cents / 100).toFixed(2)]
            );
        }

        // Step 5: Clear the cart
        await clearCart(userId);

        return NextResponse.json(
            {
                message: "Order placed successfully",
                orderId: orderId,
                totalAmount: totalAmount
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Order placement error:", error);
        return NextResponse.json(
            { error: "Failed to place order" },
            { status: 500 }
        );
    }
}

// GET /api/orders?userId=1 - Get user's orders
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const rows = await query<{
            id: number;
            user_id: number;
            status: string;
            total_amount: number;
            order_date: string;
        }>(
            `SELECT id, user_id, status, total_amount, order_date
             FROM shop_order
             WHERE user_id = $1
             ORDER BY order_date DESC`,
            [parseInt(userId)]
        );

        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
