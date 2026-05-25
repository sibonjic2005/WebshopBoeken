import Link from "next/link";
import { getCart, removeFromCart, updateCartQuantity, clearCart } from "./actions";
import { formatCurrency } from "@/app/format-currency";
import { getUserSession } from "@/app/lib/session";

export default async function CartPage() {
    const userId = await getUserSession();

    // For now, only registered users can have cart items
    // Guests will see empty cart with login/register options
    const cart = userId ? await getCart(userId) : [];

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);

    if (cart.length == 0) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <p className="text-xl mb-6">Je winkelwagen is leeg.</p>
                
                {!userId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Wil je bestellen?</h2>
                        <p className="text-zinc-700 mb-4">
                            Log in met je account of maak er een aan om je bestelling af te ronden.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <Link 
                                href="/user/login" 
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Inloggen
                            </Link>
                            <Link 
                                href="/user/register" 
                                className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                                Registreren
                            </Link>
                        </div>
                    </div>
                )}

                <Link href="/" className="text-blue-600 hover:underline">Verder winkelen</Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Winkelwagen</h1>

            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="pb-2 font-medium">Boek</th>
                        <th className="pb-2 font-medium">Prijs</th>
                        <th className="pb-2 font-medium">Aantal</th>
                        <th className="pb-2 font-medium">Subtotaal</th>
                        <th className="pb-2 font-medium"></th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map(item => ( //hierdoor loopt het door alles in cart, het generate een tr (table row) voor elke
                        <tr key={item.bookId} className="border-b">
                            <td className="py-2">{item.title}</td>
                            <td className="py-2">{formatCurrency(item.price_cents)}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">{formatCurrency(item.price_cents * item.quantity)}</td>
                            <td className="py-2">
                                <div className="flex gap-2">
                                    <form action={async () => {
                                        "use server";
                                        await updateCartQuantity(userId!, item.bookId, item.quantity - 1);
                                    }}>
                                        <button type="submit" className="px-2 py-1 bg-zinc-200 rounded">-</button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await updateCartQuantity(userId!, item.bookId, item.quantity + 1);
                                    }}>
                                        <button type="submit" className="px-2 py-1 bg-zinc-200 rounded">+</button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await removeFromCart(userId!, item.bookId);
                                    }}>
                                        <button type="submit" className="text-red-600 hover:underline">Verwijder</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-sm text-zinc-500">Aantal: {totalItems}</p>
                    <p className="text-xl font-bold">Totaal: {formatCurrency(totalPrice)}</p>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <form action={async () => {
                        "use server";
                        await clearCart(userId!);
                    }}>
                        <button type="submit" className="px-4 py-2 bg-zinc-200 rounded">Leegmaken</button>
                    </form>
                    {userId ? (
                        <Link href="/checkout" className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-700">
                            Afrekenen
                        </Link>
                    ) : (
                        <div className="flex gap-2">
                            <Link 
                                href="/user/login" 
                                className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-700"
                            >
                                Inloggen & afrekenen
                            </Link>
                            <Link 
                                href="/user/register" 
                                className="px-4 py-2 bg-zinc-200 text-zinc-900 rounded hover:bg-zinc-300"
                            >
                                Registreren
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
