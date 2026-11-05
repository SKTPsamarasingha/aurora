export type AdminPermission =
    | "manage_orders"
    | "manage_products"
    | "manage_categories"
    | "manage_users"
    | "view_analytics"
    | "manage_settings";

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    permission?: AdminPermission; // Required permission to view this link
    badge?: string | number;
}