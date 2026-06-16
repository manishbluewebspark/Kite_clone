import AdminSideHoldings from "./AdminSideHoldings";
import UserSideHoldings from "./UserSideHoldings";
import { useAuthStore } from "../../store/useAuthStore";

export default function Holdings() {
    const { user } = useAuthStore();
    const role = user?.role;
    return (
        <>
            {role === "admin" ? <AdminSideHoldings /> : <UserSideHoldings />}
        </>
    )
}