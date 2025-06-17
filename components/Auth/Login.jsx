import React, { useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import "react-toastify/dist/ReactToastify.css"
import "swiper/css"
import "swiper/css/pagination"

import api from "../../src/api"
import { carouselItems } from "../../Utils/data.js"

const roleRoutes = {
  SuperAdmin: "/super-admin-dashboard",
  Admin: "/admin-dashboard",
  TeamLeader: "/team-leader-dashboard",
  User: "/user-dashboard",
}

const Login = () => {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.post("login/", credentials)
      const { status, message, ...data } = response.data

      if (status === "success") {
        const {
          firstname,
          username,
          usertype,
          email,
          user_id,
          access_token_expiry,
          access_token,
        } = data
        console.log("Received login response:", data)

        // Store in localStorage
        const localData = {
          firstname,
          username,
          usertype,
          email,
          user_id,
          access_token_expiry,
          access_token,
        }
        Object.entries(localData).forEach(([key, value]) =>
          localStorage.setItem(key, value)
        )

        toast.success("Login successful! Redirecting...", { autoClose: 1500 })

        setTimeout(() => {
          navigate(roleRoutes[usertype] || "/")
        }, 1500)

        setCredentials({ username: "", password: "" })
      } else {
        toast.error(message || "Login failed")
      }
    } catch (error) {
      if (error.response) {
        const err = error.response.data?.error
        const msg = error.response.data?.message
        if (err === "username_or_email") {
          toast.error("Username or Email is incorrect")
        } else if (err === "password") {
          toast.error("Password is incorrect")
        } else {
          toast.error(msg || "Something went wrong!")
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error("An unexpected error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ToastContainer />

      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        {/* Carousel Section */}
        <div className="w-full md:w-1/2 md:my-24">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full flex items-center justify-center"
          >
            {carouselItems.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="flex flex-col justify-center items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="md:w-100 md:h-100 w-50 h-50"
                  />
                  <h3 className="md:text-2xl font-bold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 md:mt-3 md:max-w-md max-w-sm md:px-0 px-6 md:py-0 py-8 text-center">
                    {item.description}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-6">
              Welcome Back
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please sign in to your account
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              autoComplete="on"
              method="POST"
              aria-label="Login Form"
            >
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Username or Email
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-4">
              Forgot your password?{" "}
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Reset here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl text-center w-72">
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Signing you in...
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Please wait while we authenticate you
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default Login
