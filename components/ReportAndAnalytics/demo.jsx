import React, { useState, useEffect } from "react"
import DateSelection from "./DateSelection"
import ReportHeader from "./ReportHeader"
import ReportMain from "./ReportMain"
import { Box, Container } from "@mui/material"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parse,
  isValid,
  add,
  sub,
} from "date-fns"

const ReportsAndAnalytics = () => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    type: "This Week",
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
  })

  const [selectedUser, setSelectedUser] = useState("")
  const [selectedProject, setSelectedProject] = useState("")

  const handleDateChange = (type, dateRange, direction = "next") => {
    let startDate, endDate
    const currentDate = new Date() // You can replace this with the current startDate of the selected range

    switch (type) {
      case "This Week":
        if (direction === "next") {
          startDate = add(startOfWeek(currentDate, { weekStartsOn: 1 }), {
            weeks: 1,
          })
          endDate = endOfWeek(startDate, { weekStartsOn: 1 })
        } else if (direction === "previous") {
          startDate = sub(startOfWeek(currentDate, { weekStartsOn: 1 }), {
            weeks: 1,
          })
          endDate = endOfWeek(startDate, { weekStartsOn: 1 })
        }
        break
      case "This Month":
        if (direction === "next") {
          startDate = add(startOfMonth(currentDate), { months: 1 })
          endDate = endOfMonth(startDate)
        } else if (direction === "previous") {
          startDate = sub(startOfMonth(currentDate), { months: 1 })
          endDate = endOfMonth(startDate)
        }
        break
      case "This Year":
        if (direction === "next") {
          startDate = add(startOfYear(currentDate), { years: 1 })
          endDate = endOfYear(startDate)
        } else if (direction === "previous") {
          startDate = sub(startOfYear(currentDate), { years: 1 })
          endDate = endOfYear(startDate)
        }
        break
      case "Custom":
        if (typeof dateRange !== "string") {
          console.error(
            "Expected dateRange to be a string, but got:",
            dateRange
          )
          return
        }

        const [customStart, customEnd] = dateRange.split(" → ")

        // Parse custom start and end dates
        const parsedStartDate = parse(customStart, "dd/MM/yyyy", new Date())
        const parsedEndDate = parse(customEnd, "dd/MM/yyyy", new Date())

        if (isValid(parsedStartDate) && isValid(parsedEndDate)) {
          startDate = parsedStartDate
          endDate = parsedEndDate
        } else {
          console.error("Invalid custom date range format")
          return
        }
        break

      default:
        return
    }

    setSelectedDateRange({ type, startDate, endDate })
  }

  // Fetching data when selectedDateRange changes
  useEffect(() => {
    console.log(
      "Fetching Data for:",
      selectedDateRange, // Log the updated selected date range
      selectedUser,
      selectedProject
    )
  }, [selectedDateRange, selectedUser, selectedProject]) // Trigger when selectedDateRange changes

  return (
    <Container maxWidth="lg">
      <Box display="flex" flexDirection="column" gap={2} mt={3}>
        {/* Pass handleDateChange to DateSelection */}
        <DateSelection onDateChange={handleDateChange} />
        <ReportHeader
          selectedDateRange={selectedDateRange}
          setSelectedUser={setSelectedUser}
          setSelectedProject={setSelectedProject}
        />
        <ReportMain
          selectedDateRange={selectedDateRange}
          selectedUser={selectedUser}
          selectedProject={selectedProject}
        />
      </Box>
    </Container>
  )
}

export default ReportsAndAnalytics
