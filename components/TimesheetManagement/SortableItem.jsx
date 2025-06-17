import React, { useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FaGripLines } from "react-icons/fa"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import api from "../../src/api"
import { toast } from "react-toastify"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select"
import { IconButton, Tooltip } from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DeleteIcon from "@mui/icons-material/Delete"

export const SortableItem = ({
  id,
  index,
  row,
  usertype,
  handleChange,
  handleDuplicateRow,
  handleRemoveRow,
  projects,
  departments,
  fetchDepartments,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // const [startOfWeek, setStartOfWeek] = useState(null)
  // const [endOfWeek, setEndOfWeek] = useState(null)
  // const [showModal, setShowModal] = useState(false)
  // const [tempDate, setTempDate] = useState(null)
  // const [allowedDates, setAllowedDates] = useState([])

  // useEffect(() => {
  //   const currentDate = new Date()
  //   const start = new Date(currentDate)
  //   start.setDate(currentDate.getDate() - currentDate.getDay())

  //   const end = new Date(start)
  //   end.setDate(start.getDate() + 6)

  //   setStartOfWeek(start)
  //   setEndOfWeek(end)
  // }, [])

  // Rename Department
  const handleRename = async (dept) => {
    const newName = prompt("Rename department:", dept.name)
    if (newName && newName !== dept.name) {
      try {
        const response = await api.patch(
          `timesheet-tables/departments/${dept.id}/`,
          { name: newName }
        )
        toast.success(
          response.data.message || "Department renamed successfully"
        )
        fetchDepartments()
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Failed to rename department"
        )
      }
    }
  }

  // Delete Department
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await api.delete(
          `timesheet-tables/departments/${id}/delete/`
        )
        toast.success(
          response.data.message || "Department deleted successfully"
        )
        fetchDepartments()
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Failed to delete department"
        )
      }
    }
  }

  // Add Department
  const handleAddDepartment = async () => {
    const name = prompt("Enter new department name")
    if (name) {
      try {
        const response = await api.post(
          "timesheet-tables/departments/create/",
          {
            name,
          }
        )
        toast.success(response.data.message || "Department added successfully")
        fetchDepartments()
      } catch (error) {
        toast.error(
          error.response?.data?.name?.[0] ||
            error.response?.data?.error ||
            "Failed to add department"
        )
      }
    }
  }

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="border-b border-gray-300 hover:bg-gray-50 transition"
      >
        <td
          className="px-4 py-3 cursor-grab border-r border-gray-300 w-12"
          {...listeners}
        >
          <FaGripLines className="w-6 h-6 text-gray-500 hover:text-gray-700 transition" />
        </td>

        {/* Select Date */}
        <td className="px-4 py-3 border-r border-gray-300 w-auto min-w-[150px]">
          <DatePicker
            selected={row.date}
            onChange={(date) => handleChange(index, "date", date)}
            className="border p-2 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholderText="Select Date"
          />
        </td>

        {/* Select Project */}
        <td className="px-4 py-3 border-r border-gray-300 w-52">
          <Select
            value={row.project || ""}
            onValueChange={(value) => {
              handleChange(index, "project", value)
            }}
            disabled={projects.length === 0}
            s
          >
            <SelectTrigger
              className={`w-full bg-white text-black border border-gray-300 rounded-md shadow-sm`}
            >
              <SelectValue
                placeholder={
                  projects.length === 0
                    ? "No Project Assigned"
                    : "Select Project"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border border-gray-300 shadow-lg rounded-md">
              {projects.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No project assigned
                </div>
              ) : (
                projects.map((project) => (
                  <SelectItem
                    key={project.id}
                    value={project.name}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    {project.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </td>

        {/* Enter the Task */}
        <td className="px-4 py-3 border-r border-gray-300 w-auto min-w-[400px]">
          <Input
            type="text"
            value={row.task}
            onChange={(e) => {
              handleChange(index, "task", e.target.value)
            }}
            className={`w-full`}
            placeholder="Enter task"
          />
        </td>

        {/* Enter Description */}
        <td className="px-4 py-3 border-r border-gray-300 w-auto min-w-[200px]">
          <Textarea
            value={row.description}
            onChange={(e) => {
              handleChange(index, "description", e.target.value)
            }}
            className="w-full"
            placeholder="Enter description"
          />
        </td>

        {/* Select Department */}
        <td className="px-4 py-3 border-r border-gray-300 w-52">
          <Select
            value={row.department || ""}
            onValueChange={(value) => {
              handleChange(index, "department", value)
            }}
          >
            <SelectTrigger className="w-full bg-white text-black border border-gray-300 rounded-md shadow-sm">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border border-gray-300 shadow-lg rounded-md">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between px-2"
                >
                  <SelectItem
                    value={dept.name}
                    className="flex-grow bg-white text-black hover:bg-gray-100"
                  >
                    {dept.name}
                  </SelectItem>

                  {usertype === "Admin" && (
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => handleRename(dept)}>✏️</button>
                      <button onClick={() => handleDelete(dept.id)}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}
              {usertype === "Admin" && (
                <div className="border-t border-gray-200 mt-1 px-2 py-1">
                  <button
                    onClick={handleAddDepartment}
                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium cursor-pointer border-t border-gray-200"
                  >
                    ➕ Add Department
                  </button>
                </div>
              )}
            </SelectContent>
          </Select>
        </td>

        {/* Enter Hours */}
        <td className="px-4 py-3 border-r border-gray-300 min-w-[150px] text-center">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() =>
                handleChange(
                  index,
                  "hours",
                  Math.max(0, (parseFloat(row.hours) || 0) - 0.5).toFixed(1)
                )
              }
              className="px-2 py-1 bg-gray-200 rounded-l"
            >
              −
            </button>
            <input
              type="text"
              value={row.hours}
              onChange={(e) => {
                let value = e.target.value
                if (value === "") {
                  handleChange(index, "hours", "")
                  return
                }
                let floatValue = Math.max(
                  0,
                  Math.min(12, parseFloat(value) || 0)
                )
                handleChange(index, "hours", floatValue.toFixed(1))
              }}
              className="w-14 text-center border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="0-12"
            />
            <button
              onClick={() =>
                handleChange(
                  index,
                  "hours",
                  Math.min(12, (parseFloat(row.hours) || 0) + 0.5).toFixed(1)
                )
              }
              className="px-2 py-1 bg-gray-200 rounded-r"
            >
              +
            </button>
          </div>
        </td>

        {/* Actions */}
        <td className="px-4 py-3 border-r border-gray-300 min-w-[100px] text-center">
          <div className="flex items-center justify-center space-x-2">
            <Tooltip title="Duplicate Row">
              <IconButton
                onClick={() => handleDuplicateRow(index)}
                color="primary"
                size="small"
              >
                <ContentCopyIcon fontSize="medium" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Row">
              <IconButton
                onClick={() => handleRemoveRow(index)}
                color="error"
                size="small"
              >
                <DeleteIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </div>
        </td>
      </tr>

      {/* {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Request Access</h2>
            <p className="mb-4">
              You selected a restricted date:{" "}
              <span className="font-medium">{tempDate?.toDateString()}</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  // Optional: send API request to admin for approval
                  toast.success("Request sent to Admin")
                  setShowModal(false)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Request Access
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  )
}
