import React from "react"
import * as XLSX from "xlsx"
import { CSVLink } from "react-csv"
import toast from "react-hot-toast"

const FloatingDownload = ({
  timesheetTables,
  selectedProject,
  selectedDate,
  projects,
  viewMode,
  selectedUser,
  users,
}) => {
  const getFormattedFilename = () => {
    const projectName =
      projects.find((p) => p.id === Number(selectedProject))?.name ||
      "timesheets"
    const username =
      users.find((u) => u.id === Number(selectedUser))?.username || "user"
    const datePart =
      viewMode === "Daily"
        ? selectedDate.toISOString().slice(0, 10)
        : selectedDate.toISOString().slice(0, 7)
    return `${username}_${projectName}_${datePart}`
  }

  const generateCSVData = () => {
    return timesheetTables.map((ts) => ({
      Date: ts.date,
      Task: ts.task,
      Description: ts.description,
      "Assigned To": ts.created_by?.username || "N/A",
      Department: ts.department || "N/A",
      Hours: ts.hours,
    }))
  }

  const downloadExcel = () => {
    if (!timesheetTables || timesheetTables.length === 0) {
      toast.error("No data available to download.")
      return
    }

    const data = generateCSVData()
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheets")
    XLSX.writeFile(workbook, `${getFormattedFilename()}.xlsx`)
  }

  const filename = `${getFormattedFilename()}.csv`
  const csvData = generateCSVData()

  return (
    <div className="fixed bottom-8 right-8 flex items-center space-x-3 group z-50">
      <div className="flex space-x-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300">
        <div
          onClick={() => {
            if (!timesheetTables || timesheetTables.length === 0) {
              toast.error("No data available to download.")
              return
            }
          }}
          className="cursor-pointer bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-purple-300 select-none"
          title="Download CSV"
        >
          {timesheetTables.length > 0 ? (
            <CSVLink
              data={csvData}
              filename={filename}
              className="w-full h-full block"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              CSV
            </CSVLink>
          ) : (
            "CSV"
          )}
        </div>

        <div
          onClick={downloadExcel}
          className="cursor-pointer bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-purple-300 select-none"
          title="Download Excel"
        >
          Excel
        </div>
      </div>

      <button
        onClick={downloadExcel}
        className="bg-purple-700 hover:bg-purple-800 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label="Download timesheet data"
        title="Download timesheet data"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
      </button>
    </div>
  )
}

export default FloatingDownload
