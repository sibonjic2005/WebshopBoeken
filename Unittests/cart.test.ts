jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { addToCart, getCart, removeFromCart, updateCartQuantity, clearCart } from "@/app/cart/actions";
import { query } from "@/app/db";

let USER_ID: number;
const BOOK_ID = 1;

// Maak een tijdelijke testgebruiker aan met een id dat nog niet bestaat
beforeAll(async () => {
    const rows = await query<{ id: number }>("INSERT INTO customer (email, password_hash, first_name, last_name) VALUES ('test@gmail.com', 'Testuser', 'Test', 'User') RETURNING id");
    USER_ID = rows[0].id;
});

// Verwijder de testgebruiker en zijn cart na alle tests
afterAll(async () => {
    await query("DELETE FROM cart WHERE user_id = $1", [USER_ID]);
    await query("DELETE FROM customer WHERE id = $1", [USER_ID]);
});

test("Kijken of de cart wel leeg is wanneer we beginnen", async () => {
    const cart = await getCart(USER_ID);
    expect(cart).toEqual([]);
});

test("een boek aan de cart toevoegen", async () => {
    await addToCart(USER_ID, BOOK_ID, 1);
    const cart = await getCart(USER_ID);
    expect(cart[0].quantity).toBe(1);
});

test("wanneer zelfde boek nog een keer wordt gevoegd, gaat de quantity ook omhoog", async () => {
    await addToCart(USER_ID, BOOK_ID, 2);
    const cart = await getCart(USER_ID);
    expect(cart[0].quantity).toBe(3);
});

test("quantity aanpassen", async () => {
    await updateCartQuantity(USER_ID, BOOK_ID, 5);
    const cart = await getCart(USER_ID);
    expect(cart[0].quantity).toBe(5);
});

test("boek verwijderen uit cart", async () => {
    await removeFromCart(USER_ID, BOOK_ID);
    const cart = await getCart(USER_ID);
    expect(cart).toEqual([]);
});


