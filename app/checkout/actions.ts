// "use server";

// import { query } from "@/app/db";
// import { redirect } from "next/navigation";

// export async function placeOrder(UserData: FormData) {
//   const firstName = UserData.get("firstName") as string;
//   const lastName = UserData.get("lastName") as string;
//   const email = UserData.get("email") as string;
//   const street = UserData.get("street") as string;
//   const postalCode = UserData.get("postalCode") as string;
//   const city = UserData.get("city") as string;
//   const paymentMethod = UserData.get("paymentMethod") as string;

//   // Create order in database
//   const rows = await query<{ id: number }>(
//     "INSERT INTO shop_order (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id",
//     [1, 0, "pending"]
//   );

//   const orderId = rows[0].id;

//   redirect("/order-confirmation");
// }

"use server";

import { query } from "@/app/db";
import { getCart, clearCart } from "@/app/cart/actions";

export async function placeOrder(userInfo: FormData, userId: number) {
    const firstName = userInfo.get("firstName") as string;
    const lastName = userInfo.get("lastName") as string;
    const email = userInfo.get("email") as string;
    const street = userInfo.get("street") as string;
    const postalCode = userInfo.get("postalCode") as string;
    const city = userInfo.get("city") as string;
    const paymentMethod = userInfo.get("paymentMethod") as string;

    // alle items in cart ophalen
    const cartItems = await getCart(userId);

    if (cartItems.length === 0) {
        throw new Error("Cart is empty");
    }

    // bereken totaalprijs van de order
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);
    const totalAmount = totalPrice / 100; // van cent naar euro

    // shop order aanmaken
    const orderRows = await query<{ id: number }>(
        "INSERT INTO shop_order (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING id", 
        [userId, "completed", totalAmount]
    );
    const orderId = orderRows[0].id;

    // orderline vullen met items uit cart
    for (const item of cartItems) {
        await query(
            "INSERT INTO order_line (order_id, book_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)",
            [orderId, item.bookId, item.quantity, (item.price_cents / 100).toFixed(2)]
        );
        //toFixed om af te ronden op 2 decimalen.
    }

    // cart leegmaken
    await clearCart(userId);

    // redirected naar order confirmation page komt hieronder later

}




