import { Outlet } from "react-router-dom";
import Navbar from "./pages/Navbar";

export default function ProtectedLayout() {
  return (
    <div>
      <Navbar /> {/* Navbar always on top */}
      <div className="min-h-screen bg-gray-100 ">
        <Outlet /> {/* This renders the child routes */}
      </div>
    </div>
  );
}
