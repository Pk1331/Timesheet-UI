import React, { useState, useEffect } from "react"
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid,
  Box,
  Button,
  Menu,
} from "@mui/material"
import { Download as DownloadIcon } from "@mui/icons-material"

const ReportHeader = ({
  setSelectedUser,
  setSelectedProject,
  handleDownload,
}) => {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", team: "Dev" },
    { id: 2, name: "Jane Smith", team: "Dev" },
    { id: 3, name: "Alice Johnson", team: "Dev" },
    { id: 4, name: "Bob Brown", team: "Dev" },
    { id: 5, name: "Charlie Davis", team: "Dev" },
  ])

  const [projects, setProjects] = useState([
    { id: 101, name: "Project Alpha" },
    { id: 102, name: "Project Beta" },
    { id: 103, name: "Project Gamma" },
  ])

  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    // Pre-select "All" by default
    setSelectedUser("")
    setSelectedProject("")
  }, [])

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (format) => {
    setAnchorEl(null)
    if (format) {
      handleDownload(format)
    }
  }

  return (
    <Box p={2} bgcolor="#f5f5f5" borderRadius={2} boxShadow={2}>
      <Grid container spacing={2} alignItems="center">
        {/* User Dropdown */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="user-label">User</InputLabel>
            <Select
              labelId="user-label"
              id="user-select"
              value={selectedUserId}
              label="User"
              onChange={(e) => {
                setSelectedUserId(e.target.value)
                setSelectedUser(e.target.value)
              }}
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Project Dropdown */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="project-label">Project</InputLabel>
            <Select
              labelId="project-label"
              id="project-select"
              value={selectedProjectId}
              label="Project"
              onChange={(e) => {
                setSelectedProjectId(e.target.value)
                setSelectedProject(e.target.value)
              }}
            >
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Download Button */}
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleMenuClick}
            fullWidth
          >
            Download
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleMenuClose(null)}
          >
            <MenuItem onClick={() => handleMenuClose("csv")}>CSV</MenuItem>
            <MenuItem onClick={() => handleMenuClose("xlsx")}>
              Excel (.xlsx)
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ReportHeader
