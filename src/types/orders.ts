export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
    country: string;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    currency: string;
    status: "pending" | "crafting" | "quality_check" | "ready_for_dispatch" | "shipped" | "delivered" | "cancelled";
    notes?: string;
    createdAt: string;
}
