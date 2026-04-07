import { NextRequest, NextResponse } from "next/server";
import { updateCartQuantity, removeFromCart } from "@/app/cart/actions";

// PUT /api/cart/[bookId] - Update quantity
export async function PUT(
    request: NextRequest,
    { params }: { params: { bookId: string } }
) {
    try {
        const { userId, quantity } = await request.json();
        const bookId = parseInt(params.bookId);

        if (!userId || quantity === undefined) {
            return NextResponse.json(
                { error: "userId and quantity are required" },
                { status: 400 }
            );
        }

        await updateCartQuantity(userId, bookId, quantity);

        return NextResponse.json(
            { message: "Cart updated" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update cart" },
            { status: 500 }
        );
    }
}

// DELETE /api/cart/[bookId] - Remove item
export async function DELETE(
    request: NextRequest,
    { params }: { params: { bookId: string } }
) {
    try {
        const userId = request.nextUrl.searchParams.get("userId");
        const bookId = parseInt(params.bookId);

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        await removeFromCart(parseInt(userId), bookId);

        return NextResponse.json(
            { message: "Item removed from cart" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to remove item" },
            { status: 500 }
        );
    }
}
