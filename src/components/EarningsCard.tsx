"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    loadRateAndCalculateEarnings();
  }, [year, month, refreshTrigger]);

  const loadRateAndCalculateEarnings = async () => {
    setIsLoading(true);
    try {
      // Load saved rate
      const rateSettings = await getRateSettings();
      if (rateSettings) {
        setDailyRate(rateSettings.dailyRate.toString());
      }

      // Calculate earnings
      const monthlyEarnings = await calculateMonthlyEarnings(year, month);
      setEarnings(monthlyEarnings);
    } catch (error) {
      console.error("Error loading rate and earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRate = async () => {
    const rate = parseFloat(dailyRate);
    if (isNaN(rate) || rate < 0) {
      alert("Please enter a valid rate amount");
      return;
    }

    setIsSaving(true);
    try {
      await saveRateSettings(rate);
      await loadRateAndCalculateEarnings(); // Recalculate earnings
    } catch (error) {
      console.error("Error saving rate:", error);
      alert("Error saving rate. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-muted-foreground">
            Loading earnings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Rate Input Section */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Rate Settings
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label
                htmlFor="dailyRate"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Rate per Day (₱)
              </Label>
              <Input
                id="dailyRate"
                type="number"
                min="0"
                step="0.01"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                placeholder="Enter your daily rate"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSaveRate}
                disabled={isSaving || !dailyRate}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Rate"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Earnings Display Section */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Earnings Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(earnings.totalEarnings)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Complete Days</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {earnings.completeDays}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Time-based earnings
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Partial Days</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {earnings.partialDays}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Time-based earnings
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {earnings.totalHours.toFixed(1)}h
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Rate: {formatCurrency(earnings.dailyRate)}/day
              </p>
            </div>
          </div>

          {/* Breakdown explanation */}
          {(earnings.completeDays > 0 || earnings.partialDays > 0) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Earnings Calculation:</strong> All earnings are
                calculated based on actual hours worked within standard work
                hours (8AM-12PM, 1PM-5PM = ₱
                {(earnings.dailyRate / 8).toFixed(2)}/hour). Complete days show
                you have all 4 time entries, but earnings still depend on actual
                time worked. Early arrivals don't increase earnings, and late
                arrivals reduce earnings.
              </p>
            </div>
          )}

          {earnings.dailyRate === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 Set your daily rate to see earnings calculations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
