import React from "react"
import { Routes, Route } from "react-router-dom"
import ProjectSummary from "../Home/ProjectSummary"
import TaskManagement from "../TaskManagement/TaskManagement"
import TimesheetManagement from "../TimesheetManagement/TimesheetManagement"
import Profile from "../Common/Profile"
import Logout from "../Auth/Logout"
import ProjectManagement from "../ProjectManagement/ProjectManagement"
import TeamManagement from "../TeamManagement/TeamManagement"
import UserManagement from "../UserManagement/UserManagement"
import ReportsAndAnalytics from "../ReportAndAnalytics/ReportsAndAnalytics"
import SendTelegram from "./SendTelegram"
import Chat from "./Chat"

const DashboardRoutes = ({ usertype }) => {
  return (
    <Routes>
      {/* Common Routes for All Users */}
      <Route path="dashboard" element={<ProjectSummary />} />
      <Route path="projects/*" element={<ProjectManagement />} />
      <Route path="teams/*" element={<TeamManagement />} />
      <Route path="tasks/*" element={<TaskManagement />} />
      <Route path="timesheets/*" element={<TimesheetManagement />} />
      <Route path="reports-and-analytics" element={<ReportsAndAnalytics />} />
      <Route path="chat" element={<Chat />} />
      <Route path="profile" element={<Profile />} />
      <Route path="logout" element={<Logout />} />
      <Route path="send-message" element={<SendTelegram />} />
      <Route path="*" element={<ProjectSummary />} />

      {/* SuperAdmin Exclusive Routes */}
      {usertype === "SuperAdmin" && (
        <Route path="users-list" element={<UserManagement />} />
      )}
    </Routes>
  )
}

export default DashboardRoutes
