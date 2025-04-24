import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Skeleton from "react-loading-skeleton"; // Import skeleton loader

const data = [
  { time: "2025-04-18 08:00", value: 95 },
  { time: "2025-04-18 10:00", value: 102 },
  { time: "2025-04-18 12:00", value: 110 },
  { time: "2025-04-18 14:00", value: 115 },
  { time: "2025-04-18 16:00", value: 120 },
  { time: "2025-04-18 18:00", value: 130 },
];

export default function History() {
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate data fetch with a timeout
    setTimeout(() => {
      setLoading(false); // Stop loading after 2 seconds
    }, 2000);
  }, []);

  if (loading) {
    // Show skeleton loader while loading
    return (
      <div className="min-h-screen p-4 bg-white md:p-8">
        <Card>
          <CardContent className="p-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-6 py-2 text-sm font-semibold text-center text-gray-700">
                    <Skeleton width={120} height={20} />
                  </th>
                  <th className="px-6 py-2 text-sm font-semibold text-center text-gray-700">
                    <Skeleton width={120} height={20} />
                  </th>
                  <th className="px-6 py-2 text-sm font-semibold text-center text-gray-700">
                    <Skeleton width={80} height={20} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Show skeleton rows while loading */}
                {[...Array(6)].map((_, index) => (
                  <tr key={index} className="text-center border-t">
                    <td className="px-6 py-2 text-sm text-gray-600">
                      <Skeleton width={120} height={20} />
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-600">
                      <Skeleton width={80} height={20} />
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-600">
                      <Skeleton width={100} height={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) return <div>Error loading history.</div>;

  return (
    <div className="min-h-screen p-4 bg-white md:p-8">
      {/* History Table */}
      <Card>
        <CardContent className="p-4">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-6 py-2 text-sm font-semibold text-center text-gray-700">
                  Date & Time
                </th>
                <th className="px-6 py-2 text-sm font-semibold text-center text-gray-700">
                  Glucose Level (mg/dL)
                </th>
                <th className="px-6 py-2 text-sm font-semibold text-center text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => {
                const formattedTime = format(new Date(entry.time), "MMM dd, yyyy hh:mm a");
                const status =
                  entry.value < 100 ? "normal" : entry.value < 120 ? "warning" : "high";
                return (
                  <tr key={index} className="text-center border-t">
                    <td className="px-6 py-2 text-xs text-gray-600 sm:text-xs">{formattedTime}</td>
                    <td className="px-6 py-2 text-sm text-gray-600">{entry.value}</td>
                    <td className="px-6 py-2 text-sm text-gray-600">
                      {entry.value < 100 ? (
                        <span className="text-green-600">Normal</span>
                      ) : entry.value < 120 ? (
                        <span className="text-yellow-600">Warning</span>
                      ) : (
                        <span className="text-red-600">High</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
