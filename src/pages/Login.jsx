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
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userDoc = await getDoc(doc(db, "users", email));

      if (!userDoc.exists()) {
        setError("User not found, please register first.");
        return;
      }

      const userData = userDoc.data();
      if (userData.password === password) {
        await signInWithEmailAndPassword(auth, email, password);

        // Optional: Save custom profile info from Firestore if available
        if (userData.displayName) {
          localStorage.setItem("profileName", userData.displayName);
        }
        if (userData.photoURL) {
          localStorage.setItem("profileImage", userData.photoURL);
        }

        navigate("/dashboard");
      } else {
        setError("Incorrect password, please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred, please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <Card className="w-full max-w-sm shadow-xl">
        <CardContent className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-center text-gray-900">Login</h2>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>

          <Separator className="my-4" />

          <Button className="w-full" variant="outline" onClick={handleGoogleLogin}>
            Sign in with Google
          </Button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
