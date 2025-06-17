import React, { useState, useEffect } from "react"
import "react-datepicker/dist/react-datepicker.css"
import { FaSave } from "react-icons/fa"
import api from "../../src/api"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { format } from "date-fns"
import { FiPlusCircle } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem } from "./SortableItem"

// Start of the CreateTimesheet component
const CreateTimesheet = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([
    {
      id: 1,
      date: new Date(),
      project: "",
      task: "",
      description: "",
      department: "",
      hours: 0,
    },
  ])
  const [usertype, setUsertype] = useState("")
  const [projects, setProjects] = useState([])
  const [departments, setDepartments] = useState([])
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")

    setUsertype(usertypeParam)
    fetchProjects(usertypeParam)
    fetchDepartments()
    validateRows()
  }, [rows])

  // Fetch Projects
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

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const response = await api.get("timesheets/departments/")
      setDepartments(response.data.departments || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  // Handle Changes
  const handleChange = (index, field, value) => {
    const newRows = rows.map((row, i) => {
      if (i === index) {
        if (row[field] === value) {
          console.log(`No change detected for field: ${field}`)
          return row
        }

        let updatedRow = { ...row, [field]: value }

        if (field === "project") {
          const selectedProject = projects.find(
            (project) => project.name === value
          )

          if (selectedProject && selectedProject.teams?.length > 0) {
            const accountManagers =
              selectedProject.teams[0].account_managers || []
            updatedRow.submittedTo =
              accountManagers.length > 0 ? accountManagers[0].username : ""
          } else {
            updatedRow.submittedTo = ""
          }
        }

        return updatedRow
      }
      return row
    })

    setRows(newRows)
  }

  // Handle Row Below
  const handleAddRowBelow = (index) => {
    const newRow = {
      id: rows.length + 1,
      date: new Date(),
      task: "",
      description: "",
      hours: 0,
      project: "",
    }
    const newRows = [...rows]
    newRows.splice(index + 1, 0, newRow)
    setRows(newRows)
  }

  // Duplicate row function
  const handleDuplicateRow = (index) => {
    const newRow = {
      ...rows[index],
      id: rows.length + 1,
      date: rows[index].date ? new Date(rows[index].date) : new Date(),
    }
    const newRows = [...rows]
    newRows.splice(index + 1, 0, newRow)
    setRows(newRows)
  }

  // Remove row function
  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      const newRows = rows
        .filter((_, i) => i !== index)
        .map((row, i) => ({ ...row, id: i + 1 }))
      setRows(newRows)
    }
  }

  // Handle Drag Row
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setRows((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Validate Rows
  const validateRows = () => {
    const isValid = rows.every(
      (row) =>
        row.date &&
        row.project &&
        row.task.trim() &&
        row.description.trim() &&
        row.department &&
        row.hours > 0
    )

    setIsSaveDisabled(!isValid)
  }

  // Handle Save
  const handleSave = () => {
    if (isSaveDisabled) {
      toast.error("Please fill in all details before saving.")
      return
    }

    setShowSaveConfirm(true)
  }

  const confirmSave = async () => {
    try {
      const formattedRows = rows.map(({ submittedTo, ...rest }) => ({
        ...rest,
        date: rest.date
          ? format(rest.date, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        task: rest.task.trim(),
        description: rest.description.trim(),
        hours: parseFloat(rest.hours) || 0,
        submitted_to: submittedTo,
      }))

      const response = await api.post("timesheets/create/", {
        timesheets: formattedRows,
      })

      if (response.data.status === "success") {
        toast.success("Timesheet table saved successfully!")

        setRows([
          {
            id: 1,
            date: new Date(),
            project: "",
            task: "",
            description: "",
            department: "",
            hours: 0,
            submittedTo: "",
          },
        ])

        const DASHBOARD_PATHS = {
          admin: "/admin-dashboard",
          teamleader: "/team-leader-dashboard",
          user: "/user-dashboard",
        }

        const userType = (localStorage.getItem("usertype") || "").toLowerCase()
        const dashboardPath = DASHBOARD_PATHS[userType] || "/user-dashboard"

        toast.info(
          "Timesheet saved! Redirecting to Timesheet List where you can edit, delete, and send for review."
        )

        setTimeout(() => {
          navigate(`${dashboardPath}/timesheets/list`)
        }, 5000)
      } else {
        toast.error("Failed to save timesheet table!")
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`)
      } else {
        toast.error("An unexpected error occurred while saving the timesheet!")
      }
    } finally {
      setShowSaveConfirm(false)
    }
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-md ">
      <ToastContainer />
      <h3 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">
        Create Timesheet
      </h3>

      <div className="overflow-x-auto max-w-full">
        {typeof window !== "undefined" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rows}
              strategy={verticalListSortingStrategy}
            >
              <table className=" w-full border border-gray-300 rounded-xl shadow-md bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left border-b border-gray-300">
                    <th className="bg-white border-r border-gray-300 w-10"></th>
                    {[
                      "Date",
                      "Project",
                      "Task",
                      "Description",
                      "Department",
                      "Hours",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-5 py-4 font-semibold uppercase text-sm tracking-wide border-gray-300 border-b"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <SortableItem
                      key={row.id}
                      id={row.id}
                      index={index}
                      row={row}
                      usertype={usertype}
                      handleChange={handleChange}
                      handleRemoveRow={handleRemoveRow}
                      handleDuplicateRow={handleDuplicateRow}
                      projects={projects}
                      departments={departments}
                      fetchDepartments={fetchDepartments}
                    />
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        {/* Add Row Button */}
        <button
          onClick={() => handleAddRowBelow(rows.length - 1)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow transition-all duration-200 ease-in-out group"
          title="Add a new row"
        >
          <FiPlusCircle
            size={20}
            className="group-hover:scale-110 transition-transform duration-200"
          />
          <span className="text-sm font-medium">Add Row</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className={`px-4 py-2 rounded-lg shadow flex items-center gap-2 ${
            isSaveDisabled
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          title="Save the changes"
        >
          <FaSave />
          <span className="text-sm font-medium">Save</span>
        </button>
      </div>

      {showSaveConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Confirm Save</h3>
            <p>Are you sure you want to save this timesheet table?</p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="bg-gray-500 text-white p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateTimesheet
