import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../../src/api"

const Logout = () => {
  const navigate = useNavigate()

  const logoutUser = async () => {
    try {
      const response = await api.post("logout/")
      if (response.status === 200) {
        localStorage.clear()
        toast.success("Successfully logged out!")
        setTimeout(() => {
          navigate("/")
        }, 2000)
      } else {
        toast.error("Logout failed!")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error during logout!")
    }
  }

  useEffect(() => {
    logoutUser()
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white px-10 py-8 rounded-2xl shadow-2xl text-center w-80 animate-fadeIn">
        <div className="flex justify-center mb-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Signing you out...
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          We're securely logging you out. Please wait.
        </p>
      </div>
    </div>
  )
}

export default Logout
