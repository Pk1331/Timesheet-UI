import React, { useState, useEffect } from "react"
import api from "../../src/api"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaCheck, FaTimes } from "react-icons/fa"
import Lottie from "lottie-react"
import loaderAnimation from "../../src/assets/myloader2.json"

const AdminReviewTimesheet = () => {
  const [groupedTimesheets, setGroupedTimesheets] = useState({})
  const [rejectingGroup, setRejectingGroup] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTimesheetsPendingReview()
  }, [])

  // fetching Pending Timesheets for Review
  const fetchTimesheetsPendingReview = async () => {
    try {
      const response = await api.get("timesheets/pending-review/")
      setGroupedTimesheets(response.data.grouped_timesheets || {})
    } catch (error) {
      console.error("Error fetching timesheets:", error)
    }
  }
 
  // Sending Approve or Rejection to Backend
  const handleReview = async (timesheetIds, action, feedback = "") => {
    setLoading(true)
    try {
      await api.post("timesheets/admin-review/", {
        timesheet_ids: timesheetIds,
        action,
        feedback,
      })
      toast.success(`Timesheets ${action}d successfully!`)
      fetchTimesheetsPendingReview()
      setRejectingGroup(null)
      setFeedback("")
    } catch (error) {
      console.error(`Error ${action}ing timesheets:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 min-h-screen">
      <ToastContainer />
      <h3 className="text-2xl font-bold mb-4">Timesheets Pending Review</h3>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="w-full sm:w-1/3 p-2 border rounded-md"
        />
      </div>

      {Object.keys(groupedTimesheets).length === 0 ? (
        <div className="text-center text-gray-500">
          No timesheets pending review.
        </div>
      ) : (
        Object.entries(groupedTimesheets).map(([date, users]) =>
          Object.entries(users)
            .filter(([username]) => username.toLowerCase().includes(searchTerm))
            .map(([username, timesheets]) => {
              const timesheetIds = timesheets.map((ts) => ts.id)
              return (
                <div
                  key={`${date}-${username}`}
                  className="mb-6 bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="mb-2 font-semibold">
                    <span className="text-blue-600">Date:</span> {date}{" "}
                    &nbsp;|&nbsp;
                    <span className="text-green-600">User:</span> {username}{" "}
                    &nbsp;|&nbsp;
                    <span className="text-purple-600">Submitted At:</span>{" "}
                    {new Date(timesheets[0]?.submitted_at).toLocaleString()}
                  </div>

                  {/* Timsheet Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-4 py-2 border">Date</th>
                          <th className="px-4 py-2 border">Project</th>
                          <th className="px-4 py-2 border">Task</th>
                          <th className="px-4 py-2 border">Description</th>
                          <th className="px-4 py-2 border">Department</th>
                          <th className="px-4 py-2 border">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timesheets.map((ts) => (
                          <tr key={ts.id} className="hover:bg-gray-100">
                            <td className="border px-4 py-2">{ts.date}</td>
                            <td className="border px-4 py-2">{ts.project}</td>
                            <td className="border px-4 py-2">{ts.task}</td>
                            <td className="border px-4 py-2">
                              {ts.description}
                            </td>
                            <td className="border px-4 py-2">
                              {ts.department}
                            </td>
                            <td className="border px-4 py-2">{ts.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      className="bg-green-500 text-white p-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition duration-300"
                      onClick={() => handleReview(timesheetIds, "approve")}
                    >
                      <FaCheck />
                      <span>Approve</span>
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-lg flex items-center space-x-2 hover:bg-red-600 transition duration-300"
                      onClick={() => setRejectingGroup({ timesheetIds })}
                    >
                      <FaTimes />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )
            })
        )
      )}

      {/* Rejecting Feeback Popup */}
      {rejectingGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/5">
            <h3 className="text-xl font-bold mb-4">Reject Timesheets</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="border p-2 rounded w-full mb-4"
              placeholder="Enter feedback"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setRejectingGroup(null)}
                className="bg-gray-500 text-white p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleReview(rejectingGroup.timesheetIds, "reject", feedback)
                }
                className="bg-red-500 text-white p-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50">
          <Lottie
            animationData={loaderAnimation}
            loop
            className="w-2/4 h-2/4"
          />
        </div>
      )}
    </div>
  )
}

export default AdminReviewTimesheet
