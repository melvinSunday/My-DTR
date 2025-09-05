"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  saveRateSettings,
  getRateSettings,
  calculateMonthlyEarnings,
} from "@/lib/db";

interface EarningsCardProps {
  year: number;
  month: number;
  refreshTrigger?: number;
}

export default function EarningsCard({
  year,
  month,
  refreshTrigger,
}: EarningsCardProps) {
  const [dailyRate, setDailyRate] = useState<string>("");
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    workingDays: 0,
    completeDays: 0,
    partialDays: 0,
    totalHours: 0,
    dailyRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // memoize the load function to prevent unnecessary re-creations
  const loadRateAndCalculateEarnings = useCallback(async () => {
    setIsLoading(true);
    try {
      const rateSettings = await getRateSettings();
      if (rateSettings) {
        setDailyRate(rateSettings.dailyRate.toString());
      }

      const monthlyEarnings = await calculateMonthlyEarnings(year, month);
      setEarnings(monthlyEarnings);
    } catch (error) {
      console.error("Error loading rate and earnings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadRateAndCalculateEarnings();
  }, [loadRateAndCalculateEarnings, refreshTrigger]);

  const handleSaveRate = useCallback(async () => {
    const rate = parseFloat(dailyRate);
    if (isNaN(rate) || rate < 0) {
      alert("Please enter a valid rate amount");
      return;
    }

    setIsSaving(true);
    try {
      await saveRateSettings(rate);
      await loadRateAndCalculateEarnings();
    } catch (error) {
      console.error("Error saving rate:", error);
      alert("Error saving rate. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [dailyRate, loadRateAndCalculateEarnings]);

  // memoize currency formatting to prevent unnecessary re-calculations
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  // memoize formatted earnings values to prevent unnecessary re-calculations
  const formattedEarnings = useMemo(
    () => ({
      totalEarnings: formatCurrency(earnings.totalEarnings),
      dailyRate: formatCurrency(earnings.dailyRate),
      totalHours: earnings.totalHours.toFixed(1),
    }),
    [
      earnings.totalEarnings,
      earnings.dailyRate,
      earnings.totalHours,
      formatCurrency,
    ]
  );

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950 rounded-2xl border border-gray-100 dark:border-neutral-800 backdrop-blur-sm mb-4 sm:mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5"></div>
        <div className="relative p-4 sm:p-8 flex items-center justify-center py-12 sm:py-16">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-600 rounded-full"
              />
            </div>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              Loading earnings data...
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950 rounded-2xl border border-gray-100 dark:border-neutral-800 backdrop-blur-sm mb-4 sm:mb-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* Animated background patterns */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 50%, rgba(16, 185, 129, 0.05) 100%)",
            "linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(147, 51, 234, 0.05) 100%)",
            "linear-gradient(90deg, rgba(147, 51, 234, 0.05) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      />
      <motion.div
        animate={{
          x: [-80, -60, -80],
          y: [-80, -60, -80],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -translate-x-16 sm:-translate-x-20 -translate-y-16 sm:-translate-y-20"
      />
      <motion.div
        animate={{
          x: [64, 48, 64],
          y: [64, 48, 64],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-tl from-purple-400/10 to-transparent rounded-full translate-x-12 sm:translate-x-16 translate-y-12 sm:translate-y-16"
      />

      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
          {/* Rate Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 w-full lg:max-w-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center space-x-3 mb-4 sm:mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base"
              >
                ₱
              </motion.div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Daily Rate Settings
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-4"
            >
              <div>
                <Label
                  htmlFor="dailyRate"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                >
                  Rate per Day (₱)
                </Label>
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <Input
                    id="dailyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    placeholder="Enter your daily rate"
                    className="h-11 sm:h-12 text-base sm:text-lg font-medium bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-gray-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-neutral-800 pr-12"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium text-sm">
                      PHP
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSaveRate}
                  disabled={isSaving || !dailyRate}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
                >
                  <AnimatePresence mode="wait">
                    {isSaving ? (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Saving Rate...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="save"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <motion.svg
                          whileHover={{ scale: 1.1 }}
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                        <span>Save Rate</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Earnings Display Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-1 w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center space-x-3 mb-4 sm:mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </motion.div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Monthly Earnings
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Earnings Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 rounded-xl p-4 sm:p-5 border border-emerald-200/50 dark:border-emerald-800/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  >
                    ₱
                  </motion.div>
                </div>
                <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                  Total Earnings
                </p>
                <motion.p
                  key={earnings.totalEarnings}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400"
                >
                  {formattedEarnings.totalEarnings}
                </motion.p>
              </motion.div>

              {/* Complete Days Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-xl p-4 sm:p-5 border border-blue-200/50 dark:border-blue-800/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </motion.svg>
                  </motion.div>
                </div>
                <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Complete Days
                </p>
                <motion.p
                  key={earnings.completeDays}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400"
                >
                  {earnings.completeDays}
                </motion.p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 font-medium">
                  Full attendance
                </p>
              </motion.div>

              {/* Partial Days Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(147, 51, 234, 0.1), 0 10px 10px -5px rgba(147, 51, 234, 0.04)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 rounded-xl p-4 sm:p-5 border border-purple-200/50 dark:border-purple-800/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center"
                  >
                    <motion.svg
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </motion.svg>
                  </motion.div>
                </div>
                <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Partial Days
                </p>
                <motion.p
                  key={earnings.partialDays}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400"
                >
                  {earnings.partialDays}
                </motion.p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 font-medium">
                  Incomplete hours
                </p>
              </motion.div>

              {/* Total Hours Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(249, 115, 22, 0.1), 0 10px 10px -5px rgba(249, 115, 22, 0.04)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 rounded-xl p-4 sm:p-5 border border-orange-200/50 dark:border-orange-800/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center"
                  >
                    <motion.svg
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </motion.svg>
                  </motion.div>
                </div>
                <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                  Total Hours
                </p>
                <motion.p
                  key={earnings.totalHours}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400"
                >
                  {formattedEarnings.totalHours}h
                </motion.p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1 font-medium">
                  @ {formattedEarnings.dailyRate}/day
                </p>
              </motion.div>
            </div>

            {/* Information Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
            >
              <AnimatePresence>
                {(earnings.completeDays > 0 || earnings.partialDays > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4 sm:p-5 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{
                        background: [
                          "linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)",
                          "linear-gradient(90deg, rgba(147, 51, 234, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0"
                    />
                    <div className="relative flex items-start space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
                          Earnings Calculation Method
                        </h4>
                        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                          All earnings are calculated based on actual hours
                          worked within standard work hours (8AM-12PM, 1PM-5PM =
                          ₱{(earnings.dailyRate / 8).toFixed(2)}/hour). Complete
                          days show you have all 4 time entries, but earnings
                          still depend on actual time worked. Early arrivals
                          don't increase earnings, and late arrivals reduce
                          earnings.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {earnings.dailyRate === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-red-950/30 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl p-4 sm:p-5 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{
                        background: [
                          "linear-gradient(90deg, rgba(234, 179, 8, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)",
                          "linear-gradient(90deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 179, 8, 0.05) 100%)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0"
                    />
                    <div className="relative flex items-start space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1 text-sm sm:text-base">
                          Rate Required
                        </h4>
                        <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                          Set your daily rate above to see detailed earnings
                          calculations and insights.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
