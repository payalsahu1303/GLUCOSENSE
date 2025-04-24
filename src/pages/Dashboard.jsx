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
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Check,
  HeartPulse,
  Droplet,
  Activity,
  Gauge,
  MessageCircle,
} from "lucide-react";
import { useSpring, animated } from "react-spring";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import GeminiChat from "@/components/GeminiChat"; // adjust the path if necessary


const auth = getAuth();

const data = [
  { time: "00:00", value: 90 },
  { time: "04:00", value: 100 },
  { time: "05:00", value: 95 },
  { time: "08:00", value: 105 },
  { time: "10:00", value: 120 },
  { time: "12:00", value: 110 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [glucoseLevel] = useState(98);
  const [status, setStatus] = useState("normal");

  const [heartRate] = useState(78);
  const [spo2] = useState(96);
  const [hrv] = useState(58);
  const [bloodPressure] = useState("142/91");


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });

    const storedName = localStorage.getItem("profileName");
    const storedImage = localStorage.getItem("profileImage");

    if (storedName) setProfileName(storedName);
    if (storedImage) setProfileImage(storedImage);

    return () => unsubscribe();
  }, [navigate]);

  const animatedGlucose = useSpring({ number: glucoseLevel, from: { number: 0 } });

  useEffect(() => {
    if (glucoseLevel < 70) setStatus("low");
    else if (glucoseLevel <= 100) setStatus("normal");
    else if (glucoseLevel <= 120) setStatus("moderate");
    else setStatus("high");
  }, [glucoseLevel]);

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

  const getHRVColor = (hrv) =>
    hrv < 40 ? "text-red-500" : "text-green-600";

  const getBPColor = (bp) => {
    const [systolic, diastolic] = bp.split("/").map(Number);
    return systolic > 140 || diastolic > 90 ? "text-red-500" : "text-green-600";
  };

  const exportToPDF = () => {
    const dashboardElement = document.getElementById("dashboard");

    html2canvas(dashboardElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", [300, 200]);
      const marginX = 10;
      const marginY = 10;
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
      pdf.save("medical_report.pdf");
    });
  };

  return (
    <div className="min-h-screen p-4 bg-white md:p-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" id="dashboard">
        {/* Glucose Level */}
        <Card className="col-span-1 md:col-span-2">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              <div
                className={`flex flex-col items-center justify-center w-32 h-32 border-8 rounded-full ${
                  status === "normal"
                    ? "border-green-500"
                    : status === "low"
                    ? "border-red-500"
                    : status === "moderate"
                    ? "border-yellow-500"
                    : "border-orange-500"
                }`}
              >
                <animated.span className="text-4xl font-bold">
                  {animatedGlucose.number.to((n) => n.toFixed(0))}
                </animated.span>
                <span className="text-sm text-gray-500">mg/dL</span>
              </div>
            </div>
            <p className="mt-4 text-gray-600">Current Glucose Level</p>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="flex flex-col space-y-4">
          {/* User Info */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profileImage} alt={profileName} />
                  <AvatarFallback>{profileName ? profileName[0] : "U"}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{profileName || "User"}</p>
                  <p className="text-xs text-gray-500">Measured 2 mins ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="flex items-center p-4 space-x-3">
              {status === "normal" ? (
                <CheckCircle className={statusColors[status]} />
              ) : status === "low" ? (
                <AlertCircle className={statusColors[status]} />
              ) : status === "moderate" ? (
                <AlertTriangle className={statusColors[status]} />
              ) : (
                <Check className={statusColors[status]} />
              )}
              <div>
                <p className={`font-semibold ${statusColors[status]}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
                <p className="text-sm text-gray-500">
                  {status === "normal"
                    ? "Stay hydrated and maintain lifestyle."
                    : status === "low"
                    ? "Eat or drink something sugary."
                    : status === "moderate"
                    ? "Monitor carefully, consult if needed."
                    : "Seek professional medical help."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Vitals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p className={`text-sm font-semibold ${getHeartRateColor(heartRate)}`}>
                      {heartRate} bpm
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplet className="w-5 h-5 text-rose-500" />
                  <div>
                    <p className="text-xs text-gray-500">SpO₂</p>
                    <p className={`text-sm font-semibold ${getSpO2Color(spo2)}`}>
                      {spo2}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">HRV</p>
                    <p className={`text-sm font-semibold ${getHRVColor(hrv)}`}>
                      {hrv} ms
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">BP</p>
                    <p className={`text-sm font-semibold ${getBPColor(bloodPressure)}`}>
                      {bloodPressure}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Glucose Trend */}
        <Card className="col-span-1 md:col-span-2">
          <CardContent className="p-4">
            <h2 className="mb-2 font-semibold">Glucose Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[60, 140]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#007BFF"
                  fill="#007BFF"
                  fillOpacity={0.2}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#007BFF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full">
                Real-Time Updates
              </Button>
              <Button variant="outline" className="w-full">
                Sync Device
              </Button>
              <Button className="w-full" onClick={exportToPDF}>
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Gemini Chatbot Button and Modal */}
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
