import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { User, Heart, Star, FileText, LogOut } from "lucide-react";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <>
      <header className="border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            CollegeMatch
          </Link>

          <div className="flex gap-4 items-center">
            <Link to="/colleges" className="text-sm font-medium hover:text-blue-600">
              Colleges
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow"
                >
                  {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border z-50 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 bg-blue-50 border-b">
                      <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/profile#saved"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-red-500" />
                        Saved Colleges
                      </Link>

                      <Link
                        to="/profile#recommended"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Star className="w-4 h-4 text-yellow-500" />
                        Recommended
                      </Link>

                      <Link
                        to="/profile#applied"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-green-500" />
                        Applied Colleges
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => setAuthOpen(true)}>
                Login / Register
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}