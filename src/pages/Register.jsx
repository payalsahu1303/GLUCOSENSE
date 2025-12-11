import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"; // Keep if needed, though login removed it visually
import { auth, db } from "@/services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
  });
  const [error, setError] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        createdAt: new Date(),
        // You might want to add a default photoURL here or let the user upload one later
        photoURL: user.photoURL || null, // Use Firebase Auth photoURL if available (e.g., from Google Sign-Up)
        displayName: user.displayName || formData.name, // Use Firebase Auth displayName if available
      });

      // 3. Store in localStorage and Navigate to dashboard
      localStorage.setItem("profileName", formData.name);
      localStorage.setItem("profileImage", user.photoURL || ""); // Store actual photoURL if present

      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      // More user-friendly error messages
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login or use a different email.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f5f9] relative overflow-hidden p-4">
      {/* Background shapes - Copied from Login.jsx */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-[#c8e6f5] to-[#a2d9f7] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
      <div className="absolute top-[20%] right-[5%] w-56 h-56 sm:w-72 sm:h-72 lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-[#d4edda] to-[#88d6b8] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[5%] left-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-[300px] lg:h-[300px] bg-gradient-to-br from-[#fbe3e6] to-[#f6a6b2] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

      {/* Glucosense Logo in top left corner - Copied from Login.jsx */}
      {/*
        NOTE: If you have a global Navbar, this logo might be redundant here.
        Consider if you want a global Navbar to handle this for all auth pages.
      */}

      <Card className="relative z-10 w-full max-w-sm p-6 bg-white rounded-lg shadow-xl sm:p-8">
        <CardContent className="p-0">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 sm:text-3xl">
            Create Account
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              {/* Labels removed, placeholders used for consistency with Login */}
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email" // Consistent placeholder
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                placeholder="Password" // Consistent placeholder
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Input
                id="age"
                type="number"
                placeholder="Your Age"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              {/* For gender, consider using a custom Select component from Shadcn/ui if you have one,
                  or style the native select better. Using Label for accessibility. */}
              <Label htmlFor="gender" className="sr-only">Gender</Label> {/* Hidden label for consistency */}
              <select
                id="gender"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500" // Added appearance-none
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {error && <p className="mt-1 ml-1 text-sm text-left text-red-500">{error}</p>}

            <Button
              className="w-full py-2 font-semibold text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="flex items-center my-6">
          </div>

          {/* Direct Google Sign-in is not usually part of the Register page, but you can add it if desired */}
          {/* For now, I'll remove direct Google Sign-up to simplify, as the Login page handles it */}
          {/* If you want Google Sign-up here, you'd integrate signInWithGoogle similar to Login.jsx */}
          <p className="mt-6 text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}