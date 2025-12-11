import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer, // This component was missing its closing tag
} from "recharts";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  HeartPulse,
  Droplet,
  Activity,
  Gauge,
  MessageCircle,
} from "lucide-react";
import { useSpring, animated } from "react-spring";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import GeminiChat from "@/components/GeminiChat";
import { realtimeDb, ref, onValue } from "../services/firebase";

const auth = getAuth();

// ✅ Epoch → IST conversion (handles seconds or millis)
const convertEpochToIST = (epoch) => {
  if (!epoch) {
    return new Date().toLocaleString("en-IN", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  }

  const epochMillis = epoch < 1e12 ? epoch * 1000 : epoch;
  const date = new Date(epochMillis);

  return date.toLocaleString("en-IN", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

// Pseudo-HRV calculation
const calculateHRV = ({ heartRate, systolicBP, diastolicBP, spo2, glucose }) => {
  let hrv = 80 - Math.abs(70 - heartRate);
  const bpFactor = ((140 - systolicBP) + (90 - diastolicBP)) / 2;
  hrv += bpFactor * 0.1;
  hrv += (spo2 - 95) * 0.2;
  hrv -= Math.max(0, glucose - 100) * 0.1;
  return Math.max(20, Math.min(120, Math.round(hrv)));
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const [liveData, setLiveData] = useState({
    glucoseLevel: 0,
    heartRate: 0,
    spo2: 0,
    hrv: 0,
    bloodPressure: "0/0",
    profileName: "User",
    profileImage: "",
    lastUpdated: "",
  });

  const [status, setStatus] = useState("normal");
  const [historyData, setHistoryData] = useState([]);

  // Fetch history (latest 20 readings only)
  useEffect(() => {
    const dataRef = ref(realtimeDb, "health_data");

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const tempData = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data && data.estimated_glucose > 0) {
          const time = convertEpochToIST(data.timestamp || Date.now());
          tempData.push({
            time,
            value: data.estimated_glucose,
          });
        }
      });
      setHistoryData(tempData.slice(-20)); // ✅ only keep latest 20
    });

    return () => unsubscribe();
  }, []);

  // Realtime DB listener & Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
      // Set profile image and name from localStorage if available
      const storedProfileImage = localStorage.getItem("profileImage");
      const storedProfileName = localStorage.getItem("profileName");
      if (storedProfileImage) {
        setLiveData((prev) => ({ ...prev, profileImage: storedProfileImage }));
      }
      if (storedProfileName) {
        setLiveData((prev) => ({ ...prev, profileName: storedProfileName }));
      }
    });

    const dataRef = ref(realtimeDb, "health_data");
    const unsubscribeDb = onValue(dataRef, (snapshot) => {
      // Find the latest entry in the snapshot
      let latestData = null;
      let latestTimestamp = 0;

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data && data.timestamp > latestTimestamp) {
          latestTimestamp = data.timestamp;
          latestData = data;
        }
      });

      if (latestData) {
        const systolicBP = Math.round(90 + 0.5 * latestData.heartRate);
        const diastolicBP = Math.round(60 + 0.3 * latestData.heartRate);

        const currentTime = convertEpochToIST(latestData.timestamp || Date.now());

        setLiveData((prev) => ({
          ...prev,
          glucoseLevel: latestData.estimated_glucose ?? prev.glucoseLevel,
          heartRate: latestData.heartRate ?? prev.heartRate,
          spo2: latestData.spo2 ?? prev.spo2,
          hrv: calculateHRV({
            heartRate: latestData.heartRate,
            systolicBP,
            diastolicBP,
            spo2: latestData.spo2,
            glucose: latestData.estimated_glucose,
          }),
          bloodPressure: `${systolicBP}/${diastolicBP}`,
          lastUpdated: currentTime,
        }));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDb();
    };
  }, [navigate]);

  // Animated glucose number
  const animatedGlucose = useSpring({
    number: liveData.glucoseLevel,
    from: { number: 0 },
    config: { mass: 1, tension: 170, friction: 26 }, // Smooth animation
  });

  // Status check
  useEffect(() => {
    if (liveData.glucoseLevel < 70) setStatus("low");
    else if (liveData.glucoseLevel <= 100) setStatus("normal");
    else if (liveData.glucoseLevel <= 120) setStatus("moderate");
    else setStatus("high");
  }, [liveData.glucoseLevel]);

  const statusColors = {
    low: "text-red-600",
    normal: "text-green-600",
    moderate: "text-yellow-600",
    high: "text-orange-600",
  };

  const getHeartRateColor = (rate) =>
    rate < 60 || rate > 100 ? "text-red-500" : "text-green-600";
  const getSpO2Color = (spo2) =>
    spo2 < 95 ? "text-red-500" : "text-green-600";
  const getHRVColor = (hrv) => (hrv < 40 ? "text-red-500" : "text-green-600");
  const getBPColor = (bp) => {
    const [systolic, diastolic] = bp.split("/").map(Number);
    return systolic > 140 || diastolic > 90 ? "text-red-500" : "text-green-600";
  };

  const exportToPDF = () => {
    const dashboardElement = document.getElementById("dashboard");
    if (!dashboardElement) return;

    html2canvas(dashboardElement, {
      scale: 2, // Improve quality for PDF
      useCORS: true, // Needed if there are images from external domains
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", [300, 200]); // Landscape A4 size
      const marginX = 10;
      const marginY = 10;
      const imgWidth = 280; // Fit within margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
      pdf.save("glucosense_medical_report.pdf");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f5f9] relative overflow-hidden p-4">
      {/* Background shapes - Copied from Login.jsx */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-[#c8e6f5] to-[#a2d9f7] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
      <div className="absolute top-[20%] right-[5%] w-56 h-56 sm:w-72 sm:h-72 lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-[#d4edda] to-[#88d6b8] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[5%] left-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-[300px] lg:h-[300px] bg-gradient-to-br from-[#fbe3e6] to-[#f6a6b2] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

      {/* Main Dashboard Content - wrapped in a div to center and give it a white background */}
      <div
        className="relative z-10 w-full max-w-6xl p-4 mx-auto bg-transparent rounded-lg shadow-xl sm:p-6"
        id="dashboard"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-800">Glucosense Dashboard</h1>
          </div>
          {/* User Info (moved from right panel to top right of dashboard for better prominence) */}
          <div className="flex items-center space-x-3">
            <div className="leading-tight text-right">
              <p className="text-sm font-semibold text-gray-800">
                {liveData.profileName || "User"}
              </p>
              <p className="text-xs text-gray-500">
                Last updated: {liveData.lastUpdated || "N/A"}
              </p>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src={liveData.profileImage} alt={liveData.profileName} />
              <AvatarFallback>
                {liveData.profileName ? liveData.profileName[0] : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Glucose Display */}
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">Glucose Display</h2>
              <div className="relative mb-4">
                <div
                  className={`flex flex-col items-center justify-center w-36 h-36 border-8 rounded-full ${
                    status === "normal"
                      ? "border-green-500"
                      : status === "low"
                      ? "border-red-500"
                      : status === "moderate"
                      ? "border-yellow-500"
                      : "border-orange-500"
                  }`}
                >
                  <animated.span className="text-5xl font-bold">
                    {animatedGlucose.number.to((n) => n.toFixed(0))}
                  </animated.span>
                  <span className="text-base text-gray-500">mg/dL</span>
                </div>
              </div>
              <p className={`text-xl font-bold ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="col-span-1">
            <CardContent className="p-6 space-y-4">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">Action Buttons</h2>
              <Button className="w-full text-white bg-blue-600 hover:bg-blue-700">
                Real-Time Updates
              </Button>
              <Button variant="outline" className="w-full text-blue-600 border-blue-600 hover:bg-blue-50">
                Sync Device
              </Button>
              <Button className="w-full text-white bg-green-600 hover:bg-green-700" onClick={exportToPDF}>
                Export Data (PDF)
              </Button>
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card className="col-span-1">
            <CardContent className="p-6 space-y-4">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">Vitals</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Heart Rate</p>
                    <p className={`text-base font-semibold ${getHeartRateColor(liveData.heartRate)}`}>
                      {liveData.heartRate} bpm
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplet className="w-6 h-6 text-rose-500" />
                  <div>
                    <p className="text-sm text-gray-500">SpO₂</p>
                    <p className={`text-base font-semibold ${getSpO2Color(liveData.spo2)}`}>
                      {liveData.spo2.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">HRV</p>
                    <p className={`text-base font-semibold ${getHRVColor(liveData.hrv)}`}>
                      {liveData.hrv} ms
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">BP</p>
                    <p className={`text-base font-semibold ${getBPColor(liveData.bloodPressure)}`}>
                      {liveData.bloodPressure}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Glucose Trend Graph */}
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">Glucose Trend Graph</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historyData.map(d => ({ ...d, time: d.time.substring(d.time.indexOf(' ') + 1, d.time.lastIndexOf(':')) }))}> {/* Format time for XAxis */}
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis domain={[60, 160]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#4CAF50" // Green shade
                    fill="#4CAF50"
                    fillOpacity={0.1}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4CAF50" // Green shade
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer> {/* <-- CLOSING TAG ADDED HERE */}
            </CardContent>
          </Card>

          {/* AI Chat Assistant */}
          <Card className="col-span-1">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">AI Chat Assistant</h2>
              <div className="flex items-center mb-4 space-x-3">
                <img src="../../public/image.png" alt="Gemini AI" className="w-auto h-8" />
                <div>
                  <p className="font-semibold text-gray-800">Glucosense Health AI</p>
                  <p className="text-sm text-gray-500">Ask me about your health data...</p>
                </div>
              </div>
              <Button
                onClick={() => setChatOpen(true)}
                className="w-full text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Open Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Gemini Chatbot */}
      {/* Retained existing chat implementation as it's functional */}
      <div className="fixed z-50 bottom-6 right-6">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-3 text-white transition-all bg-[#0f4656] rounded-full shadow-lg hover:bg-[#7bc1b7]"
          aria-label="Open Chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {chatOpen && (
        <div className="fixed z-50 bottom-20 right-4 sm:right-6 w-[90vw] sm:w-80 max-w-sm sm:max-w-xs p-4 bg-white border shadow-xl rounded-xl h-[42h] sm:h-auto overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">GlucoSense AI</h3>
            <button
              onClick={() => setChatOpen(false)}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
          </div>
          <GeminiChat />
        </div>
      )}
    </div>
  );
}