"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminControl() {
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail !== "info@trotamundo9.com") {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, [router]);

  const fetchUsers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users`
    );
    const data = await response.json();
    const filteredUsers = data.filter(
      (user) => user.email !== "info@trotamundo9.com"
    );
    setUsers(filteredUsers);
  };

  const deleteUser = async (email) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users?email=${encodeURIComponent(
        email
      )}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      fetchUsers(); // Refresh the user list
    } else {
      const errorData = await response.json(); // Get the error message from the response
      console.error("Failed to delete user:", errorData.message); // Log the error message
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    });

    if (res.ok) {
      setNewEmail("");
      setNewPassword("");
      fetchUsers(); // Refresh the user list after registration
    } else {
      const data = await res.json();
      setRegistrationError(data.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Panel de administración</h1>
      <form onSubmit={handleRegister} className="mb-4">
        <h2 className="text-xl font-semibold">Registrar nuevo usuario</h2>
        {registrationError && (
          <div className="bg-red-200 text-red-800 p-2 rounded mb-2">
            {registrationError}
          </div>
        )}
        <div className="mb-2">
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-2">
          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Registrar nuevo usuario
        </button>
      </form>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => deleteUser(user.email)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
