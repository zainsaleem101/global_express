import * as React from "react";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export function Navbar() {
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    // Redirect to login page
    window.location.href = "/login"; // Use window.location.href to navigate
  };

  return (
    <nav className="border-b bg-white flex justify-between items-center p-4">
      <div className="flex items-center">
        <Home className="h-6 w-6" />
        <span className="font-bold text-xl">Buscador de Propiedades</span>
      </div>
      <Button onClick={handleLogout} className="bg-red-500 text-white">
        Logout
      </Button>
    </nav>
  );
}
