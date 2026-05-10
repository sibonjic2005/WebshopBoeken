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

    // De server action koppelen aan een lokale functie zodat we userId mee kunnen geven
    async function handlePlaceOrder(formData: FormData) {
        "use server";
        await placeOrder(formData, userId);
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Afrekenen</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Bezorggegevens</h2>
                    <form action={handlePlaceOrder} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input name="firstName" placeholder="Voornaam" required className="p-2 border rounded" />
                            <input name="lastName" placeholder="Achternaam" required className="p-2 border rounded" />
                        </div>
                        <input name="email" type="email" placeholder="E-mailadres" required className="p-2 border rounded" />
                        <input name="street" placeholder="Straat & huisnummer" required className="p-2 border rounded" />
                        <div className="grid grid-cols-2 gap-4">
                            <input name="postalCode" placeholder="Postcode" required className="p-2 border rounded" />
                            <input name="city" placeholder="Stad" required className="p-2 border rounded" />
                        </div>

                        <h2 className="text-xl font-semibold mt-4 mb-2">Betaalmethode</h2>
                        <select name="paymentMethod" className="p-2 border rounded">
                            <option value="ideal">iDEAL</option>
                            <option value="creditcard">Creditcard</option>
                            <option value="paypal">PayPal</option>
                        </select>

                        <button type="submit" className="mt-6 w-full bg-zinc-900 text-white p-3 rounded font-bold hover:bg-zinc-700">
                            Bestelling plaatsen ({formatCurrency(totalPrice)})
                        </button>
                    </form>
                </section>

                <section className="bg-zinc-50 p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-semibold mb-4">Overzicht</h2>
                    <ul className="divide-y divide-zinc-200">
                        {cart.map(item => (
                            <li key={item.bookId} className="py-3 flex justify-between">
                                <span>{item.quantity}x {item.title}</span>
                                <span className="font-medium">{formatCurrency(item.price_cents * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-zinc-300 mt-4 pt-4 flex justify-between font-bold text-lg">
                        <span>Totaal</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                </section>
            </div>
        </div>
    );
}