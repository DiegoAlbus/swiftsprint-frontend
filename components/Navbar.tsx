"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/projects" className="text-xl font-bold">
              Swift Sprint
            </Link>
            <Link href="/projects" className="hover:text-green-200">
              Projects
            </Link>
            <Link href="/my-tasks" className="hover:text-green-200">
              My Tasks
            </Link>
          </div>
          <div className="flex items-center space-x-4 relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="hover:text-green-200 text-sm flex items-center space-x-1"
            >
              <span>{`${user?.name} (${user?.userIdentifier})`}</span>
              <span>▼</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-12 bg-white text-gray-800 rounded shadow-lg py-2 w-48 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
