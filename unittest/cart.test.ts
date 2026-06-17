import { describe, it, expect, beforeEach } from "@jest/globals";

import { revalidatePath } from "next/cache";
import { query } from "@/app/db";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "@/app/cart/actions";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/app/db");

const queryMock = query as jest.MockedFunction<
  (sql: string, params?: unknown[]) => Promise<unknown[]>
>;

function lastQueryCall(): [string, unknown[] | undefined] {
  const call = queryMock.mock.calls.at(-1);
  expect(call).toBeDefined();
  return call as [string, unknown[] | undefined];
}

const USER_ID = 42;
const BOOK_ID = 1;

describe("cart actions", () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockResolvedValue([]);
  });

  it("getCart returns the rows the database yields", async () => {
    const rows = [{ bookId: BOOK_ID, title: "1984", price_cents: 1299, quantity: 2 }];
    queryMock.mockResolvedValue(rows);

    await expect(getCart(USER_ID)).resolves.toBe(rows);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("FROM cart c");
    expect(sql).toContain("JOIN book b ON c.book_id = b.id");
    expect(sql).toContain("WHERE c.user_id = $1");
    expect(params).toEqual([USER_ID]);
  });

  it("addToCart inserts and increments on conflict", async () => {
    await addToCart(USER_ID, BOOK_ID, 3);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("INSERT INTO cart (user_id, book_id, quantity)");
    expect(sql).toContain("ON CONFLICT (user_id, book_id)");
    expect(sql).toContain("DO UPDATE SET quantity = cart.quantity + $3");
    expect(params).toEqual([USER_ID, BOOK_ID, 3]);
    expect(revalidatePath).toHaveBeenCalledWith("/cart");
  });

  it("addToCart defaults the quantity to 1", async () => {
    await addToCart(USER_ID, BOOK_ID);
    expect(lastQueryCall()[1]).toEqual([USER_ID, BOOK_ID, 1]);
  });

  it("updateCartQuantity updates the quantity when positive", async () => {
    await updateCartQuantity(USER_ID, BOOK_ID, 5);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("UPDATE cart SET quantity = $1 WHERE user_id = $2 AND book_id = $3");
    expect(params).toEqual([5, USER_ID, BOOK_ID]);
  });

  it("updateCartQuantity removes the item when quantity drops to zero or below", async () => {
    await updateCartQuantity(USER_ID, BOOK_ID, 0);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("DELETE FROM cart WHERE user_id = $1 AND book_id = $2");
    expect(params).toEqual([USER_ID, BOOK_ID]);
  });

  it("removeFromCart deletes the single cart line", async () => {
    await removeFromCart(USER_ID, BOOK_ID);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("DELETE FROM cart WHERE user_id = $1 AND book_id = $2");
    expect(params).toEqual([USER_ID, BOOK_ID]);
  });

  it("clearCart deletes every line for the user", async () => {
    await clearCart(USER_ID);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("DELETE FROM cart WHERE user_id = $1");
    expect(params).toEqual([USER_ID]);
  });
});
