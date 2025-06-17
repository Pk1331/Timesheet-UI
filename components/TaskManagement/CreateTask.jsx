import React, { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import api from "../../src/api"
import { IoClose } from "react-icons/io5"
import Lottie from "lottie-react"
import loaderAnimation from "../../src/assets/myloader2.json"

const CreateTask = ({ closeModal, fetchTasks, showToast }) => {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    status: "To Do",
    priority: "Medium",
    start_date: new Date(),
    end_date: new Date(),
    assigned_to: "",
  })

  const [projects, setProjects] = useState([])
  const [usertype, setUsertype] = useState("")
  const [accountManagers, setAccountManagers] = useState([])
  const [teamLeaders, setTeamLeaders] = useState([])
  const [assignedTeam, setAssignedTeam] = useState(null)
  const [filteredTeamMembers, setFilteredTeamMembers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")

    setUsertype(usertypeParam)
    fetchProjects(usertypeParam)
  }, [])

  // Fetch Projects Based on the Role
  const fetchProjects = async (usertypePara) => {
    try {
      const url =
        usertypePara === "SuperAdmin" ? "projects/" : "projects/assigned/"
      const projectsResponse = await api.get(url)
      setProjects(projectsResponse.data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  // Fetching  Logged Teamleader Team
  useEffect(() => {
    const fetchAssignedTeam = async () => {
      if (usertype === "TeamLeader") {
        try {
          const response = await api.get("teams/teamleader/assigned_team/")
          setAssignedTeam(response.data.team)
        } catch (error) {
          console.error("Error fetching assigned team:", error)
        }
      }
    }
    fetchAssignedTeam()
  }, [usertype])

  // Changes in the Input Fields
  const handleChange = (e) => {
    const { name, value } = e.target
    setNewTask({
      ...newTask,
      [name]: value,
    })
  }

  // Handing Things based on Project Change
  const handleProjectChange = (e) => {
    const selectedProjectId = parseInt(e.target.value)
    const selectedProject = projects.find(
      (project) => project.id === selectedProjectId
    )

    if (!selectedProject) return

    // Update the task's selected project
    setNewTask((prev) => ({
      ...prev,
      project: selectedProjectId,
      assigned_to: "",
    }))

    const allTeams = selectedProject.teams || []

    const userId = parseInt(localStorage.getItem("user_id")) 
    const usertype = localStorage.getItem("usertype")

    const allAccountManagers = allTeams.flatMap(
      (team) => team.account_managers || []
    )

    const allTeamLeaders = allTeams.flatMap((team) =>
      [
        team.team_leader_search,
        team.team_leader_creative,
        team.team_leader_development,
      ].filter(Boolean)
    )

    const allMembers = allTeams.flatMap((team) => team.subteams || [])

    if (usertype === "SuperAdmin") {
      setAccountManagers([
        ...allAccountManagers,
        ...allTeamLeaders,
        ...allMembers,
      ])
    } else if (usertype === "Admin") {
      setTeamLeaders([...allTeamLeaders, ...allMembers])
    } else if (usertype === "TeamLeader") {
      const leaderTeam = allTeams.find((team) =>
        [
          team.team_leader_search,
          team.team_leader_development,
          team.team_leader_creative,
        ].some((leader) => leader?.id === userId)
      )

      if (!leaderTeam) {
        setFilteredTeamMembers([
          {
            id: "none",
            username: "No team assigned to you in this project",
          },
        ])
        return
      }

      let leaderType = ""
      if (leaderTeam.team_leader_search?.id === userId) {
        leaderType = "Search"
      } else if (leaderTeam.team_leader_development?.id === userId) {
        leaderType = "Development"
      } else if (leaderTeam.team_leader_creative?.id === userId) {
        leaderType = "Creative"
      }

      const filteredMembers = leaderTeam.subteams.filter(
        (member) => member.team === leaderType
      )

      setFilteredTeamMembers(
        filteredMembers.length > 0
          ? filteredMembers
          : [
              {
                id: "none",
                username: "No members of your team assigned to this project",
              },
            ]
      )
    }
  }

  const getAssignableUsers = () => {
    if (usertype === "SuperAdmin") {
      return {
        label: "Assign To",
        users: accountManagers,
        disabled: false,
        emptyText: "Select a user",
      }
    }

    if (usertype === "Admin") {
      return {
        label: "Assign to",
        users: teamLeaders,
        disabled: !teamLeaders.length,
        emptyText: teamLeaders.length
          ? "Select User"
          : "No Team Leaders or Members",
      }
    }

    if (usertype === "TeamLeader" && filteredTeamMembers.length > 0) {
      return {
        label: "Assign to Team Member",
        users: filteredTeamMembers,
        disabled: false,
        emptyText: "Select Team Member",
      }
    }

    return null
  }

  const assignableData = getAssignableUsers()

  const handleStartDateChange = (date) => {
    setNewTask({
      ...newTask,
      start_date: date,
    })
  }

  const handleEndDateChange = (date) => {
    setNewTask({
      ...newTask,
      end_date: date,
    })
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (!newTask.project) {
      toast.error("Please select a project before creating a task")
      return
    }

    try {
      const formattedTask = {
        ...newTask,
        start_date: format(newTask.start_date, "yyyy-MM-dd"),
        end_date: format(newTask.end_date, "yyyy-MM-dd"),
      }
      await api.post("tasks/create/", formattedTask)
      showToast("Task created successfully!")
      setNewTask({
        title: "",
        description: "",
        project: "",
        status: "To Do",
        priority: "Medium",
        start_date: new Date(),
        end_date: new Date(),
        assigned_to: "",
      })
      if (closeModal) closeModal()
      if (fetchTasks) fetchTasks()
    } catch (error) {
      showToast("Error creating task", "error")
      console.error("Error creating task:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative max-h-[80vh] overflow-y-auto border border-gray-200">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">
            Create New Task
          </h3>

          {/* Close Icon */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          >
            <IoClose size={24} />
          </button>

          {/* Task Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Task Title</label>
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleChange}
              placeholder="Task Title"
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Task Description */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Task Description</label>
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleChange}
              placeholder="Task Description"
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Select Project */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Project</label>
            <select
              name="project"
              value={newTask.project}
              onChange={handleProjectChange}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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

          {assignableData && (
            <div className="mb-4">
              <label
                htmlFor="assigned_to"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {assignableData.label}
              </label>
              <select
                name="assigned_to"
                id="assigned_to"
                value={newTask.assigned_to}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={assignableData.disabled}
              >
                <option value="" disabled>
                  {assignableData.emptyText}
                </option>
                {assignableData.users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                    disabled={user.id === "none"}
                  >
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Status */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Task Status</label>
            <select
              name="status"
              value={newTask.status}
              onChange={handleChange}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Task Priority */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Task Priority</label>
            <select
              name="priority"
              value={newTask.priority}
              onChange={handleChange}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          {/* Task Start Date */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Start Date</label>
            <DatePicker
              selected={newTask.start_date}
              onChange={handleStartDateChange}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Task End Date */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">End Date</label>
            <DatePicker
              selected={newTask.end_date}
              onChange={handleEndDateChange}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Create Task Button */}
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
            onClick={handleCreateTask}
          >
            Create Task
          </button>
        </div>
      </div>

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
    </>
  )
}

export default CreateTask
