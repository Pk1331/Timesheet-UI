import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { FaEdit, FaTrash } from "react-icons/fa"
import { FiDownload, FiPlus } from "react-icons/fi"
import CreateProject from "./CreateProject"
import EditProject from "./EditProject"
import DeleteProject from "./DeleteProject"
import api from "../../src/api"
import { toast, ToastContainer } from "react-toastify"

const ProjectList = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingProject, setEditingProject] = useState(null)
  const [usertype, setUsertype] = useState("")
  const [filter, setFilter] = useState("All")
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  useEffect(() => {
    setUsertype(localStorage.getItem("usertype"))
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await api.get("projects/")
      const projects = response.data.projects || []
      setProjects(projects)
      setFilteredProjects(projects)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    setFilteredProjects(
      projects.filter((p) => p.name.toLowerCase().includes(query))
    )
  }

  const handleFilterChange = (event) => {
    const status = event.target.value
    setFilter(status)
    setFilteredProjects(
      status === "All" ? projects : projects.filter((p) => p.status === status)
    )
  }

  const handleExport = () => {
    const csvData = [
      [
        "ID",
        "Project Name",
        "Description",
        "Start Date",
        "Deadline",
        "Created By",
        "Status",
      ],
      ...filteredProjects.map((p) => [
        p.id,
        p.name,
        p.description,
        p.start_date,
        p.deadline,
        p.created_by,
        p.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    // Create a Blob and Download the CSV
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "projects.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget)
    setSelectedProject(project)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProject(null)
  }

  const handleEditClick = () => {
    setEditingProject(selectedProject)
    handleMenuClose()
  }

  const columns = [
    { field: "name", headerName: "Project Name", width: 200, editable: false },
    { field: "description", headerName: "Description", width: 250 },
    { field: "start_date", headerName: "Start Date", width: 120 },
    { field: "deadline", headerName: "Deadline", width: 120 },
    { field: "created_by", headerName: "Created By", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Box
          sx={{
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
            backgroundColor:
              params.value === "Completed"
                ? "#E8F5E9"
                : params.value === "Ongoing"
                ? "#E3F2FD"
                : params.value === "Upcoming"
                ? "#FFF3E0"
                : "#FFEBEE",
            color:
              params.value === "Completed"
                ? "#2E7D32"
                : params.value === "Ongoing"
                ? "#1565C0"
                : params.value === "Upcoming"
                ? "#E65100"
                : "#C62828",
            border: "1px solid",
            borderColor:
              params.value === "Completed"
                ? "#4CAF50"
                : params.value === "Ongoing"
                ? "#2196F3"
                : params.value === "Upcoming"
                ? "#FF9800"
                : "#F44336",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={(event) => handleMenuOpen(event, params.row)}>
            <MoreVertIcon />
          </IconButton>
        </>
      ),
    },
  ]

  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message, { autoClose: 3000 })
    } else {
      toast.error(message, { autoClose: 3000 })
    }
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
        {/* Top Section */}
        <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<FiDownload />}
            onClick={handleExport}
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

          {/* Create Project Button */}
          {usertype === "SuperAdmin" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<FiPlus />}
              onClick={() => setShowCreateProjectModal(true)}
            >
              New Project
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
            <InputLabel>Status</InputLabel>
            <Select value={filter} onChange={handleFilterChange} label="Status">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Ongoing">Ongoing</MenuItem>
              <MenuItem value="Upcoming">Upcoming</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>

          {/* Search Bar */}
          <TextField
            label="Search Projects"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flex: 1, mx: 2 }}
          />
        </Box>

        {/* Table */}
        <Box sx={{ flexGrow: 1, overflowX: "auto", width: "100%" }}>
          <DataGrid
            rows={filteredProjects}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            sx={{
              p: 2,
              borderRadius: "8px",
              minWidth: "100%",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-root": {
                backgroundColor: "transparent",
                boxShadow: "none",
              },
            }}
          />
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditClick}>
            <FaEdit className="mr-2" /> Edit
          </MenuItem>
          {usertype === "SuperAdmin" && selectedProject && (
            <MenuItem onClick={() => setShowDeleteConfirmation(true)}>
              <FaTrash className="mr-2" /> Delete
            </MenuItem>
          )}
        </Menu>

        {/* Create Project Modal */}
        {showCreateProjectModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <CreateProject
                closeModal={() => setShowCreateProjectModal(false)}
                fetchProjects={fetchProjects}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingProject && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <EditProject
                editingProject={editingProject}
                setEditingProject={setEditingProject}
                fetchProjects={fetchProjects}
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
            Are you sure you want to delete the project "{selectedProject?.name}
            "?
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowDeleteConfirmation(false)}
              color="primary"
            >
              Cancel
            </Button>
            <DeleteProject
              projectId={selectedProject?.id}
              fetchProjects={fetchProjects}
              showToast={showToast}
              closeMenu={() => setShowDeleteConfirmation(false)}
            />
          </DialogActions>
        </Dialog>
      </Box>
    </>
  )
}

export default ProjectList
