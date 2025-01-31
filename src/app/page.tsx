"use client";

import { Navbar } from "../components/navbar";
import { SearchFilters } from "../components/search-filters";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const validateCredentials = async (email: string, password: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        router.push("/login");
      } else if (email === "info@trotamundo9.com") {
        setIsAdmin(true);
      }
    };

    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");

    if (!storedEmail || !storedPassword) {
      router.push("/login");
    } else {
      validateCredentials(storedEmail, storedPassword);
    }
  }, [router]);

  const handleSearch = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Compara y ahorra en tu próxima estadía
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Encuentra las mejores ofertas en Airbnb y Booking.com
            </p>
          </div>

          {isAdmin && (
            <div className="text-center">
              <a href="/admin" className="text-blue-500 underline">
                Panel de administración
              </a>
            </div>
          )}

          <SearchFilters onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
