import { NextRequest, NextResponse } from "next/server";
import { getCart, addToCart, clearCart } from "@/app/cart/actions";

// GET alle items in cart ophale
export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
        );
    }

    try {
        const cartItems = await getCart(parseInt(userId));
        return NextResponse.json(cartItems, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch cart" },
            { status: 500 }
        );
    }
}

// POST item toevoegen aan cart
export async function POST(request: NextRequest) {
    try {
        const { userId, bookId, quantity = 1 } = await request.json();

        if (!userId || !bookId) {
            return NextResponse.json(
                { error: "userId and bookId are required" },
                { status: 400 }
            );
        }

        await addToCart(userId, bookId, quantity);

        return NextResponse.json(
            { message: "Item added to cart" },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add item to cart" },
            { status: 500 }
        );
    }
}