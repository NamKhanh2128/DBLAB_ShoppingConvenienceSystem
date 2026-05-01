import { Outlet } from "react-router";

export function GuestLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
