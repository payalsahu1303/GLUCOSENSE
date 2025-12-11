import React from "react";

const Footer = () => {
  return (
    <footer className="w-full px-4 py-6 mt-auto text-sm text-center text-gray-500 bg-white border-t">
      <p>
        &copy; {new Date().getFullYear()} GlucoSense. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
