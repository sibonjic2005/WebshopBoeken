"use client";

import { useState, useEffect } from "react";
import { getCart, removeFromCart, updateCartQuantity, clearCart } from "./actions";

interface CartItem {
    bookId: number;
    title: string;
    price_cents: number;
    quantity: number;
}

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [userId, setUserId] = useState<number>(1); // Hardcoded for now
    const [loading, setLoading] = useState(true);

    // Load cart on page load
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const items = await getCart(userId);
            setCart(items);
        } catch (error) {
            console.error("Failed to load cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (bookId: number) => {
        await removeFromCart(userId, bookId);
        setCart(cart.filter(item => item.bookId !== bookId));
    };

    const handleUpdateQuantity = async (bookId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        await updateCartQuantity(userId, bookId, newQuantity);
        setCart(cart.map(item =>
            item.bookId === bookId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const handleClearCart = async () => {
        await clearCart(userId);
        setCart([]);
    };

    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);
    const totalPriceFormatted = (totalPrice / 100).toFixed(2);

    if (loading) {
        return <p className="p-8">Loading cart...</p>;
    }

    if (cart.length === 0) {
        return (
            <div className="p-8 bg-white rounded">
                <p className="text-xl mb-4">Your cart is empty</p>
                <a href="/" className="text-blue-600 underline">Continue shopping</a>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded">
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

            <table className="w-full border-collapse mb-8">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-2">Book</th>
                        <th className="text-left p-2">Price</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Subtotal</th>
                        <th className="text-left p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map(item => (
                        <tr key={item.bookId} className="border-b">
                            <td className="p-2">{item.title}</td>
                            <td className="p-2">€{(item.price_cents / 100).toFixed(2)}</td>
                            <td className="p-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateQuantity(item.bookId, item.quantity - 1)}
                                        className="bg-gray-200 px-2 py-1 rounded"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 py-1">{item.quantity}</span>
                                    <button
                                        onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                                        className="bg-gray-200 px-2 py-1 rounded"
                                    >
                                        +
                                    </button>
                                </div>
                            </td>
                            <td className="p-2">€{((item.price_cents * item.quantity) / 100).toFixed(2)}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => handleRemove(item.bookId)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mb-6 p-4 bg-gray-100 rounded">
                <div>
                    <p className="text-lg">Total Items: {totalItems}</p>
                    <p className="text-2xl font-bold">Total: €{totalPriceFormatted}</p>
                </div>
                <button
                    onClick={handleClearCart}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Clear Cart
                </button>
            </div>

            <div className="flex gap-4">
                <a href="/" className="bg-gray-600 text-white px-6 py-2 rounded">
                    Continue Shopping
                </a>
                <a href="/checkout" className="bg-blue-600 text-white px-6 py-2 rounded">
                    Proceed to Checkout
                </a>
            </div>
        </div>
    );
}
