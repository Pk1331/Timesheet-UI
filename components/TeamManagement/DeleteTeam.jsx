import { Button } from "@mui/material"
import api from "../../src/api"
import Lottie from "lottie-react"
import { useState } from "react"
import loaderAnimation from "../../src/assets/myloader2.json"

const DeleteTeam = ({ teamId, fetchTeams, closeMenu, showToast }) => {
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`teams/${teamId}/delete/`)
      showToast("Team deleted successfully!")
      closeMenu()
      await fetchTeams()
    } catch (error) {
      showToast("Failed to delete team", "error")
      console.error("Error deleting team:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={handleDelete} color="secondary">
        Delete
      </Button>

      {loading && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 w-full">
          <Lottie
            animationData={loaderAnimation}
            loop
            className="w-2/4 h-2/4"
          />
        </div>
      )}
    </>
  )
}

export default DeleteTeam
