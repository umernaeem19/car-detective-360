
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mx-auto"
            >
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-16 w-16 text-blue-600" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md"
              >
                <div className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  404
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          
          <p className="text-gray-600 mb-8">
            We couldn't find the page you're looking for. It may have been moved or doesn't exist.
          </p>
          
          <Link to="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
