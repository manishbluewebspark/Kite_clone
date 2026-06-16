// import AdminDashboard from "./dashboaard/AdminDashboard";
// import UserDashboard from "./dashboaard/UserDashboard";
// import { useAuthStore } from "../store/useAuthStore";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const role = useAuthStore((state) => state.role);
//   const navigate = useNavigate();

//   if (!role) {
//     navigate("/login");
//     return null;
//   }

//   switch (role) {
//     case "admin":
//       return <AdminDashboard />;
//     case "user":
//       return <UserDashboard />;
//     default:
//       return <div>Unauthorized</div>;
//   }
// }

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

import AdminDashboard from "./dashboaard/AdminDashboard";
import UserDashboard from "./dashboaard/UserDashboard";

export default function Dashboard() {
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();

  const roleAccess: any = {
    admin: <AdminDashboard />,
    user: <UserDashboard />,
  };

  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  if (!role) return null;

  return roleAccess[role] || <div>No Access</div>;
}