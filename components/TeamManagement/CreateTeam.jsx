import React, { useState, useEffect } from "react"
import "react-toastify/dist/ReactToastify.css"
import Select from "react-select"
import { IoClose } from "react-icons/io5"
import api from "../../src/api"
import Lottie from "lottie-react"
import loaderAnimation from "../../src/assets/myloader2.json"

const CreateTeam = ({ closeModal, fetchTeams, showToast }) => {
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
  const [projects, setProjects] = useState([])
  const [loggedInUserId, setLoggedInUserId] = useState("")
  const [loggedInUsername, setLoggedInUsername] = useState("")
  const [loading, setLoading] = useState(false)

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

  // usertype and logged in user info From LocalStorage
  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")
    const userId = parseInt(localStorage.getItem("user_id"), 10)
    const username = localStorage.getItem("username")
    setUsertype(usertypeParam)
    setLoggedInUserId(userId)
    setLoggedInUsername(username)
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
        setTeamLeaders(response.data.users || [])
      } catch (error) {
        console.error("Error fetching team leaders:", error)
      }
    }
    fetchTeamLeaders()
  }, [])

  // Fetch members based on selected subteam
  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamData.subteam) return

      try {
        const response = await api.get(
          `users/?usertype=User&subteam=${teamData.subteam}`
        )
        const newMembers = response.data.users || []

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

  const teamSubTeams = {
    Search: ["SEO", "SEM", "SMO"],
    Creative: ["Design", "Content Writing"],
    Development: ["Python Development", "Web Development"],
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTeamData({ ...teamData, [name]: value })
  }

  const accountManagerOptions = accountManagers.map((manager) => ({
    value: manager.id,
    label: manager.username,
  }))

  const handleAccountManagerSelection = (selectedOptions) => {
    const managerIds = selectedOptions.map((option) => option.value)

    setTeamData((prevTeamData) => ({
      ...prevTeamData,
      account_manager_ids: managerIds, // Always an array
    }))
  }

  const memberOptions = members.map((member) => ({
    value: member.id,
    label: member.username,
  }))

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("teams/create/", teamData)
      showToast("Team created successfully!")
      setTeamData({
        name: "",
        description: "",
        account_manager_id: usertype === "Admin" ? loggedInUserId : "",
        team_leader_search: "",
        team_leader_development: "",
        team_leader_creative: "",
        team: "",
        subteam: "",
        member_ids: [],
        project_id: "",
      })
      if (closeModal) closeModal()
      if (fetchTeams) fetchTeams()
    } catch (error) {
      console.log(error)
      showToast("An error occurred while creating the team!", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative max-h-[80vh] overflow-y-auto border border-gray-200">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">Create Team</h3>

          {/* Close Icon */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          >
            <IoClose size={24} />
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select project */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Project</label>
              <select
                name="project_id"
                value={teamData.project_id}
                onChange={handleChange}
                required
                className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Name */}
            <input
              type="text"
              name="name"
              placeholder="Team Name"
              value={teamData.name}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />

            {/* Team Description */}
            <textarea
              name="description"
              placeholder="Description"
              value={teamData.description}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />

            {/* Account Manager */}
            {usertype === "Admin" ? (
              <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg w-full text-gray-700 font-medium">
                Account Manager:{" "}
                <span className="text-blue-600">{loggedInUsername}</span>
              </div>
            ) : (
              <div className="border border-gray-300 p-3 rounded-lg w-full bg-gray-50">
                <p className="font-semibold text-gray-700 mb-2">
                  Select Account Managers:
                </p>
                <Select
                  isMulti
                  options={accountManagerOptions}
                  required
                  value={accountManagerOptions.filter(
                    (option) =>
                      (teamData.account_manager_ids || []).includes(
                        option.value
                      ) // Ensure it's always an array
                  )}
                  onChange={handleAccountManagerSelection}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>
            )}

            {/* Select Team Leaders */}
            <div className="space-y-4">
              {["Search", "Development", "Creative"].map((team) => (
                <select
                  key={team}
                  name={`team_leader_${team.toLowerCase()}`}
                  value={teamData[`team_leader_${team.toLowerCase()}`]}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Select {team} Team Leader</option>
                  {teamLeaders
                    .filter((leader) => leader.team === team)
                    .map((leader) => (
                      <option key={leader.id} value={leader.id}>
                        {leader.username}
                      </option>
                    ))}
                </select>
              ))}
            </div>

            {/* Select Team  */}
            <select
              name="team"
              value={teamData.team}
              onChange={(e) => {
                handleChange(e)
                setMembers((prevMembers) => {
                  const selectedMemberIds = new Set(teamData.member_ids)
                  return prevMembers.filter((member) =>
                    selectedMemberIds.has(member.id)
                  )
                })
              }}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Select Team</option>
              {Object.keys(teamSubTeams).map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>

            {/* Select Sub-Team */}
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
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              >
                <option value="">Select Sub-Team</option>
                {teamSubTeams[teamData.team].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            )}

            {/* Select Members */}
            <div className="border border-gray-300 p-3 rounded-lg w-full bg-gray-50">
              <p className="font-semibold text-gray-700 mb-2">
                Select Team Members:
              </p>
              <Select
                isMulti
                options={memberOptions}
                value={memberOptions.filter((option) =>
                  teamData.member_ids.includes(option.value)
                )}
                onChange={handleMemberSelection}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              Create Team
            </button>
          </form>
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

export default CreateTeam
