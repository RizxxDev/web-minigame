import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 relative z-10">
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          {/* Animated Wrench Icon */}
          <motion.div
            className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wrench className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Under Maintenance
          </h1>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            We're currently performing scheduled maintenance to improve your gaming experience. 
            Please check back in a few minutes.
          </p>

          <div className="flex items-center justify-center space-x-2 text-gray-400 mb-8">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Estimated time: 15-30 minutes</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="mt-6 text-xs text-gray-500">
            Follow us on social media for updates
          </div>
        </div>
      </motion.div>
    </div>
  );
}