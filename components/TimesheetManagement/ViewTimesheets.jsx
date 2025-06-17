import React, { useState, useEffect, useRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import api from "../../src/api"
import FloatingDownload from "../Download/FloatingDownload"
const ViewTimesheets = () => {
  const [usertype, setUsertype] = useState("")
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [viewMode, setViewMode] = useState("Daily")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timesheetTables, setTimesheetTables] = useState([])
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const dropdownRef = useRef(null)

  // Get Usertype from localStorage and fetch projects/users
  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")
    setUsertype(usertypeParam)
    fetchProjects(usertypeParam)
    fetchUsers(usertypeParam)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchProjects = async (usertypeParam) => {
    try {
      const url =
        usertypeParam === "SuperAdmin" ? "projects/" : "projects/assigned/"
      const projectsResponse = await api.get(url)
      setProjects(projectsResponse.data.projects || [])
      console.log(projectsResponse.data.projects)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const fetchUsers = async (usertypeParam) => {
    try {
      let url = "users/"
      if (usertypeParam === "SuperAdmin") {
        url += "?usertype=Admin,TeamLeader,User"
      } else if (usertypeParam === "Admin") {
        url += "?usertype=TeamLeader,User"
      } else if (usertypeParam === "TeamLeader") {
        const userId = localStorage.getItem("user_id")
        url += `?team_leader=${userId}`
      }
      const response = await api.get(url)
      setUsers(response.data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  // Click outside dropdown to close
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDownloadMenu(false)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    console.log(date)
    setTimesheetTables([])
  }
  // Fetch Timesheets based on filters
  const fetchTimesheetTables = async () => {
    try {
      let params = {}

      if (filterBy === "User") {
        if (selectedUser) params.user = selectedUser
        if (selectedProject) params.project = selectedProject
      } else if (filterBy === "Project" && selectedProject) {
        params.project = selectedProject
      }

      if (viewMode === "Daily") {
        params.date = selectedDate.toLocaleDateString("en-CA") 
        console.log(params.date)
      } else {
        
        params.month = selectedDate.toISOString().slice(0, 7)
      }

      const response = await api.get("timesheets/approved-timesheets/", {
        params,
      })
      setTimesheetTables(response.data || [])
      console.log("Timesheets fetched:", response.data || [])
    } catch (error) {
      console.error("Error fetching timesheets:", error)
    }
  }

  // Filter By state & handler
  const [filterBy, setFilterBy] = useState("Project") // "Project" or "User"
  const handleFilterChange = (e) => {
    setFilterBy(e.target.value)
    setTimesheetTables([])
  }

  // Handlers for project/user select & date/viewMode changes
  const handleProjectChange = (e) => setSelectedProject(e.target.value)
  const handleUserChange = (e) => setSelectedUser(e.target.value)
  const handleViewModeChange = (e) => {
    setViewMode(e.target.value)
    setTimesheetTables([])
  }

  // Fetch timesheets when filter criteria change
  useEffect(() => {
    if (
      (filterBy === "User" && selectedUser && selectedProject) ||
      (filterBy === "Project" && selectedProject)
    ) {
      fetchTimesheetTables()
    }
  }, [filterBy, selectedUser, selectedProject, selectedDate, viewMode])

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar Filters Panel */}
      <aside className="w-64 bg-white shadow rounded-tr-xl rounded-br-xl p-6 flex flex-col space-y-6 sticky top-0 h-screen">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4 border-b pb-2">
          Filters
        </h2>

        {/* View By */}
        <div>
          <label className="block mb-2 text-gray-700 font-semibold tracking-wide">
            View By
          </label>
          <select
            value={filterBy}
            onChange={handleFilterChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          >
            <option value="User">User</option>
            <option value="Project">Project</option>
          </select>
        </div>

        {/* Project Selector for User filter */}
        {filterBy === "User" &&
          ["SuperAdmin", "Admin", "TeamLeader"].includes(usertype) && (
            <div>
              <label className="block mb-2 text-gray-700 font-semibold tracking-wide">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={handleProjectChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="" disabled>
                  Select Project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

        {/* User Selector based on selected project */}
        {filterBy === "User" &&
          ["SuperAdmin", "Admin", "TeamLeader"].includes(usertype) &&
          selectedProject && (
            <div>
              <label className="block mb-2 text-gray-700 font-semibold tracking-wide">
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={handleUserChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="" disabled>
                  Select User
                </option>
                {(() => {
                  const project = projects.find(
                    (p) => p.id === parseInt(selectedProject)
                  )
                  if (!project) return null

                  const teamMembers = project.teams[0]?.subteams || []
                  const leads = []
                  if (project.teams[0]?.team_leader_development)
                    leads.push(project.teams[0].team_leader_development)
                  if (project.teams[0]?.team_leader_search)
                    leads.push(project.teams[0].team_leader_search)

                  const allUsers = [...teamMembers, ...leads]

                  return allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))
                })()}
              </select>
            </div>
          )}

        {/* Project Selector when View By is Project */}
        {filterBy === "Project" &&
          ["SuperAdmin", "Admin", "TeamLeader"].includes(usertype) && (
            <div>
              <label className="block mb-2 text-gray-700 font-semibold tracking-wide">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={handleProjectChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="" disabled>
                  Select Project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

        {/* View Mode */}
        <div>
          <label className="block mb-2 text-gray-700 font-semibold tracking-wide">
            View Mode
          </label>
          <select
            value={viewMode}
            onChange={handleViewModeChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          >
            <option value="Daily">Daily</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block mb-2 text-gray-700 font-semibold tracking-wide">
            {viewMode === "Daily" ? "Select Date" : "Select Month"}
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            showMonthYearPicker={viewMode === "Monthly"}
            dateFormat={viewMode === "Monthly" ? "MM/yyyy" : "MM/dd/yyyy"}
            popperPlacement="bottom-start"
          />
        </div>
      </aside>

      {/* Main Content: Table */}
      <main className="flex-grow p-3 overflow-hidden">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Timesheet Records
        </h2>

        <div className="overflow-hidden rounded-lg shadow-md bg-white border border-gray-200 max-h-[60vh] flex flex-col">
          <div className="overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 text-gray-900">
              <thead className="bg-indigo-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timesheetTables.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-500 italic select-none"
                    >
                      No timesheet data available
                    </td>
                  </tr>
                ) : (
                  timesheetTables.map((timesheet, i) => (
                    <tr
                      key={timesheet.id}
                      className={i % 2 === 0 ? "bg-indigo-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {timesheet.date}
                      </td>
                      <td className="px-6 py-4">{timesheet.task}</td>
                      <td className="px-6 py-4">{timesheet.description}</td>
                      <td
                        className="px-6 py-4"
                        title={`${timesheet.created_by.email} | ${timesheet.created_by.team}`}
                      >
                        {timesheet.created_by.username}
                      </td>
                      <td className="px-6 py-4">{timesheet.department}</td>
                      <td className="px-6 py-4">{timesheet.hours}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Floating Download Button with Options */}
      <FloatingDownload
        timesheetTables={timesheetTables}
        selectedProject={selectedProject}
        selectedDate={selectedDate}
        projects={projects}
        viewMode={viewMode}
        selectedUser={selectedUser}
        users={users}
      />
    </div>
  )
}

export default ViewTimesheets
