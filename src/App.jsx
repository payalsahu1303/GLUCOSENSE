import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Navbar from "@/components/Navbar"; // Optional: Top nav
import Footer from "@/components/Footer"; // Optional: Footer
import Contact from "./pages/Contact";

const App = () => {
  return (
    <Router>
      {/* Optional shared layout */}
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Only if you want a persistent nav */}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <Footer /> {/* Optional footer */}
      </div>
    </Router>
  );
};

export default App;
