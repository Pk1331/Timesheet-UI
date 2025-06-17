import React, { useState, useEffect, useRef } from "react"
import { Popover } from "@mui/material"
import { FaBell, FaTimes } from "react-icons/fa"
import { FiCheckCircle } from "react-icons/fi"
import api from "../../src/api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

const NotificationPopover = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState([])
  const audioRef = useRef(null)
  const socketRef = useRef(null)

  dayjs.extend(relativeTime)

  const userId = localStorage.getItem("user_id")
  const accessToken = localStorage.getItem("access_token")

  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  const fetchNotifications = async () => {
    try {
      const response = await api.get("notifications/")
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.notifications || []
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.patch(`notifications/${id}/mark-as-read/`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const clearReadNotifications = async () => {
    try {
      await api.delete("notifications/delete-read/")
      setNotifications((prev) => prev.filter((n) => !n.is_read))
    } catch (error) {
      console.error("Failed to clear read notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    const audio = new Audio("/notification.mp3")
    audioRef.current = audio

    // Preload audio to bypass autoplay restrictions
    const unlockAudio = () => {
      audio
        .play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
        })
        .catch((err) => {
          console.warn("🔇 Audio preload error:", err)
        })
    }

    document.addEventListener("click", unlockAudio, { once: true })

    return () => {
      document.removeEventListener("click", unlockAudio)
    }
  }, [])

  useEffect(() => {
    if (userId && accessToken && !socketRef.current) {
      // const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/?token=${accessToken}`
      const wsUrl = `wss://timesheet-backend-4bj0.onrender.com/ws/notifications/${userId}/?token=${accessToken}`
      console.log("🔌 Connecting to WebSocket:", wsUrl)

      const socket = new WebSocket(wsUrl)
      socketRef.current = socket

      socket.onopen = () => {
        console.log("🔌 WebSocket connected.")
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setNotifications((prev) => [data, ...prev])

        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("🔇 Notification sound failed:", err)
          })
        }
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      socket.onclose = () => {
        console.log("🔌 WebSocket disconnected.")
        socketRef.current = null
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [userId, accessToken])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="relative mr-4">
      <div className="cursor-pointer relative" onClick={handleBellClick}>
        <FaBell className="text-gray-700 text-2xl hover:text-black transition" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-md">
            {unreadCount}
          </span>
        )}
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          style: {
            width: "360px",
            maxHeight: "480px",
            padding: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        <div className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
          <h3 className="text-md font-bold text-gray-800">Notifications</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black"
          >
            <FaTimes />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto bg-gray-50 divide-y">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              🎉 You're all caught up!
            </div>
          ) : (
            [...notifications]
              .sort((a, b) => {
                if (a.is_read === b.is_read) {
                  return new Date(b.created_at) - new Date(a.created_at)
                }
                return a.is_read ? 1 : -1
              })
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`flex justify-between items-start gap-2 p-4 transition hover:bg-gray-100 ${
                    notification.is_read
                      ? "bg-white text-gray-500"
                      : "bg-blue-50"
                  }`}
                >
                  <div className="flex-1">
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: notification.message,
                      }}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {dayjs(notification.created_at).fromNow()}
                    </div>
                  </div>
                  {!notification.is_read ? (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Mark as read
                    </button>
                  ) : (
                    <FiCheckCircle className="text-green-400 mt-1" />
                  )}
                </div>
              ))
          )}
        </div>

        <div className="px-4 py-3 border-t bg-white flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {notifications.filter((n) => n.is_read).length} read message
            {notifications.filter((n) => n.is_read).length !== 1 && "s"}
          </span>
          <button
            onClick={clearReadNotifications}
            disabled={!notifications.some((n) => n.is_read)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition duration-150
              ${
                notifications.some((n) => n.is_read)
                  ? "bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            Clear Read
          </button>
        </div>
      </Popover>
    </div>
  )
}

export default NotificationPopover
