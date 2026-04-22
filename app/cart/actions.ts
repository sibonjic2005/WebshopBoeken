"use server";

import { query } from "@/app/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// item toevoegen aan cart.
export async function addToCart(userId: number, bookId: number, quantity: number = 1) {
    await query(
        `INSERT INTO cart (user_id, book_id, quantity) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, book_id) 
         DO UPDATE SET quantity = cart.quantity + $3`,
        [userId, bookId, quantity]
        //on conflict DO update zorgt ervoor dat als er al een item in de cart zit, de quantity wordt verhoogd in plaats van een nieuwe rij toe te voegen.
    );
    revalidatePath("/cart");
}

// alle items in cart ophalen
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

// Update de quantity van een item in de cart
export async function updateCartQuantity(userId: number, bookId: number, quantity: number) {
    if (quantity <= 0) {
        // als quantity 0 of minder is, verwijder het item uit de cart
        await query(
            "DELETE FROM cart WHERE user_id = $1 AND book_id = $2",
            [userId, bookId]
        );
    } else {
        // Anders update de quantity
        await query(
            "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND book_id = $3",
            [quantity, userId, bookId]
        );
    }
    revalidatePath("/cart"); 
}

// Remove item from cart
export async function removeFromCart(userId: number, bookId: number) {
    await query(
        "DELETE FROM cart WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
    );
    revalidatePath("/cart");
}

// Clear entire cart
export async function clearCart(userId: number) {
    await query(
        "DELETE FROM cart WHERE user_id = $1",
        [userId]
    );
    revalidatePath("/cart");
}
