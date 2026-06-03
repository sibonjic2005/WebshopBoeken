jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

import { placeOrder } from "@/app/checkout/actions";
import { addToCart, clearCart, getCart } from "@/app/cart/actions";
import { query } from "@/app/db";

let USER_ID: number;
const BOOK_ID = 1;

// Maak een tijdelijke testgebruiker aan met een id dat nog niet bestaat
// maar eerst voor zekerheid de oude testgebruiker verwijderen
beforeAll(async () => {
    await query("DELETE FROM shop_order WHERE user_id IN (SELECT id FROM customer WHERE email = 'checkout-test@gmail.com')");
    await query("DELETE FROM cart WHERE user_id IN (SELECT id FROM customer WHERE email = 'checkout-test@gmail.com')");
    await query("DELETE FROM customer WHERE email = 'checkout-test@gmail.com'");

    const rows = await query<{ id: number }>("INSERT INTO customer (email, password_hash, first_name, last_name) VALUES ('checkout-test@gmail.com', 'TestCheckout', 'Checkout', 'User') RETURNING id");
    USER_ID = rows[0].id;
});

// Verwijder de testgebruiker, zijn bestellingen en cart na alle tests
afterAll(async () => {
    await query("DELETE FROM shop_order WHERE user_id = $1", [USER_ID]);
    await query("DELETE FROM cart WHERE user_id = $1", [USER_ID]);
    await query("DELETE FROM customer WHERE id = $1", [USER_ID]);
});

test("fout gooien wanneer de cart leeg is", async () => {
    const formData = new FormData();
    formData.append("firstName", "Test");
    formData.append("lastName", "User");
    formData.append("email", "checkout-test@gmail.com");
    formData.append("street", "Test Street 1");
    formData.append("postalCode", "1234AB");
    formData.append("city", "Test City");
    formData.append("paymentMethod", "credit_card");

    await expect(placeOrder(formData, USER_ID)).rejects.toThrow("Cart is leeg, kan geen bestelling plaatsen.");
});

test("een bestelling plaatsen met items uit de cart", async () => {
    // Voeg items toe aan de cart
    await addToCart(USER_ID, BOOK_ID, 2);

    const formData = new FormData();
    formData.append("firstName", "Test");
    formData.append("lastName", "User");
    formData.append("email", "checkout-test@gmail.com");
    formData.append("street", "Test Street 1");
    formData.append("postalCode", "1234AB");
    formData.append("city", "Test City");
    formData.append("paymentMethod", "credit_card");

    await placeOrder(formData, USER_ID);

    // Controleer dat de cart leeg is
    const cart = await getCart(USER_ID);
    expect(cart).toEqual([]);
});

test("de order is correct opgeslagen in de database", async () => {
    // Voeg items toe aan de cart
    await addToCart(USER_ID, BOOK_ID, 3);

    const formData = new FormData();
    formData.append("firstName", "Test");
    formData.append("lastName", "User");
    formData.append("email", "checkout-test@gmail.com");
    formData.append("street", "Test Street 1");
    formData.append("postalCode", "1234AB");
    formData.append("city", "Test City");
    formData.append("paymentMethod", "credit_card");

    await placeOrder(formData, USER_ID);

    // Controleer dat de order aangemaakt is
    const orders = await query<{ id: number; status: string; total_amount: number }>(
        "SELECT id, status, total_amount FROM shop_order WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
        [USER_ID]
    );

    expect(orders.length).toBe(1);
    expect(orders[0].status).toBe("completed");
    expect(orders[0].total_amount).toBeGreaterThan(0);

    // Controleer dat de order_lines aangemaakt zijn
    const orderLines = await query<{ book_id: number; quantity: number }>(
        "SELECT book_id, quantity FROM order_line WHERE order_id = $1",
        [orders[0].id]
    );

    expect(orderLines.length).toBe(1);
    expect(orderLines[0].book_id).toBe(BOOK_ID);
    expect(orderLines[0].quantity).toBe(3);
});
