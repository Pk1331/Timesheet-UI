import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "../components/Auth/Login"
import PrivateRoute from "./PrivateRoute"
import NotFound from "../components/Auth/NotFound"
import ChangePassword from "../components/Auth/ChangePassword"
import { Toaster } from "react-hot-toast"
import { Suspense, lazy } from "react"

const UserDashboard = lazy(() =>
  import("../components/Dashboards/UserDashboard")
)
const TeamLeaderDashboard = lazy(() =>
  import("../components/Dashboards/TeamLeaderDashboard")
)
const AdminDashboard = lazy(() =>
  import("../components/Dashboards/AdminDashboard")
)
const SuperAdminDashboard = lazy(() =>
  import("../components/Dashboards/SuperAdminDashboard")
)

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/user-dashboard/*"
            element={
              <Suspense fallback={<p className="text-white p-4">Loading...</p>}>
                <PrivateRoute element={<UserDashboard />} />
              </Suspense>
            }
          />
          <Route
            path="/team-leader-dashboard/*"
            element={
              <Suspense fallback={<p className="text-white p-4">Loading...</p>}>
                <PrivateRoute element={<TeamLeaderDashboard />} />
              </Suspense>
            }
          />
          <Route
            path="/admin-dashboard/*"
            element={
              <Suspense fallback={<p className="text-white p-4">Loading...</p>}>
                <PrivateRoute element={<AdminDashboard />} />
              </Suspense>
            }
          />
          <Route
            path="/super-admin-dashboard/*"
            element={
              <Suspense fallback={<p className="text-white p-4">Loading...</p>}>
                <PrivateRoute element={<SuperAdminDashboard />} />
              </Suspense>
            }
          />

          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ChangePassword />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  )
}

export default App
