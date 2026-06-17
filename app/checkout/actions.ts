"use server";

import { query, transaction } from "@/app/db";
import { getCart, clearCart } from "@/app/cart/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// Een nieuwe bestelling plaatsen op basis van de cart en user info
export async function placeOrder(
    userInfo: FormData,
    userId: number
) {

    const firstName = userInfo.get("firstName") as string;
    const lastName = userInfo.get("lastName") as string;
    const email = userInfo.get("email") as string;
    const street = userInfo.get("street") as string;
    const postalCode = userInfo.get("postalCode") as string;
    const city = userInfo.get("city") as string;
    const paymentMethod = userInfo.get("paymentMethod") as string;



    // Alle items uit de winkelwagen ophalen
    const cartItems = await getCart(userId);



    if (cartItems.length === 0) {

        throw new Error(
            "Cart is leeg, kan geen bestelling plaatsen."
        );

    }



    // Totaalbedrag berekenen
    const totalAmount = cartItems.reduce(
        (sum, item) => {

            return sum + 
                (item.price_cents * item.quantity);

        }, 
        0
    ) / 100;




    let orderId: number;



    await transaction(async (client) => {


        // Hoofdorder aanmaken
        const orderResult = await client.query(
            `
            INSERT INTO shop_order
            (
                user_id,
                status,
                total_amount
            )

            VALUES ($1, $2, $3)

            RETURNING id
            `,
            [
                userId,
                "completed",
                totalAmount
            ]
        );


        orderId = orderResult.rows[0].id;




        // Orderregels toevoegen
        for (const item of cartItems) {


            const priceAtPurchase =
                (item.price_cents / 100).toFixed(2);



            await client.query(
                `
                INSERT INTO order_line
                (
                    order_id,
                    book_id,
                    quantity,
                    price_at_purchase
                )

                VALUES ($1, $2, $3, $4)
                `,
                [
                    orderId,
                    item.bookId,
                    item.quantity,
                    priceAtPurchase
                ]
            );


        }




        // Advanced SQL:
        // Met een CTE wordt een overzicht gemaakt
        // van de geplaatste bestelling.
        //
        // Gebruikte technieken:
        // - CTE (WITH)
        // - JOIN
        // - COUNT()
        // - SUM()
        // - GROUP BY

        const orderSummary = await client.query(
            `
            WITH order_summary AS (

                SELECT
                    ol.order_id,

                    COUNT(ol.book_id) AS total_products,

                    SUM(
                        ol.quantity * ol.price_at_purchase
                    ) AS calculated_total


                FROM order_line ol


                WHERE ol.order_id = $1


                GROUP BY ol.order_id

            )


            SELECT

                so.id,

                so.status,

                os.total_products,

                os.calculated_total


            FROM shop_order so


            INNER JOIN order_summary os

                ON os.order_id = so.id


            WHERE so.user_id = $2

            `,
            [
                orderId,
                userId
            ]
        );



        console.log(
            "Order overzicht:",
            orderSummary.rows
        );



    });




    // Cart leegmaken na succesvolle bestelling
    await clearCart(userId);



    // Cache vernieuwen
    revalidatePath("/cart");



    // Terug naar homepage
    redirect("/?success=true");

}