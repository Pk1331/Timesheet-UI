import React, { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import api from "../../src/api"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { format } from "date-fns"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select"

const EditTimesheetTable = ({
  editingTable,
  setEditingTable,
  fetchTimesheetTables,
}) => {
  const [rows, setRows] = useState([])
  const [originalRows, setOriginalRows] = useState([])
  const [projects, setProjects] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    const usertypeParam = localStorage.getItem("usertype")
    if (editingTable) {
      setRows(editingTable)
      setOriginalRows(editingTable)
    }
    fetchProjects(usertypeParam)
    fetchDepartments()
  }, [editingTable])

  // Fetch projects
  const fetchProjects = async (usertypeParam) => {
    try {
      const url =
        usertypeParam === "SuperAdmin" ? "projects/" : "projects/assigned/"
      const projectsResponse = await api.get(url)
      setProjects(projectsResponse.data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await api.get("timesheets/departments/")
      setDepartments(response.data.departments || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

   // Handling State Chnages
  const handleChange = (index, field, value) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    )
    setRows(updated)
  }


  // Checking Date &b Data  Changes Done or Not in the Editing 
  const normalizeRows = (data) =>
    data.map((row) => ({
      ...row,
      date: row.date ? format(new Date(row.date), "yyyy-MM-dd") : null,
    }))
  const hasChanges = () => {
    const current = normalizeRows(rows)
    const original = normalizeRows(originalRows)
    return JSON.stringify(current) !== JSON.stringify(original)
  }

  // Sending Changes to Backend
  const handleSave = async () => {
    try {
      const formattedRows = rows.map((row) => ({
        ...row,
        date: row.date ? format(new Date(row.date), "yyyy-MM-dd") : null,
      }))

      const response = await api.put("timesheets/edit/", {
        timesheets: formattedRows,
      })

      if (response.data.status === "success") {
        toast.success("Timesheet table updated successfully!")
        fetchTimesheetTables()
        setEditingTable(null)
      } else {
        toast.error("Failed to update timesheet table!")
      }
    } catch (error) {
      toast.error("An error occurred while updating the timesheet table!")
    }
  }

  return (
    <div className="p-8 mt-5 bg-white rounded-lg shadow-lg">
      <ToastContainer />
      <h3 className="text-xl font-bold mb-4">Edit Timesheet Table</h3>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[1000px] table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Project</th>
              <th className="px-4 py-2 border">Task</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Department</th>
              <th className="px-4 py-2 border">Hours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2">
                  <DatePicker
                    selected={row.date ? new Date(row.date) : null}
                    onChange={(date) => handleChange(index, "date", date)}
                    className="border p-2 rounded w-full"
                    placeholderText="Select Date"
                  />
                </td>
                <td className="border px-4 py-2 w-52">
                  <Select
                    value={row.project || ""}
                    onValueChange={(value) =>
                      handleChange(index, "project", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-white text-black border border-gray-300 rounded-md shadow-sm">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border border-gray-300 shadow-lg rounded-md">
                      {projects.map((project) => (
                        <SelectItem
                          key={project.id}
                          value={project.name}
                          className="bg-white text-black hover:bg-gray-100"
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={row.task}
                    onChange={(e) =>
                      handleChange(index, "task", e.target.value)
                    }
                    className="border p-2 rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2">
                  <textarea
                    value={row.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    className="border p-2 rounded w-full"
                  />
                </td>
                <td className="border px-4 py-2 w-52">
                  <Select
                    value={row.department || ""}
                    onValueChange={(value) =>
                      handleChange(index, "department", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-white text-black border border-gray-300 rounded-md shadow-sm">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border border-gray-300 shadow-lg rounded-md">
                      {departments.map((dept) => (
                        <SelectItem
                          key={dept.id}
                          value={dept.name}
                          className="bg-white text-black hover:bg-gray-100"
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="number"
                    value={row.hours}
                    onChange={(e) =>
                      handleChange(index, "hours", e.target.value)
                    }
                    className="border p-2 rounded w-full"
                    min="0"
                    step="0.5"
                    max="10"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="flex justify-end mt-4 space-x-2">
        {/* Cancel Button */}
        <button
          onClick={() => setEditingTable(null)}
          className="bg-red-400 text-white p-2 rounded"
        >
          Cancel
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges()}
          className={`p-2 rounded text-white ${
            hasChanges() ? "bg-blue-500" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default EditTimesheetTable
