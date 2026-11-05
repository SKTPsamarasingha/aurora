import { headers } from "next/headers";

export async function validateOwnership(
    targetOwnerId: string,
    resourceName: string
): Promise<boolean> {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");
    const role = headerList.get("x-user-role");
    const permissionsJson = headerList.get("x-user-permissions");

    if (!userId) return false;
    if (role === "superadmin") return true;

    const permissions: string[] = permissionsJson ? JSON.parse(permissionsJson) : [];

    // Check global privileges (e.g., orders.readAll, orders.update)
    const hasGlobalPermission = permissions.some(
        (p) => p === `${resourceName}.readAll` || p === `${resourceName}.update` || p === `${resourceName}.cancel`
    );

    if (hasGlobalPermission) return true;

    // Check scoped ownership privileges (e.g., orders.cancelOwn, orders.readOwn) combined with ID match
    const isOwner = userId === targetOwnerId;
    if (!isOwner) return false;

    const hasOwnPermission = permissions.some(
        (p) => p.endsWith("Own") && p.startsWith(resourceName)
    );

    return hasOwnPermission;
}