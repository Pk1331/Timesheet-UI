import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CloseIcon from "@mui/icons-material/Close"
import { FaEdit, FaTrash, FaUserCheck } from "react-icons/fa"
import { FiDownload, FiPlus } from "react-icons/fi"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import CreateTask from "./CreateTask"
import api from "../../src/api"
import EditTask from "./EditTask"
import DeleteTask from "./DeleteTask"
import AssignTaskFrom from "./AssignTaskForm"

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [filter, setFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [assignTask, setassignTask] = useState(null)
  const [usertype, setUsertype] = useState("")
  const loggedInUserId = localStorage.getItem("user_id")
  const isCreator =
    Number(selectedTask?.created_by?.id) === Number(loggedInUserId)
  const loggedInUsername = localStorage.getItem("username")

  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")
    setUsertype(usertypeParam)
  }, [])

  const fetchTasks = async () => {
    try {
      const tasksResponse = await api.get("tasks/")
      const createdTasks = tasksResponse.data.created_tasks || []
      const assignedTasks = tasksResponse.data.assigned_tasks || []
      const tasks = [...createdTasks, ...assignedTasks]
      setTasks(tasks)
      console.log("Fetched tasks:", tasks)
      setFilteredTasks(tasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Handle Search Funtionality
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    setFilteredTasks(
      tasks.filter((task) => task.title.toLowerCase().includes(query))
    )
  }

  const handleFilterChange = (event) => {
    const priority = event.target.value
    setFilter(priority)
    setFilteredTasks(
      priority === "All" ? tasks : tasks.filter((t) => t.priority === priority)
    )
  }

  const handleExportTasks = () => {
    if (tasks.length === 0) {
      showToast("No data available to export", "error")
      return
    }

    const currentDate = new Date().toISOString().split("T")[0]
    const fileName = `tasks_export_${currentDate}.csv`
    const headers = [
      "Task ID",
      "Title",
      "Description",
      "Project ID",
      "Priority",
      "Status",
      "Start Date",
      "End Date",
      "Created By",
      "Assigned To",
    ]

    const csvRows = [
      headers.join(","),
      ...tasks.map((task) => {
        const taskId = task.id || "N/A"
        const title = task.title || "N/A"
        const description = task.description || "N/A"
        const projectId = task.project || "N/A"
        const priority = task.priority || "N/A"
        const status = task.status || "N/A"
        const startDate = task.start_date || "N/A"
        const endDate = task.end_date || "N/A"
        const createdBy = task.created_by ? task.created_by.username : "N/A"
        const assignedTo = task.assigned_to ? task.assigned_to.username : "N/A"

        return [
          taskId,
          title,
          description,
          projectId,
          priority,
          status,
          startDate,
          endDate,
          createdBy,
          assignedTo,
        ].join(",")
      }),
    ]

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.href = encodedUri
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast("Tasks exported successfully!", "success")
  }

  const handleMenuOpen = (event, row) => {
    const fullTask = tasks.find((task) => task.id === row.id)
    setSelectedTask(fullTask)
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTask(null)
  }

  const handleTaskClick = (row) => {
    const fullTask = tasks.find((task) => task.id === row.id) || row
    setSelectedTask(fullTask)
    setShowTaskDetails(true)
  }

  const handleAssignTask = () => {
    if (!selectedTask) {
      console.error("Error: No team selected for editing!")
      return
    }
    setassignTask({ ...selectedTask })
    handleMenuClose()
  }

  const handleEditClick = () => {
    if (!selectedTask) {
      console.error("Error: No team selected for editing!")
      return
    }
    setEditingTask({ ...selectedTask })
    handleMenuClose()
  }

  const priorityColors = {
    Critical: "#8B0000", // Dark Red
    High: "#d32f2f", // Normal Red
    Medium: "#1976D2", // Blue
    Low: "#388e3c", // Green
  }

  const priorityOrder = {
    Critical: 1,
    High: 2,
    Medium: 3,
    Low: 4,
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 5
    const priorityB = priorityOrder[b.priority] || 5

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    return new Date(a.end_date) - new Date(b.end_date)
  })

  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message, { autoClose: 3000 })
    } else {
      toast.error(message, { autoClose: 3000 })
    }
  }

  const columns = [
    {
      field: "title",
      headerName: "Task Name",
      width: 200,
      flex: 3,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => handleTaskClick(params.row)}
          sx={{
            color: "#1976D2",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "priority",
      headerName: "Task Priority",
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            backgroundColor: priorityColors[params.value] || "#ccc",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            px: 1.5,
            py: 0.3,
            borderRadius: "8px",
            fontWeight: "500",
            fontSize: "0.75rem",
            textTransform: "capitalize",
            minWidth: "90px",
            maxWidth: "100px",
            height: "24px",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "deadline",
      headerName: "Deadline",
      width: 150,
      flex: 1,
    },
  ]

  if (usertype != "User") {
    columns.push({
      field: "actions",
      headerName: "Actions",
      width: 150,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={(event) => handleMenuOpen(event, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    })
  }
  return (
    <>
      <ToastContainer />
      <Box
        sx={{
          flexGrow: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<FiDownload />}
            onClick={handleExportTasks}
            sx={{
              bgcolor: "transparent",
              color: "black",
              "&:hover": {
                bgcolor: "#1976D2",
                color: "#fff",
                border: "1px solid #1976D2",
              },
            }}
          >
            Export
          </Button>

          {/* Create Team Button */}
          {usertype !== "User" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<FiPlus />}
              onClick={() => setShowCreateTaskModal(true)}
            >
              New Task
            </Button>
          )}
        </Box>

        {/* Search & Filter Row */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {/* Status Filter Dropdown */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filter}
              onChange={handleFilterChange}
              label="priority"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>

          {/* Search Bar */}
          <TextField
            label="Search Tasks"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flex: 1, mx: 2 }}
          />
        </Box>

        <DataGrid
          rows={sortedTasks.map((task) => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            deadline: task.end_date,
          }))}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{
            p: 2,
            borderRadius: "8px",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
          }}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {!isCreator && (
            <MenuItem onClick={handleAssignTask}>
              <FaUserCheck className="mr-2" /> Assign Task
            </MenuItem>
          )}
          {/* Edit option for everyone */}
          <MenuItem onClick={handleEditClick}>
            <FaEdit className="mr-2" /> Edit Task
          </MenuItem>
          {/* Delete option only for SuperAdmin or Admin */}
          {(usertype === "SuperAdmin" || usertype === "Admin") && (
            <MenuItem onClick={() => setShowDeleteConfirmation(true)}>
              <FaTrash className="mr-2" /> Delete Task
            </MenuItem>
          )}
        </Menu>

        {/* TeamDetails Popup */}
        <Dialog
          open={showTaskDetails}
          onClose={() => setShowTaskDetails(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedTask?.title} - Task Details
            <IconButton
              aria-label="close"
              onClick={() => setShowTaskDetails(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {/* Task Description */}
            <Typography variant="h6">Description:</Typography>
            <Typography>
              {selectedTask?.description || "No description available"}
            </Typography>

            {/* Task Info */}
            <List>
              <ListItem>
                <ListItemText
                  primary={`Project: ${selectedTask?.project?.name || "N/A"}`}
                />
              </ListItem>

              {usertype !== "User" && (
                <ListItem>
                  <ListItemText
                    primary={
                      <>
                        Assigned To:{" "}
                        <span className="text-red-600 transition-all animate-pulse ease-in-out duration-1000">
                          {usertype === "SuperAdmin"
                            ? selectedTask?.assigned_to?.superadmin?.username ||
                              "Not Assigned"
                            : usertype === "Admin"
                            ? selectedTask?.assigned_to?.admin?.username ||
                              "Not Assigned"
                            : usertype === "TeamLeader"
                            ? selectedTask?.assigned_to?.teamleader?.username ||
                              "Not Assigned"
                            : "N/A"}
                        </span>
                      </>
                    }
                  />
                </ListItem>
              )}

              {/* <ListItem>
                <ListItemText
                  primary={
                    <>
                      Assigned By:{" "}
                      <span
                        className={
                          usertype === "User"
                            ? "text-red-600 transition-all animate-pulse ease-in-out duration-1000"
                            : ""
                        }
                      >
                        {usertype === "Admin"
                          ? selectedTask?.created_by?.username || "N/A"
                          : usertype === "TeamLeader"
                          ? selectedTask?.created_by?.username !==
                            loggedInUsername
                            ? selectedTask?.assigned_to?.superadmin?.username ||
                              "N/A"
                            : selectedTask?.created_by?.username || "N/A"
                          : usertype === "User"
                          ? selectedTask?.created_by?.usertype === "TeamLeader"
                            ? selectedTask?.created_by?.username || "N/A"
                            : selectedTask?.created_by?.username !==
                              loggedInUsername
                            ? selectedTask?.assigned_to?.admin?.username ||
                              "N/A"
                            : selectedTask?.created_by?.username || "N/A"
                          : selectedTask?.created_by?.username || "N/A"}
                      </span>
                    </>
                  }
                />
              </ListItem> */}

              <ListItem>
                <ListItemText
                  primary={`Priority: ${selectedTask?.priority || "N/A"}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={`Status: ${selectedTask?.status || "N/A"}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={`Created Date: ${selectedTask?.start_date || "N/A"}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <>
                      Deadline:{" "}
                      <span className="text-red-600 animate-pulse transition-all duration-1000 ease-in-out">
                        {selectedTask?.end_date || "N/A"}
                      </span>
                    </>
                  }
                />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTaskDetails(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Task Modal*/}
        {showCreateTaskModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <CreateTask
                closeModal={() => setShowCreateTaskModal(false)}
                fetchTasks={fetchTasks}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Assign Task Modal */}
        {assignTask && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <AssignTaskFrom
                assignTask={assignTask}
                setassignTask={setassignTask}
                fetchTasks={fetchTasks}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <EditTask
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                fetchTasks={fetchTasks}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the team "{selectedTask?.title}"?
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowDeleteConfirmation(false)}
              color="primary"
            >
              Cancel
            </Button>
            <DeleteTask
              taskId={selectedTask?.id}
              fetchTasks={fetchTasks}
              showToast={showToast}
              closeMenu={() => setShowDeleteConfirmation(false)}
            />
          </DialogActions>
        </Dialog>
      </Box>
    </>
  )
}

export default TaskList
