import { getCart } from "@/app/cart/actions";
import { placeOrder } from "@/app/checkout/actions";
import { formatCurrency } from "@/app/format-currency";
import { redirect } from "next/navigation";

const userId = 1; // Hardcoded voor nu

export default async function CheckoutPage() {
    const cart = await getCart(userId);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);

    // Als de mand leeg is, stuur ze terug naar de cart
    if (cart.length === 0) {
        redirect("/cart");
    }

    async function handlePlaceOrder(formData: FormData) {
        "use server";
        await placeOrder(formData, userId);
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                    <form action={handlePlaceOrder} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input name="firstName" placeholder="First Name" required className="p-2 border rounded dark:bg-zinc-800" />
                            <input name="lastName" placeholder="Last Name" required className="p-2 border rounded dark:bg-zinc-800" />
                        </div>
                        <input name="email" type="email" placeholder="Email" required className="p-2 border rounded dark:bg-zinc-800" />
                        <input name="street" placeholder="Street & House Number" required className="p-2 border rounded dark:bg-zinc-800" />
                        <div className="grid grid-cols-2 gap-4">
                            <input name="postalCode" placeholder="Postal Code" required className="p-2 border rounded dark:bg-zinc-800" />
                            <input name="city" placeholder="City" required className="p-2 border rounded dark:bg-zinc-800" />
                        </div>
                        
                        <h2 className="text-xl font-semibold mt-4 mb-2">Payment Method</h2>
                        <select name="paymentMethod" className="p-2 border rounded dark:bg-zinc-800">
                            <option value="ideal">iDEAL</option>
                            <option value="creditcard">Credit Card</option>
                            <option value="paypal">PayPal</option>
                        </select>

                        <button type="submit" className="mt-6 w-full bg-zinc-900 text-white p-3 rounded font-bold hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
                            Place Order ({formatCurrency(totalPrice)})
                        </button>
                    </form>
                </section>

                <section className="bg-zinc-50 p-6 rounded-lg dark:bg-zinc-900 h-fit">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {cart.map(item => (
                            <li key={item.bookId} className="py-3 flex justify-between">
                                <span>{item.quantity}x {item.title}</span>
                                <span className="font-medium">{formatCurrency(item.price_cents * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-zinc-300 dark:border-zinc-700 mt-4 pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                </section>
            </div>
        </div>
    );
}