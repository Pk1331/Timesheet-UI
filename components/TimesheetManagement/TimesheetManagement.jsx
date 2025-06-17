import React, { useEffect, useState } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import CreateTimesheet from "./CreateTimesheet"
import ViewTimesheets from "./ViewTimesheets"
import TimesheetList from "./TimesheetList"
import AdminReviewTimesheet from "./AdminReviewTimesheet"
import { FaListAlt } from "react-icons/fa"

const TimesheetManagement = () => {
  const [usertype, setUsertype] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const storedUsertype = localStorage.getItem("usertype")
    setUsertype(storedUsertype)
  }, [])

  const basePath =
    usertype === "User"
      ? "/user-dashboard/timesheets"
      : usertype === "TeamLeader"
      ? "/team-leader-dashboard/timesheets"
      : usertype === "Admin"
      ? "/admin-dashboard/timesheets"
      : "/super-admin-dashboard/timesheets"

  const defaultRoute =
    usertype === "User"
      ? "create"
      : usertype === "TeamLeader"
      ? "leader-review"
      : usertype === "Admin"
      ? "admin-review"
      : "view"

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Timesheet Management
      </h2>
      <div className="flex justify-center mb-6 space-x-4">
        {usertype !== "SuperAdmin" && (
          <>
            {usertype === "Admin" && (
              <button
                onClick={() => navigate(`${basePath}/admin-review`)}
                className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-300 flex items-center"
              >
                <FaListAlt className="mr-2" /> Admin Review
              </button>
            )}
            {usertype !== "User" && (
              <button
                onClick={() => navigate(`${basePath}/view`)}
                className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-300 flex items-center"
              >
                <FaListAlt className="mr-2" /> View Timesheets
              </button>
            )}
            <button
              onClick={() => navigate(`${basePath}/create`)}
              className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-300 flex items-center"
            >
              <FaListAlt className="mr-2" /> Create Timesheet
            </button>
            <button
              onClick={() => navigate(`${basePath}/list`)}
              className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-300 flex items-center"
            >
              <FaListAlt className="mr-2" /> Timesheet List
            </button>
          </>
        )}
      </div>
      <Routes>
        <Route path="create" element={<CreateTimesheet />} />
        <Route path="view" element={<ViewTimesheets />} />
        <Route path="list" element={<TimesheetList />} />
        <Route path="admin-review" element={<AdminReviewTimesheet />} />
        <Route
          path="*"
          element={<Navigate to={`${basePath}/${defaultRoute}`} replace />}
        />
      </Routes>
    </div>
  )
}

export default TimesheetManagement
