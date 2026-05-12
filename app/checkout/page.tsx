import { getCart } from "@/app/cart/actions";
import { placeOrder } from "@/app/checkout/actions";
import { formatCurrency } from "@/app/format-currency";
import { redirect } from "next/navigation";

const userId = 1;

export default async function CheckoutPage() {
    const cart = await getCart(userId);

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price_cents * item.quantity,
        0
    );

    if (cart.length === 0) {
        redirect("/cart");
    }

    async function handlePlaceOrder(formData: FormData) {
        "use server";
        await placeOrder(formData, userId);
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                
                <h1 className="text-3xl font-bold mb-10">
                    Afrekenen
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT - FORM */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-lg font-semibold mb-6">
                            Bezorggegevens
                        </h2>

                        <form action={handlePlaceOrder} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="firstName"
                                    placeholder="Voornaam"
                                    required
                                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />

                                <input
                                    name="lastName"
                                    placeholder="Achternaam"
                                    required
                                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>

                            <input
                                name="email"
                                type="email"
                                placeholder="E-mailadres"
                                required
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />

                            <input
                                name="street"
                                placeholder="Straat & huisnummer"
                                required
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="postalCode"
                                    placeholder="Postcode"
                                    required
                                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />

                                <input
                                    name="city"
                                    placeholder="Stad"
                                    required
                                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>

                            <div className="pt-4">
                                <h3 className="text-sm font-semibold mb-2">
                                    Betaalmethode
                                </h3>

                                <select
                                    name="paymentMethod"
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                >
                                    <option value="ideal">iDEAL</option>
                                    <option value="creditcard">Creditcard</option>
                                    <option value="paypal">PayPal</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 bg-zinc-900 text-white p-3 rounded-lg font-semibold hover:bg-zinc-800 transition"
                            >
                                Bestelling plaatsen ({formatCurrency(totalPrice)})
                            </button>

                        </form>
                    </section>

                    {/* RIGHT - ORDER SUMMARY */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                        <h2 className="text-lg font-semibold mb-6">
                            Overzicht
                        </h2>

                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div
                                    key={item.bookId}
                                    className="flex justify-between text-sm"
                                >
                                    <span className="text-zinc-700">
                                        {item.quantity}x {item.title}
                                    </span>

                                    <span className="font-medium">
                                        {formatCurrency(
                                            item.price_cents * item.quantity
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t mt-6 pt-4 flex justify-between font-bold text-lg">
                            <span>Totaal</span>
                            <span>{formatCurrency(totalPrice)}</span>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}