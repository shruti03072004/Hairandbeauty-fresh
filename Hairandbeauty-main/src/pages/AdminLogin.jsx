import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const AdminLogin = () => {
    const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value })

const submit = async (e) => {
  e.preventDefault()
  setError("")

  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    const data = await res.json()

    if (!res.ok || !data.token) {
      throw new Error("Login failed")
    }

    localStorage.setItem("adminToken", data.token)

    // 🔥 THIS WAS MISSING
    navigate("/admin/panel")

  } catch {
    setError("Invalid credentials")
  }
}




  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F1E9]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#3D217F]">
          Admin Login
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={credentials.username}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded focus:ring-2 focus:ring-[#DDB892] focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded focus:ring-2 focus:ring-[#DDB892] focus:outline-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#DDB892] text-white rounded font-semibold hover:scale-105 transition-transform"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
