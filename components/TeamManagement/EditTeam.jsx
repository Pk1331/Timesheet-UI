import React, { useState, useEffect } from "react"
import "react-toastify/dist/ReactToastify.css"
import Select from "react-select"
import api from "../../src/api"
import { IoClose } from "react-icons/io5"
import Lottie from "lottie-react"
import loaderAnimation from "../../src/assets/myloader2.json"

const EditTeam = ({ editingTeam, setEditingTeam, fetchTeams, showToast }) => {
  const [teamData, setTeamData] = useState({
    name: "",
    description: "",
    account_manager_ids: [],
    team_leader_search: "",
    team_leader_development: "",
    team_leader_creative: "",
    team: "",
    subteam: "",
    member_ids: [],
    project_id: "",
  })
  const [accountManagers, setAccountManagers] = useState([])
  const [teamLeaders, setTeamLeaders] = useState([])
  const [members, setMembers] = useState([])
  const [usertype, setUsertype] = useState("")
  const [loggedInUserId, setLoggedInUserId] = useState("")
  const [loggedInUsername, setLoggedInUsername] = useState("")
  const [projects, setProjects] = useState([])
  const [assignedTeam, setAssignedTeam] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingTeam) {
      setTeamData({
        project_id: editingTeam.projects?.[0]?.id || "",
        name: editingTeam.name || "",
        description: editingTeam.description || "",
        account_manager_ids:
          editingTeam.account_managers?.map((m) => m.id) || [],
        team_leader_search: editingTeam.team_leader_search?.id || "",
        team_leader_development: editingTeam.team_leader_development?.id || "",
        team_leader_creative: editingTeam.team_leader_creative?.id || "",
        team: editingTeam.team || "",
        subteam: editingTeam.subteams?.[0]?.subteam || "",
        member_ids:
          editingTeam.subteams?.flatMap((s) => s.members?.map((m) => m.id)) ||
          [],
      })
    }
  }, [editingTeam])

  // Get usertype and userId from localStorage
  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")
    const userId = localStorage.getItem("user_id")
    const username = localStorage.getItem("username")
    setUsertype(usertypeParam)
    setLoggedInUserId(userId)
    setLoggedInUsername(username)
  }, [])
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("projects/")
        setProjects(response.data.projects || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }
    fetchProjects()
  }, [])

  // Fetch account managers
  useEffect(() => {
    const fetchAccountManagers = async () => {
      try {
        const response = await api.get("users/?usertype=Admin")
        setAccountManagers(response.data.users || [])
        if (usertype === "Admin") {
          setTeamData((prevData) => ({
            ...prevData,
            account_manager_ids: loggedInUserId,
          }))
        }
      } catch (error) {
        console.error("Error fetching account managers:", error)
      }
    }
    fetchAccountManagers()
  }, [usertype, loggedInUserId])

  // Fetch team leaders
  useEffect(() => {
    const fetchTeamLeaders = async () => {
      try {
        const response = await api.get("users/?usertype=TeamLeader")
        const leaders = response.data.users || []
        setTeamLeaders(leaders)
      } catch (error) {
        console.error("Error fetching team leaders:", error)
      }
    }

    fetchTeamLeaders()
  }, [])

  // Fetch assigned team for the logged-in Team Leader
  useEffect(() => {
    const fetchAssignedTeam = async () => {
      if (usertype === "TeamLeader") {
        try {
          const response = await api.get("teams/teamleader/assigned_team/")
          setAssignedTeam(response.data.team)
          console.log("Assigned Team:", response.data.team)
        } catch (error) {
          console.error("Error fetching assigned team:", error)
        }
      }
    }
    fetchAssignedTeam()
  }, [usertype, loggedInUserId])

  // Fetch members based on selected subteam
  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamData.subteam) return

      try {
        const response = await api.get(
          `users/?usertype=User&subteam=${teamData.subteam}`
        )
        const newMembers = response.data.users || []

        // Merge new members with already selected ones
        setMembers((prevMembers) => {
          const selectedMemberIds = new Set(teamData.member_ids)
          const mergedMembers = [...prevMembers]

          newMembers.forEach((newMember) => {
            if (!selectedMemberIds.has(newMember.id)) {
              mergedMembers.push(newMember)
            }
          })

          return mergedMembers
        })
      } catch (error) {
        console.error("Error fetching members:", error)
      }
    }

    fetchMembers()
  }, [teamData.subteam])

  // Define subteams for each team
  const teamSubTeams = {
    Search: ["SEO", "SEM", "SMO"],
    Creative: ["Design", "Content Writing"],
    Development: ["Python Development", "Web Development"],
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTeamData({ ...teamData, [name]: value })

    if (name === "team") {
      // Reset subteam & members when team is changed
      setTeamData((prev) => ({ ...prev, subteam: "", member_ids: [] }))
      setMembers([])
    }

    if (name === "subteam") {
      // Reset members ONLY if they are not already selected
      setMembers((prevMembers) =>
        prevMembers.filter((m) => teamData.member_ids.includes(m.id))
      )
    }
  }

  const accountManagerOptions = accountManagers.map((manager) => ({
    value: manager.id,
    label: manager.username,
  }))

  // Hanling Manager Selection For Superadmin
  const handleAccountManagerSelection = (selectedOptions) => {
    const managerIds = selectedOptions.map((option) => option.value)

    setTeamData((prevTeamData) => ({
      ...prevTeamData,
      account_manager_ids: managerIds,
    }))
  }

  // Handle Member Selection
  const handleMemberSelection = (selectedOptions) => {
    const memberIds = selectedOptions.map((option) => option.value)

    setTeamData((prevTeamData) => ({
      ...prevTeamData,
      member_ids: memberIds,
    }))

    setMembers((prevMembers) => {
      const newSelectedMembers = selectedOptions.map((option) => ({
        id: option.value,
        username: option.label,
      }))

      const mergedMembers = [...prevMembers]

      newSelectedMembers.forEach((newMember) => {
        if (!mergedMembers.some((m) => m.id === newMember.id)) {
          mergedMembers.push(newMember)
        }
      })

      return mergedMembers
    })
  }

  // Cleaning Team Data Before Sending to Backend
  const cleanTeamData = {
    ...teamData,
    account_manager_ids: Array.isArray(teamData.account_manager_ids)
      ? teamData.account_manager_ids.map(Number)
      : teamData.account_manager_ids
      ? [Number(teamData.account_manager_ids)]
      : [],
  }

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log(cleanTeamData)
      await api.put(`teams/${editingTeam.id}/edit/`, cleanTeamData)
      showToast("Team updated successfully!")
      setEditingTeam(null)
      fetchTeams()
    } catch (error) {
      showToast("An error occurred while updating the team!", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative max-h-[80vh] overflow-y-auto border border-gray-200">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">Edit Team</h3>

          <button
            onClick={() => setEditingTeam(null)}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          >
            <IoClose size={24} />
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Project */}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Project</label>
              <select
                name="project_id"
                value={teamData.project_id}
                onChange={handleChange}
                disabled={usertype.includes("TeamLeader")}
                className={`border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 
      ${
        usertype.includes("TeamLeader")
          ? "bg-gray-200 cursor-not-allowed"
          : "bg-white cursor-pointer"
      }`}
              >
                {usertype.includes("TeamLeader") ? (
                  editingTeam?.projects?.length > 0 ? (
                    editingTeam.projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Assigned Projects
                    </option>
                  )
                ) : (
                  <>
                    <option value="" disabled>
                      Select a project
                    </option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Team Name */}
            <input
              type="text"
              name="name"
              placeholder="Team Name"
              value={teamData.name}
              onChange={handleChange}
              required
              disabled={usertype === "TeamLeader"}
              className={`border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none 
              ${
                usertype === "TeamLeader"
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white cursor-text"
              }`}
            />

            {/* Description */}
            <textarea
              name="description"
              placeholder="Description"
              value={teamData.description}
              onChange={handleChange}
              disabled={usertype === "TeamLeader"}
              className={`border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none 
              ${
                usertype === "TeamLeader"
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white cursor-text"
              }`}
            />

            {/* Account Manager Section */}
            <div className="border border-gray-300 p-3 rounded-lg w-full bg-gray-50">
              <p className="font-semibold text-gray-700 mb-2">
                Account Managers:
              </p>

              <Select
                isMulti
                options={accountManagerOptions}
                required
                value={
                  usertype === "SuperAdmin"
                    ? accountManagerOptions.filter((option) =>
                        teamData.account_manager_ids.includes(option.value)
                      )
                    : editingTeam?.account_managers?.map((manager) => ({
                        value: manager.id,
                        label: manager.username,
                      })) || []
                }
                isDisabled={usertype !== "SuperAdmin"}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor:
                      usertype === "SuperAdmin" ? "white" : "#E5E7EB",
                    cursor:
                      usertype === "SuperAdmin" ? "pointer" : "not-allowed",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    display: usertype === "SuperAdmin" ? "block" : "none",
                  }),
                }}
                onChange={
                  usertype === "SuperAdmin"
                    ? handleAccountManagerSelection
                    : undefined
                }
              />
            </div>

            {/* Team Leaders */}
            <div className="space-y-4">
              {["search", "development", "creative"].map((team) => {
                const teamKey = `team_leader_${team}`
                const selectedLeader =
                  usertype === "TeamLeader"
                    ? editingTeam?.[teamKey]?.id || ""
                    : teamData[teamKey]

                return (
                  <select
                    key={team}
                    name={teamKey}
                    value={selectedLeader}
                    onChange={handleChange}
                    className={`border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                      usertype === "TeamLeader"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={usertype === "TeamLeader"}
                  >
                    <option value="">
                      {usertype === "TeamLeader"
                        ? editingTeam?.[teamKey]?.username ||
                          `Select ${team} Team Leader`
                        : `Select ${team} Team Leader`}
                    </option>
                    {teamLeaders
                      .filter((leader) => leader.team.toLowerCase() === team)
                      .map((leader) => (
                        <option key={leader.id} value={leader.id}>
                          {leader.username}
                        </option>
                      ))}
                  </select>
                )
              })}
            </div>

            {/* Select Team */}
            <select
              name="team"
              value={teamData.team}
              onChange={(e) =>
                setTeamData({ ...teamData, team: e.target.value, subteam: "" })
              }
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Select Team</option>
              {usertype === "TeamLeader" && assignedTeam ? (
                <option value={assignedTeam?.team_type}>
                  {assignedTeam?.team_type}
                </option>
              ) : (
                Object.keys(teamSubTeams).map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))
              )}
            </select>

            {teamData.team && (
              <select
                name="subteam"
                value={teamData.subteam}
                onChange={(e) => {
                  handleChange(e)
                  setMembers((prevMembers) => {
                    const selectedMemberIds = new Set(teamData.member_ids)
                    return prevMembers.filter((member) =>
                      selectedMemberIds.has(member.id)
                    )
                  })
                }}
                disabled={
                  usertype === "TeamLeader" &&
                  assignedTeam?.team_type !== teamData.team
                }
                className={`border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                  usertype === "TeamLeader" &&
                  assignedTeam?.team_type !== teamData.team
                    ? "bg-gray-200 cursor-not-allowed"
                    : ""
                }`}
                required
              >
                <option value="">Select Sub-Team</option>
                {teamSubTeams[teamData.team]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            )}

            <div className="border border-gray-300 p-3 rounded-lg w-full bg-gray-50">
              <p className="font-semibold text-gray-700 mb-2">
                👥 Select Team Members:
              </p>
              <Select
                isMulti
                options={
                  members.length > 0
                    ? members.map((member) => ({
                        value: member.id,
                        label: member.username,
                      }))
                    : editingTeam?.subteams?.flatMap((subteam) =>
                        subteam?.members?.map((member) => ({
                          value: member.id,
                          label: member.username,
                        }))
                      ) || []
                }
                value={teamData.member_ids
                  .map((id) => {
                    const foundMember =
                      members.find((m) => m.id === id) ||
                      editingTeam?.subteams
                        ?.flatMap((subteam) => subteam?.members)
                        ?.find((m) => m.id === id)
                    return foundMember
                      ? { value: foundMember.id, label: foundMember.username }
                      : null
                  })
                  .filter(Boolean)}
                onChange={handleMemberSelection}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              Update Team
            </button>
          </form>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 w-full">
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

export default EditTeam
