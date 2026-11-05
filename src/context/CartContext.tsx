"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/src/types/products";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = "aurora_shopping_cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // 1. Load cart from localStorage on initial client-side render
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Failed to load cart from localStorage:", error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // 2. Save cart to localStorage whenever cart state updates
    useEffect(() => {
        if (!isInitialized) return;

        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }, [cart, isInitialized]);

    const addToCart = (product: Product, quantity = 1) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item.product.id === product.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                return updated;
            }
            return [...prev, { product, quantity }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.product.id === productId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter((item): item is CartItem => item !== null)
        );
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}