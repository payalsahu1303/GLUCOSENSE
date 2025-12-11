import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "@/services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { signInWithGoogle } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Store user info in localStorage
        localStorage.setItem("profileImage", user.photoURL);
        localStorage.setItem("profileName", user.displayName);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google Sign-In failed:", error.message);
      setError("Google Sign-In failed. Please try again.");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("User data not found, please register first.");
        return;
      }

      const userData = userDoc.data();
      if (userData.displayName) {
        localStorage.setItem("profileName", userData.displayName);
      }
      if (userData.photoURL) {
        localStorage.setItem("profileImage", userData.photoURL);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      if (error.code === "auth/invalid-email" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else {
        setError("An error occurred, please try again.");
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f5f9] relative overflow-hidden p-4"> {/* Added p-4 for small screens */}
      {/* Background shapes - Adjusted for responsiveness */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-[#c8e6f5] to-[#a2d9f7] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
      <div className="absolute top-[20%] right-[5%] w-56 h-56 sm:w-72 sm:h-72 lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-[#d4edda] to-[#88d6b8] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[5%] left-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-[300px] lg:h-[300px] bg-gradient-to-br from-[#fbe3e6] to-[#f6a6b2] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>


      {/* Glucosense Logo in top left corner - Adjusted for responsiveness */}

      <Card className="relative z-10 w-full max-w-sm p-6 bg-white rounded-lg shadow-xl sm:p-8"> {/* Adjusted padding */}
        <CardContent className="p-0">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 sm:text-3xl">Login</h2> {/* Adjusted text size */}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="mt-1 ml-1 text-sm text-left text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full py-2 font-semibold text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Sign In
            </Button>
          </form>

          <div className="flex items-center my-6">
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full py-2 text-gray-700 transition duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>

          <p className="mt-6 text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}