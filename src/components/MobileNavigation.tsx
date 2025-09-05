"use client";

import { useState, useEffect } from "react";
import { Sling as Hamburger } from "hamburger-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { exportDTRToCSV, clearAllDTREntries } from "@/lib/db";
import { downloadCSV, getMonthName } from "@/lib/utils";
import { Download, Trash2, Calendar, X } from "lucide-react";
import MobileDatePicker from "./MobileDatePicker";

interface MobileNavigationProps {
  year: number;
  month: number;
  onDateChange: (year: number, month: number) => void;
  onDataCleared: () => void;
}

export default function MobileNavigation({
  year,
  month,
  onDateChange,
  onDataCleared,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = await exportDTRToCSV(year, month);
      const filename = `DTR_${getMonthName(month)}_${year}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting CSV. Please try again.");
    } finally {
      setIsExporting(false);
      setIsOpen(false); // close menu after export
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllDTREntries();
      onDataCleared();
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Error clearing data. Please try again.");
    } finally {
      setIsClearing(false);
      setIsOpen(false); // close menu after clear
    }
  };

  const handleDatePickerOpen = () => {
    setShowDatePicker(true);
    setIsOpen(false); // close main menu when opening date picker
  };

  const handleDatePickerClose = () => {
    setShowDatePicker(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Hamburger menu on the left */}
          <div className="mobile-nav-container">
            <div className="text-gray-700 dark:text-gray-300">
              <Hamburger
                toggled={isOpen}
                toggle={setIsOpen}
                rounded
                size={24}
                color="currentColor"
              />
            </div>
          </div>

          {/* app title and current month on the right */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg text-right font-bold text-gray-900 dark:text-white">
                My DTR
              </h1>
              <p className="text-xs text-muted-foreground">
                {getMonthName(month)} {year}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-neutral-900 shadow-2xl z-50 lg:hidden mobile-nav-container"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      My DTR
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Menu Content - scrollable area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Select Period
                    </h3>

                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            Current Period
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {getMonthName(month)} {year}
                          </p>
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleDatePickerOpen}
                          className="w-full justify-center h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Change Period
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Actions
                    </h3>

                    <div className="space-y-3">
                      {/* Export Button */}
                      <Button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isExporting ? "Exporting..." : "Export to CSV"}
                      </Button>

                      {/* Clear Data Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            disabled={isClearing}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isClearing ? "Clearing..." : "Clear All Data"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete all your DTR entries.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleClearData}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Clear All Data
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>

                {/* App Info Footer - always at bottom */}
                <div className="border-t border-gray-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">My DTR v1.0</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Offline-first time tracking
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Date Picker Overlay */}
      <AnimatePresence>
        {showDatePicker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={handleDatePickerClose}
            />

            {/* Date Picker Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4"
            >
              <MobileDatePicker
                year={year}
                month={month}
                onDateChange={onDateChange}
                onClose={handleDatePickerClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
