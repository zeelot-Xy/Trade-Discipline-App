import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_40%,_#111827_100%)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 lg:px-6 lg:pb-10 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
