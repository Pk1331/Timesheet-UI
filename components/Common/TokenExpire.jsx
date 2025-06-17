import React, { useState, useEffect, useRef } from "react"
import { FaClock } from "react-icons/fa"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../../src/api"

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"

const TokenExpire = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [extendTimer, setExtendTimer] = useState(30)
  const [expiryTime, setExpiryTime] = useState(
    localStorage.getItem("access_token_expiry")
  )
  const [openPopup, setOpenPopup] = useState(false)
  const [hasLoggedOut, setHasLoggedOut] = useState(false)

  const countdownInterval = useRef(null)
  const popupShownRef = useRef(false)
  const popupOnceOnly = useRef(false)
  const tickSoundRef = useRef(null)
  const navigate = useNavigate()

  const getTimeLeft = (expiryTimeStr) => {
    const now = Date.now()
    const expiry = new Date(expiryTimeStr.replace(" ", "T")).getTime()
    const diff = expiry - now
    return diff > 0 ? diff : 0
  }

  const formatTime = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return { days, hours, minutes, seconds }
  }

  const logoutUser = async () => {
    if (hasLoggedOut) return
    setHasLoggedOut(true)

    try {
      const response = await api.post("logout/")
      if (response.status === 200) {
        toast.success("Successfully logged out!")
      } else {
        toast.warn("Session expired or already logged out.")
      }
    } catch (error) {
      console.warn("Logout error (possibly due to expired session):", error)
    } finally {
      localStorage.clear()
      navigate("/")
    }
  }

  const handleLogout = () => {
    clearInterval(countdownInterval.current)
    stopTickSound()
    logoutUser()
  }

  const handleClosePopup = () => {
    clearInterval(countdownInterval.current)
    setOpenPopup(false)
    setExtendTimer(30)
    stopTickSound()
  }

  const handleExtendSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}token/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("access_token_expiry", data.access_token_expiry)
        setExpiryTime(data.access_token_expiry)
        popupShownRef.current = false
        popupOnceOnly.current = false
        handleClosePopup()
        toast.success("Session extended successfully!")
      } else {
        handleLogout()
      }
    } catch (error) {
      console.error("Extend session error:", error)
      handleLogout()
    }
  }

  const playTickSound = () => {
    if (tickSoundRef.current) {
      tickSoundRef.current.loop = true
      tickSoundRef.current
        .play()
        .catch((err) => console.warn("Tick sound error:", err))
    }
  }

  const stopTickSound = () => {
    if (tickSoundRef.current) {
      tickSoundRef.current.pause()
      tickSoundRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    if (!expiryTime) return

    const updateTimeLeft = () => {
      const timeRemaining = getTimeLeft(expiryTime)
      const formatted = formatTime(timeRemaining)
      setTimeLeft(formatted)

      if (timeRemaining <= 0) {
        handleLogout()
        return
      }

      if (
        timeRemaining <= 2 * 60 * 1000 &&
        !popupShownRef.current &&
        !popupOnceOnly.current
      ) {
        popupShownRef.current = true
        popupOnceOnly.current = true
        setOpenPopup(true)
        playTickSound()

        let timer = 60 
        setExtendTimer(timer)
        countdownInterval.current = setInterval(() => {
          timer -= 1
          setExtendTimer(timer)
          if (timer <= 0) {
            clearInterval(countdownInterval.current)
            setOpenPopup(false)
            stopTickSound()
          }
        }, 1000)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [expiryTime])

  return (
    <div className="flex justify-start items-center space-x-2">
      <FaClock className="text-black text-lg" />
      <div className="text-sm text-black font-medium">
        {timeLeft.minutes}m {timeLeft.seconds}s left
      </div>

      {/* Tick Sound */}
      <audio ref={tickSoundRef} src="/clock.mp3" preload="auto" />

      {/* Extend Session Popup */}
      <Dialog
        open={openPopup}
        onClose={handleClosePopup}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">Session Expiring Soon</DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            <p className="text-center">
              Your session will expire in less than 2 minutes.
              <br />
              You have <strong>1 minute</strong> to extend your session.
            </p>
            <div className="relative w-24 h-24 border-4 border-gray-300 rounded-full flex items-center justify-center">
              <div
                className="absolute w-24 h-24 rounded-full border-4 border-blue-500"
                style={{
                  clipPath: "inset(0 0 0 50%)",
                  transform: `rotate(${(60 - extendTimer) * 6}deg)`, // 360/60 = 6 degrees per second
                  transformOrigin: "center center",
                }}
              />
              <span className="text-lg font-semibold">{extendTimer}s</span>
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClosePopup} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleExtendSession} color="primary" autoFocus>
            Extend Session
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default TokenExpire
