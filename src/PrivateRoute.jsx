import useAuthCheck from "../src/hooks/useAuthCheck"
import Lottie from "lottie-react"
import { motion } from "framer-motion"
import notFoundAnimation from "../src/assets/notfound.json"
import loadingAnimation from "../src/assets/loading.json" 

const PrivateRoute = ({ element }) => {
  const isAuthenticated = useAuthCheck()

  if (isAuthenticated === null) {
    // While checking auth
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 text-center">
        {/* Lottie Animation instead of spinner */}
        <Lottie
          animationData={loadingAnimation}
          loop
          className="w-[200px] h-[200px] md:w-[250px] md:h-[250px]"
        />

        {/* Main message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl md:text-2xl font-semibold tracking-wide"
        >
          Checking your authentication status...
        </motion.p>

        {/* Optional: Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-sm mt-2 text-gray-400"
        >
          Please hold on while we verify your session securely.
        </motion.p>
      </div>
    )
  }

  if (isAuthenticated === false) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white px-4 text-center">
        {/* Lottie Animation */}
        <Lottie
          animationData={notFoundAnimation}
          loop
          className="w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
        />

        {/* "Access Denied" */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mt-2 text-center tracking-wider font-['Poppins']"
        >
          Access Denied
        </motion.h1>

        {/* Glowing 403 */}
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="text-6xl md:text-7xl font-extrabold mt-2 text-red-500 neon-glow"
        >
          403
        </motion.p>

        {/* Message and Login Button */}
        <p className="text-sm md:text-md mt-6 text-gray-300">
          You are not authenticated. Please login to continue.
        </p>

        <a
          href="/"
          className="mt-4 inline-block px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition duration-300"
        >
          Go to Login
        </a>
      </div>
    )
  }

  return element
}

export default PrivateRoute
