import React, { useEffect, useState } from "react"
import { Send, Paperclip } from "lucide-react"
import Select from "react-select"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Lottie from "lottie-react"
import loaderAnimation from "../../src/assets/myloader2.json"
import api from "../../src/api"

const SendTelegram = () => {
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [message, setMessage] = useState("")
  const [file, setFile] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("all-users/")
        const options = res.data.users.map((u) => ({
          value: u.id,
          label: u.username,
        }))
        setUsers(options)
      } catch (err) {
        toast.error("Failed to fetch users")
      }
    }

    fetchUsers()
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()

    if (!message.trim() || selectedUsers.length === 0) {
      toast.warn("Please select users and enter a message.")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("users", JSON.stringify(selectedUsers.map((u) => u.value)))
    formData.append("message", message)
    if (file) {
      formData.append("file", file)
    }

    try {
      await api.post("send-telegram/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Message sent successfully!")
      setMessages((prev) => [
        {
          id: Date.now(),
          sender: "You",
          text: message,
          to: selectedUsers.map((u) => u.label).join(", "),
        },
        ...prev,
      ])
      setSelectedUsers([])
      setMessage("")
      setFile(null)
    } catch (err) {
      toast.error("Failed to send message.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <ToastContainer />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-semibold mb-8 text-center text-blue-800">
          PulsePoint
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Panel - Compose */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Compose a Message
            </h2>

            <form onSubmit={handleSend} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Users
                </label>
                <Select
                  isMulti
                  options={users}
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  className="text-sm"
                  placeholder="Choose recipients..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  placeholder="Type your message here..."
                  className="w-full rounded-lg border border-gray-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3">
                <label className="flex items-center gap-2 cursor-pointer text-blue-600">
                  <Paperclip className="w-5 h-5" />
                  <span className="text-sm">Attach File</span>
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
                {file && (
                  <span className="text-sm text-gray-600">
                    {file.name}
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="ml-2 text-red-500 hover:underline"
                    >
                      remove
                    </button>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>

          {/* Right Panel - Recent Messages (Coming Soon) */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center min-h-[200px]">
            <div className="text-center text-gray-500 animate-fade-in">
              <h2 className="text-xl font-bold mb-2 text-gray-700">
                Recent Messages
              </h2>
              <p className="text-sm animate-pulse text-gray-500">
                This feature is coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-40 z-50 flex justify-center items-center">
          <Lottie animationData={loaderAnimation} loop className="w-40" />
        </div>
      )}
    </div>
  )
}

export default SendTelegram
