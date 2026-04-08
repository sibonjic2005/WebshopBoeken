"use server";

import { query } from "@/app/db";
import { redirect } from "next/navigation";

// Add item to cart
export async function addToCart(userId: number, bookId: number, quantity: number = 1) {
    await query(
        `INSERT INTO cart (user_id, book_id, quantity) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, book_id) 
         DO UPDATE SET quantity = cart.quantity + $3`,
        [userId, bookId, quantity]
    );
}

// Get all items in cart
export async function getCart(userId: number) {
    const rows = await query<{
        bookId: number;
        title: string;
        price_cents: number;
        quantity: number;
    }>(`SELECT c.book_id as "bookId", b.title, b.price_cents, c.quantity
        FROM cart c
        JOIN book b ON c.book_id = b.id
        WHERE c.user_id = $1`,  
        [userId]
    );
    return rows;
}

// Update quantity in cart
export async function updateCartQuantity(userId: number, bookId: number, quantity: number) {
    if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        await query(
            "DELETE FROM cart WHERE user_id = $1 AND book_id = $2",
            [userId, bookId]
        );
    } else {
        // Otherwise update the quantity
        await query(
            "UPDATE cart SET quantity = $3 WHERE user_id = $1 AND book_id = $2",
            [userId, bookId, quantity]
        );
    }
}

// Remove item from cart
export async function removeFromCart(userId: number, bookId: number) {
    await query(
        "DELETE FROM cart WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
    );
}

// Clear entire cart
export async function clearCart(userId: number) {
    await query(
        "DELETE FROM cart WHERE user_id = $1",
        [userId]
    );
}
