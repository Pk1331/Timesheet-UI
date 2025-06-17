import React from "react"
import { Clock10 } from "lucide-react"

const ReportsAndAnalytics = () => {
  return (
    <div className="flex items-center justify-center h-[80vh] bg-gradient-to-br from-gray-100 to-white">
      <div className="text-center p-6 rounded-xl shadow-xl bg-white border border-gray-200 max-w-md">
        <div className="flex justify-center mb-4">
          <Clock10 className="w-12 h-12 text-indigo-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          This feature is coming soon. Stay tuned!
        </p>
        <div className="mt-4 text-sm text-gray-500">
          We’re working hard to give you insights that matter.
        </div>
      </div>
    </div>
  )
}

export default ReportsAndAnalytics
