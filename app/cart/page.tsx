import Link from "next/link";
import { getCart, removeFromCart, updateCartQuantity, clearCart } from "./actions";
import { formatCurrency } from "@/app/format-currency";

const userId = 1; // hardcoded until auth is built

export default async function CartPage() {
    const cart = await getCart(userId);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);

    if (cart.length == 0) {
        return (
            <div className="p-8">
                <p className="text-xl mb-4">Your cart is empty</p>
                <Link href="/" className="text-blue-600 hover:underline">Continue shopping</Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b dark:border-zinc-800">
                        <th className="pb-2 font-medium">Books</th>
                        <th className="pb-2 font-medium">Price</th>
                        <th className="pb-2 font-medium">Quantity</th>
                        <th className="pb-2 font-medium">Subtotal</th>
                        <th className="pb-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map(item => (
                        <tr key={item.bookId} className="border-b dark:border-zinc-800">
                            <td className="py-2">{item.title}</td>
                            <td className="py-2">{formatCurrency(item.price_cents)}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">{formatCurrency(item.price_cents * item.quantity)}</td>
                            <td className="py-2">
                                <div className="flex gap-2">
                                    <form action={async () => {
                                        "use server";
                                        await updateCartQuantity(userId, item.bookId, item.quantity - 1);
                                    }}>
                                        <button type="submit" className="px-2 py-1 bg-zinc-200 rounded dark:bg-zinc-700">-</button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await updateCartQuantity(userId, item.bookId, item.quantity + 1);
                                    }}>
                                        <button type="submit" className="px-2 py-1 bg-zinc-200 rounded dark:bg-zinc-700">+</button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await removeFromCart(userId, item.bookId);
                                    }}>
                                        <button type="submit" className="text-red-600 hover:underline dark:text-red-400">Remove</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-zinc-500">Total items: {totalItems}</p>
                    <p className="text-xl font-bold">Total: {formatCurrency(totalPrice)}</p>
                </div>
                <div className="flex gap-4">
                    <form action={async () => {
                        "use server";
                        await clearCart(userId);
                    }}>
                        <button type="submit" className="px-4 py-2 bg-zinc-200 rounded dark:bg-zinc-700">Clear cart</button>
                    </form>
                    <Link href="/checkout" className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
                        Proceed to checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}
