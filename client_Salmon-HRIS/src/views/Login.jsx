import { useState } from "react"
import axios from 'axios'
import baseUrl from "../constant/url.js"
import { useNavigate } from "react-router"
import { toast } from 'react-toastify';
import logoNavbar from '../assets/logo-navbar.png'
import backgroundImage from '../assets/background.png'
import Button from '../components/button-reusable.jsx'

export default function Login() {

  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const navigate = useNavigate()

  async function handleLogin(event) {
    event.preventDefault()  
    try {
      const {data} = await axios.post(`${baseUrl}/login`, {
        email,
        password
      })
      
      // Simpan token dan user data sebagai JSON object
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user)) // Simpan sebagai JSON object
      
      toast.success(`Login berhasil! Selamat datang, ${data.user.name}`)
      
      // Redirect berdasarkan role
      if (data.user.role === "ADMIN") {
        navigate("/admin")
      } else {
        navigate("/employee")
      }
    } catch (error) {
      console.error("Login failed:", error)
      toast.error(error.response?.data?.message || "Login gagal. Periksa email dan password Anda.")
    } 
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >

      <div className="relative z-10">
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 backdrop-blur-sm px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <img
              src={logoNavbar}
              alt="Museum Soeharto Logo"
              className="h-12 drop-shadow-md"
            />
            <span className="text-[#d4af37] font-bold text-2xl tracking-wide drop-shadow-md"></span>
          </div>
        </nav>
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-2 border-amber-200">

          <div className="flex flex-col items-center mb-8">

            <h1 className="text-3xl font-extrabold text-amber-900 mb-2">
              Login
            </h1>
            <p className="text-amber-700 text-sm">Human Resource Information System</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-amber-900 font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                type="email"
                id="email"
                placeholder="Masukkan email Anda"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-amber-900 font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                type="password"
                id="password"
                placeholder="Masukkan password Anda"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button nameProp="Masuk" type="submit" variant="primary" />
          </form>

        </div>
      </main>

      <footer className="mt-auto bg-transparent py-4">
        <p className="text-center text-amber-800 text-sm">© 2026 Salmon HRIS. All rights reserved.</p>
      </footer>
    </div>
  );
}
