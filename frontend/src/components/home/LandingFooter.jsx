import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">AlgoTraceX</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Master DSA with interactive visualizations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/home" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  to="/legal#privacy"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal#terms"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>
        <motion.div
          className="border-t border-gray-200 dark:border-neutral-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p>&copy; {new Date().getFullYear()} AlgoTraceX. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default LandingFooter;

