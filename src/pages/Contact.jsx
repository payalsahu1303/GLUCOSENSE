import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react"; // Added CheckCircle for success message
import emailjs from "emailjs-com";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // Success message state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields.");
      setIsSubmitted(false); // Reset success state on error
      return;
    }

    setError(null);

    // Send the email using EmailJS
    const templateParams = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      )
      .then(
        (response) => {
          console.log("Email sent successfully:", response);
          setIsSubmitted(true); // Set success state to true
          setFormData({ name: "", email: "", subject: "", message: "" }); // Clear form
          setTimeout(() => setIsSubmitted(false), 5000); // Hide success message after 5 seconds
        },
        (error) => {
          console.log("Error sending email:", error);
          setError("Something went wrong. Please try again later.");
          setIsSubmitted(false); // Ensure success message is not shown on error
        }
      );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f5f9] relative overflow-hidden p-4">
      {/* Background shapes - Copied from Login.jsx */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-[#c8e6f5] to-[#a2d9f7] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
      <div className="absolute top-[20%] right-[5%] w-56 h-56 sm:w-72 sm:h-72 lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-[#d4edda] to-[#88d6b8] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[5%] left-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-[300px] lg:h-[300px] bg-gradient-to-br from-[#fbe3e6] to-[#f6a6b2] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

      {/* Main Contact Content - wrapped in a div to center and give it a white background */}
      <div className="relative z-10 w-full max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-xl">
        {/* Header */}
        <h1 className="mb-4 text-3xl font-semibold text-center text-gray-800">Contact Us</h1>
        <p className="mb-6 text-lg text-center text-gray-500">
          Have any questions or need assistance? Reach out to us using the form below.
        </p>

        {/* Success Message Card */}
        {isSubmitted && (
          <Card className="mb-4 bg-green-100 border-green-500">
            <CardContent className="flex items-center p-4 space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" /> {/* Changed to CheckCircle for success */}
              <span>Thank you for reaching out! We will get back to you soon.</span>
            </CardContent>
          </Card>
        )}

        {/* Form Card */}
        <Card>
          <CardContent className="p-6 space-y-6"> {/* Added default padding to CardContent */}
            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 space-x-2 text-red-800 bg-red-100 border border-red-500 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4"> {/* Wrapped fields in a form */}
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject of your inquiry (optional)" // Made optional in placeholder
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message here"
                  rows={6}
                  className="mt-2"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}