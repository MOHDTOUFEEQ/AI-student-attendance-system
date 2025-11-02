import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear token
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md w-full px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-900">
        InClass AI
      </div>

      <div className="flex space-x-4">
        <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-900 font-medium transition"
            >
            Home
            </Link>
             <Link
            to="/image"
            className="px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-900 font-medium transition"
            >
            Image
            </Link>
            <Link
            to="/video"
            className="px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-900 font-medium transition"
            >
            Video
            </Link>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
