import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Skeleton from "react-loading-skeleton";
import { realtimeDb, ref, onValue } from "../services/firebase";

// ✅ Epoch → IST conversion (handles seconds or millis)
const convertEpochToIST = (epoch) => {
  if (!epoch)
    return new Date().toLocaleString("en-IN", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

  // If epoch looks like seconds (10 digits), convert to millis
  const epochMillis = epoch < 1e12 ? epoch * 1000 : epoch;

  const date = new Date(epochMillis);
  return date.toLocaleString("en-IN", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

export default function History() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const dataRef = ref(realtimeDb, "health_data");

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const tempData = [];
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data && data.estimated_glucose > 0) {
            tempData.push({
              glucoseLevel: data.estimated_glucose,
              timestamp: data.timestamp || Date.now(), // ✅ fallback to current time
            });
          }
        });

        setHistoryData(tempData.reverse()); // latest first
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f5f9] relative overflow-hidden p-4">
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-[#c8e6f5] to-[#a2d9f7] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute top-[20%] right-[5%] w-56 h-56 sm:w-72 sm:h-72 lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-[#d4edda] to-[#88d6b8] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[5%] left-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-[300px] lg:h-[300px] bg-gradient-to-br from-[#fbe3e6] to-[#f6a6b2] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 w-full max-w-4xl p-6 rounded-lg shadow-xl bg-t">
          <Card>
            <CardContent className="p-4">
              <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">History</h1>
              <Skeleton count={8} height={40} className="mb-2" /> {/* Adjusted height for table rows */}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-600">Error loading history: {error.message}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f5f9] relative overflow-hidden p-4">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-[#c8e6f5] to-[#a2d9f7] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
      <div className="absolute top-[20%] right-[5%] w-56 h-56 sm:w-72 sm:h-72 lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-[#d4edda] to-[#88d6b8] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[5%] left-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-[300px] lg:h-[300px] bg-gradient-to-br from-[#fbe3e6] to-[#f6a6b2] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

      {/* Main History Content */}
      <div className="relative z-10 w-full max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Glucose History</h1>
        <Card>
          <CardContent className="p-4 overflow-x-auto"> {/* Added overflow-x-auto for responsiveness */}
            {historyData.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No glucose history available yet.</p>
            ) : (
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-sm font-semibold text-center text-gray-700">
                      Date & Time (IST)
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-center text-gray-700">
                      Glucose Level (mg/dL)
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-center text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((entry, index) => {
                    const formattedTime = convertEpochToIST(entry.timestamp);
                    const status =
                      entry.glucoseLevel < 70
                        ? "low"
                        : entry.glucoseLevel <= 100
                        ? "normal"
                        : entry.glucoseLevel <= 120
                        ? "moderate"
                        : "high";

                    let statusText, statusClass;
                    switch (status) {
                      case "low":
                        statusText = "Low";
                        statusClass = "text-red-600 font-medium";
                        break;
                      case "normal":
                        statusText = "Normal";
                        statusClass = "text-green-600 font-medium";
                        break;
                      case "moderate":
                        statusText = "Moderate";
                        statusClass = "text-yellow-600 font-medium";
                        break;
                      case "high":
                        statusText = "High";
                        statusClass = "text-orange-600 font-medium";
                        break;
                      default:
                        statusText = "";
                        statusClass = "";
                    }

                    return (
                      <tr key={index} className="text-center border-b last:border-b-0 hover:bg-gray-50">
                        <td className="px-6 py-3 text-xs text-gray-700">
                          {formattedTime}
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">
                          {entry.glucoseLevel}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={statusClass}>{statusText}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}