import React, { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import api from "../../src/api"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaComment,
  FaCalendarAlt,
} from "react-icons/fa"
import EditTimesheetTable from "./EditTimesheetTable"
import Lottie from "lottie-react"
import loaderAnimation from "../../src/assets/myloader2.json"

const TimesheetList = () => {
  const [timesheetTables, setTimesheetTables] = useState({
    date: "",
    timesheets: [],
  })
  const [editingTable, setEditingTable] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewingComments, setViewingComments] = useState(null)
  const [comments, setComments] = useState("")
  const [usertype, setUsertype] = useState("")

  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")
    setUsertype(usertypeParam)
    fetchTimesheetTables()
  }, [selectedDate])

  // Fetch timesheet tables based on selected date
  const fetchTimesheetTables = async () => {
    try {
      const formattedDate = selectedDate.toLocaleDateString("en-CA")
      const response = await api.get("timesheets/view/", {
        params: {
          date: formattedDate,
        },
      })
      setTimesheetTables(response.data.timesheet_table || [])
    } catch (error) {
      console.error("Error fetching timesheet tables:", error)
    }
  }

  // Handling Delete Operation
  const handleDeleteAll = async (timesheets) => {
    try {
      const ids = timesheets.map((ts) => ts.id)
      await api.post(`/timesheets/bulk-delete/`, { ids })
      toast.success("All timesheets deleted successfully!")
      fetchTimesheetTables()
    } catch (error) {
      toast.error("Failed to delete all timesheets!")
      console.error("Error deleting timesheets:", error)
    }
  }

  // Handling Sent Timsheets to Review
  const handleSendForReviewAll = async (timesheets) => {
    setLoading(true)
    const timesheetIds = timesheets.map((ts) => ts.id)
    try {
      await api.post("timesheets/send-for-review/", {
        timesheet_ids: timesheetIds,
      })
      toast.success("Timesheets sent for review successfully!")
      fetchTimesheetTables()
    } catch (err) {
      toast.error("Failed to send timesheets for review.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // For Buttons Visibility based on the Status
  const firstStatus =
    timesheetTables.timesheets.length > 0
      ? timesheetTables.timesheets[0].status
      : null

  const canEditDeleteSend =
    firstStatus === "Draft" || firstStatus === "Rejected"

  const hasComments = timesheetTables.timesheets.some(
    (ts) => ts.comments && ts.comments.length > 0
  )
  const showCommentsButton = hasComments || firstStatus === "Rejected"

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl">
      <ToastContainer />
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        Timesheet List
      </h3>

      {/* Date Picker */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select Date
        </label>
        <div className="relative w-64">
          <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500" />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm"
            placeholderText="Choose a date..."
          />
        </div>
      </div>

      {/* Table Display */}
      {timesheetTables.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No timesheet tables found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <div className="overflow-y-auto max-h-[400px]">
            {/* TimeSheet Table */}
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead className="bg-blue-600 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-center border-r">Date</th>
                  <th className="px-6 py-3 text-center border-r">Project</th>
                  <th className="px-6 py-3 border-r">Task</th>
                  <th className="px-6 py-3 border-r">Description</th>
                  <th className="px-6 py-3 text-center border-r">Department</th>
                  <th className="px-6 py-3 border-r">Hours</th>
                </tr>
              </thead>
              <tbody>
                {timesheetTables?.timesheets?.length > 0 ? (
                  timesheetTables.timesheets.map((timesheet, index) => (
                    <tr
                      key={timesheet.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="px-6 py-3 border-r text-center whitespace-nowrap flex items-center justify-center gap-2">
                        <FaCalendarAlt className="text-blue-500" />
                        <span>{timesheet.date}</span>
                      </td>
                      <td className="px-6 py-3 border-r text-center">
                        {timesheet.project}
                      </td>
                      <td className="px-6 py-3 border-r">{timesheet.task}</td>
                      <td className="px-6 py-3 border-r">
                        {timesheet.description}
                      </td>
                      <td className="px-6 py-3 border-r text-center">
                        {timesheet.department}
                      </td>
                      <td className="px-6 py-3 border-r">{timesheet.hours}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No timesheets available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="p-4 flex flex-wrap justify-end gap-3 bg-gray-50">
            {canEditDeleteSend && (
              <>
                {/* Edit Button  */}
                <button
                  onClick={() => setEditingTable(timesheetTables.timesheets)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaEdit />
                  Edit
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaTrash />
                  Delete
                </button>

                {/* Review Button */}
                <button
                  onClick={() =>
                    handleSendForReviewAll(timesheetTables.timesheets)
                  }
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaPaperPlane />
                  Send for Review
                </button>
              </>
            )}

            {/* Comments Button When Rejected */}
            {showCommentsButton && (
              <button
                onClick={() => {
                  const firstRejected = timesheetTables.timesheets.find(
                    (ts) =>
                      ts.status === "Rejected" &&
                      ts.rejection_feedback?.trim() !== ""
                  )

                  const feedback = firstRejected
                    ? `• [${firstRejected.date}] ${firstRejected.project}: ${firstRejected.rejection_feedback}`
                    : "No rejection feedback available."

                  setComments(feedback)
                  setViewingComments(true)
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaComment />
                View Feedback
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTable && (
        <EditTimesheetTable
          editingTable={editingTable}
          setEditingTable={setEditingTable}
          fetchTimesheetTables={fetchTimesheetTables}
        />
      )}

      {/* Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              ⚠️ Confirm Deletion
            </h2>
            <p className="mb-4 text-gray-800">
              You are about to{" "}
              <span className="font-semibold text-red-600">
                delete all timesheet entries
              </span>{" "}
              for the selected date.
            </p>
            <p className="mb-4 text-sm text-red-500 font-medium">
              This action is{" "}
              <span className="font-bold uppercase">permanent</span> and{" "}
              <u>cannot be undone</u>.
              <br />
              Please make sure you want to proceed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteAll(timesheetTables.timesheets)
                  setConfirmDelete(null)
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {viewingComments && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full relative">
            <button
              onClick={() => setViewingComments(false)}
              className="absolute top-4 right-4 text-gray-500 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Rejection Feedback</h3>
            <textarea
              value={comments}
              readOnly
              className="w-full border border-gray-300 p-3 rounded-md h-40 resize-none whitespace-pre-wrap"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewingComments(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Close
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

export default TimesheetList
