"use server";

import { query } from "@/app/db";
import { getCart, clearCart } from "@/app/cart/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Een nieuwe bestelling plaatsen op basis van de cart en user info
export async function placeOrder(userInfo: FormData, userId: number) {
    const firstName = userInfo.get("firstName") as string;
    const lastName = userInfo.get("lastName") as string;
    const email = userInfo.get("email") as string;
    const street = userInfo.get("street") as string;
    const postalCode = userInfo.get("postalCode") as string;
    const city = userInfo.get("city") as string;
    const paymentMethod = userInfo.get("paymentMethod") as string;

    // 1. Alle items in de cart ophalen voor deze gebruiker
    const cartItems = await getCart(userId);

    if (cartItems.length === 0) {
        throw new Error("Cart is leeg, kan geen bestelling plaatsen.");
    }

    // 2. Bereken totaalprijs van de order (in euro's)
    const totalAmount = cartItems.reduce((sum, item) => {
        return sum + (item.price_cents * item.quantity);
    }, 0) / 100;

    // 3. De hoofdorder aanmaken in 'shop_order'
    // We slaan de status op als 'completed' (of 'pending' afhankelijk van je flow)
    const orderRows = await query<{ id: number }>(
        `INSERT INTO shop_order (user_id, status, total_amount) 
         VALUES ($1, $2, $3) 
         RETURNING id`, 
        [userId, "completed", totalAmount]
    );
    const orderId = orderRows[0].id;

    // 4. Order_lines vullen met de items uit de cart
    for (const item of cartItems) {
        const priceAtPurchase = (item.price_cents / 100).toFixed(2);
        
        await query(
            `INSERT INTO order_line (order_id, book_id, quantity, price_at_purchase) 
             VALUES ($1, $2, $3, $4)`,
            [orderId, item.bookId, item.quantity, priceAtPurchase]
        );
    }

    // 5. De cart leegmaken na een succesvolle bestelling
    await clearCart(userId);

    // 6. Cache updaten en gebruiker doorsturen
    revalidatePath("/cart");
    // Zorg dat deze route bestaat in je app folder
    redirect(`/order-confirmation?orderId=${orderId}`);
}