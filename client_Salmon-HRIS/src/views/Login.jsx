import { useState } from "react"
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import baseUrl from "../shared/config/url.js"
import { useNavigate } from "react-router"

const LANDING_URL = import.meta.env.VITE_LANDING_URL ?? 'http://localhost:3005'
import { toast } from 'react-toastify';
import logoNavbar from '../assets/logo-navbar.png'
import backgroundImage from '../assets/background.png'
import Button from '../shared/components/button-reusable.jsx'

export default function Login() {

  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const[showPassword, setShowPassword] = useState(false)
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
      
      // Simpan company data jika ada
      if (data.user.company) {
        localStorage.setItem("company", JSON.stringify(data.user.company))
      }
      
      toast.success(`Login successful! Welcome, ${data.user.name}`, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      })
      
      // Redirect berdasarkan role
      if (data.user.role === "SUPER_ADMIN") {
        navigate("/super-admin")
      } else if (data.user.role === "COMPANY_ADMIN") {
        navigate("/admin")
      } else {
        navigate("/employee")
      }
    } catch (error) {
      console.error("Login failed:", error)
      
      // Extract error message
      let errorMessage = "Login failed. An unexpected error occurred."

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Invalid email or password!"
        } else if (error.response.status === 401) {
          errorMessage = "Invalid email or password!"
        } else if (error.response.status === 404) {
          errorMessage = "Account not found!"
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later."
        } else {
          errorMessage = error.response.data?.message || "An error occurred on the server."
        }
      } else if (error.request) {
        errorMessage = "Unable to connect to server. Please check your internet connection."
      }
      
      toast.error(errorMessage, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      })
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
          <button
            onClick={() => { window.location.href = LANDING_URL }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Home
          </button>
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
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-amber-900 font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all pr-12"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 text-xl"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button nameProp="Sign In" type="submit" variant="primary" />
          </form>

          <p className="text-center text-sm text-amber-700 mt-6">
            <button
              onClick={() => { window.location.href = LANDING_URL }}
              className="inline-flex items-center gap-1.5 hover:text-amber-900 hover:underline transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>
          </p>

        </div>
      </main>

      <footer className="mt-auto bg-transparent py-4">
        <p className="text-center text-amber-800 text-sm">© 2026 Salmon HRIS. All rights reserved.</p>
      </footer>
    </div>
  );
}
