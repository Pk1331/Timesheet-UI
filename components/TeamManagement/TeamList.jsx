import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
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
  InputAdornment,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CloseIcon from "@mui/icons-material/Close"
import { FaEdit, FaSearch } from "react-icons/fa"
import { FiDownload, FiPlus, FiUserMinus } from "react-icons/fi"
import api from "../../src/api"
import CreateTeam from "./CreateTeam"
import EditTeam from "./EditTeam"
import DeleteTeam from "./DeleteTeam"
import { toast, ToastContainer } from "react-toastify"

const TeamList = () => {
  const [teams, setTeams] = useState([])
  const [filteredTeams, setFilteredTeams] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingTeam, setEditingTeam] = useState(null)
  const [usertype, setUsertype] = useState("")
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showTeamDetails, setShowTeamDetails] = useState(false)

  useEffect(() => {
    setUsertype(localStorage.getItem("usertype"))
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await api.get("teams/")
      const teams = response.data.teams || []
      console.log("Fetching teams...")
      setTeams(teams)
      setFilteredTeams(teams)
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const handleExport = () => {
    if (teams.length === 0) {
      showToast("No data available to export", "error")
      return
    }

    const currentDate = new Date().toISOString().split("T")[0]
    const fileName = `teams_export_${currentDate}.csv`
    const headers = [
      "Project Name",
      "Team Name",
      "Total Members",
      "Account Managers",
      "Search Lead",
      "Development Lead",
      "Creative Lead",
      "Members",
    ]

    const csvRows = [
      headers.join(","),
      ...teams.map((team) => {
        const projectName = team.name || "N/A"
        const teamName = team.name || "N/A"
        const totalMembers = team.total_members || 0
        const accountManagers =
          team.account_managers
            ?.map((manager) => manager.username)
            .join(" | ") || "N/A"
        const searchLead = team.team_leader_search
          ? team.team_leader_search.username
          : "N/A"
        const devLead = team.team_leader_development
          ? team.team_leader_development.username
          : "N/A"
        const creativeLead = team.team_leader_creative
          ? team.team_leader_creative.username
          : "N/A"

        const members =
          team.subteams
            ?.flatMap((subteam) =>
              subteam.members.map((member) => member.username)
            )
            .join(" | ") || "N/A"

        return [
          projectName,
          teamName,
          totalMembers,
          accountManagers,
          searchLead,
          devLead,
          creativeLead,
          members,
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

    showToast("Teams exported successfully!", "success")
  }

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    setFilteredTeams(
      teams.filter((team) => team.name.toLowerCase().includes(query))
    )
  }

  const handleMenuOpen = (event, row) => {
    const fullTeam = teams.find((team) => team.id === row.id)
    setSelectedTeam(fullTeam)
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTeam(null)
  }

  const handleEditClick = () => {
    if (!selectedTeam) {
      console.error("Error: No team selected for editing!")
      return
    }
    setEditingTeam({ ...selectedTeam })
    handleMenuClose()
  }

  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message, { autoClose: 3000 })
    } else {
      toast.error(message, { autoClose: 3000 })
    }
  }

  const columns = [
    {
      field: "name",
      headerName: "Team Name",
      width: 200,
      flex: 3,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => handleTeamClick(params.row)}
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
      field: "total_members",
      headerName: "Team Size",
      width: 150,
      flex: 1,
    },
  ]

  if (usertype !== "User") {
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

  const handleTeamClick = (row) => {
    const fullTeam = teams.find((team) => team.id === row.id) || row
    setSelectedTeam(fullTeam)
    setShowTeamDetails(true)
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

          {/* Create Team Button */}
          {(usertype === "SuperAdmin" || usertype === "Admin") && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<FiPlus />}
              onClick={() => setShowCreateTeamModal(true)}
            >
              New Team
            </Button>
          )}
        </Box>

        {/* Search Bar */}
        <TextField
          label="Search Teams"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: "350px", marginBottom: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch className="text-gray-500" />
              </InputAdornment>
            ),
          }}
        />

        {/* Data Table */}
        <DataGrid
          rows={filteredTeams.map((team) => ({
            id: team.id,
            name: team.name,
            total_members: team.total_members || 0,
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

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditClick}>
            <FaEdit className="mr-2" /> Edit Team
          </MenuItem>
          {usertype === "SuperAdmin" || usertype === "Admin" ? (
            <MenuItem onClick={() => setShowDeleteConfirmation(true)}>
              <FiUserMinus className="mr-2" /> Delete Team
            </MenuItem>
          ) : null}
        </Menu>

        {/* TeamDetails Popup */}
        <Dialog
          open={showTeamDetails}
          onClose={() => setShowTeamDetails(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedTeam?.name} - Team Details
            <IconButton
              aria-label="close"
              onClick={() => setShowTeamDetails(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {/* Account Managers */}
            <Typography variant="h6">Account Managers:</Typography>
            <List>
              {selectedTeam?.account_managers?.length > 0 ? (
                selectedTeam.account_managers.map((manager) => (
                  <ListItem key={manager?.id || manager}>
                    <ListItemText primary={manager?.username || manager} />
                  </ListItem>
                ))
              ) : (
                <Typography>No account managers</Typography>
              )}
            </List>

            {/* Team Leaders */}
            <Typography variant="h6">Team Leaders:</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary={`Search: ${
                    selectedTeam?.team_leader_search?.username || "N/A"
                  }`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={`Creative: ${
                    selectedTeam?.team_leader_creative?.username || "N/A"
                  }`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={`Development: ${
                    selectedTeam?.team_leader_development?.username || "N/A"
                  }`}
                />
              </ListItem>
            </List>

            {/* Team Members */}
            <Typography variant="h6">Team Members:</Typography>
            <List>
              {selectedTeam?.subteams?.length > 0 ? (
                selectedTeam.subteams.map((subteam, index) => (
                  <Box key={index}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mt: 1 }}
                    >
                      {subteam?.subteam || "Unknown"} Team:
                    </Typography>
                    {subteam?.members?.length > 0 ? (
                      subteam.members.map((member) => (
                        <ListItem key={member?.id || member}>
                          <ListItemText primary={member?.username || member} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography>No members</Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography>No members</Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTeamDetails(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <CreateTeam
                closeModal={() => setShowCreateTeamModal(false)}
                fetchTeams={fetchTeams}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {editingTeam && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <EditTeam
                editingTeam={editingTeam}
                setEditingTeam={setEditingTeam}
                fetchTeams={fetchTeams}
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
            Are you sure you want to delete the team "{selectedTeam?.name}"?
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowDeleteConfirmation(false)}
              color="primary"
            >
              Cancel
            </Button>
            <DeleteTeam
              teamId={selectedTeam?.id}
              fetchTeams={fetchTeams}
              showToast={showToast}
              closeMenu={() => setShowDeleteConfirmation(false)}
            />
          </DialogActions>
        </Dialog>
      </Box>
    </>
  )
}

export default TeamList
