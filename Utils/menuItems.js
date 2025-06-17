import {
  FaTasks,
  FaUsers,
  FaClipboardList,
  FaUserCog,
  FaClock,
  FaChartBar,
  FaTelegram,
  FaComments, 
} from "react-icons/fa"

// Common menu for roles like Admin, TeamLeader, User
const commonMenu = [
  { title: "Projects", icon: FaTasks, key: "projects/view-assigned" },
  { title: "Teams", icon: FaUsers, key: "teams/assigned" },
  { title: "Tasks", icon: FaClipboardList, key: "tasks/assigned" },
  { title: "Timesheets", icon: FaClock, key: "timesheets" },
]

// Chat Menu Item to be reused
const chatMenuItem = {
  title: "Chat",
  icon: FaComments,
  key: "chat",
}

// Full menu configuration
const menuItems = {
  SuperAdmin: [
    { title: "Projects", icon: FaTasks, key: "projects/list" },
    { title: "Teams", icon: FaUsers, key: "teams/list" },
    { title: "Tasks", icon: FaClipboardList, key: "tasks/list" },
    { title: "Users", icon: FaUserCog, key: "users-list" },
    ...commonMenu.slice(3),
    {
      title: "Reports & Analytics",
      icon: FaChartBar,
      key: "reports-and-analytics",
    },
    { title: "Telegram", icon: FaTelegram, key: "send-message" },
    chatMenuItem,
  ],
  Admin: [
    ...commonMenu,
    {
      title: "Reports & Analytics",
      icon: FaChartBar,
      key: "reports-and-analytics",
    },
    { title: "Telegram", icon: FaTelegram, key: "send-message" },
    chatMenuItem,
  ],
  TeamLeader: [
    ...commonMenu,
    {
      title: "Reports & Analytics",
      icon: FaChartBar,
      key: "reports-and-analytics",
    },
    { title: "Telegram", icon: FaTelegram, key: "send-message" },
    chatMenuItem,
  ],
  User: [
    ...commonMenu,
    { title: "Telegram", icon: FaTelegram, key: "send-message" },
    chatMenuItem,
  ],
}

export default menuItems
