import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
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
          setFormData({ name: "", email: "", subject: "", message: "" });
        },
        (error) => {
          console.log("Error sending email:", error);
          setError("Something went wrong. Please try again later.");
        }
      );
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-center text-gray-800">Contact Us</h1>
        <p className="text-lg text-center text-gray-500">
          Have any questions or need assistance? Reach out to us using the form below.
        </p>

        {/* Success Message Card */}
        {isSubmitted && (
          <Card className="text-green-700 bg-green-100 border-green-500">
            <CardContent className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Thank you for reaching out! We will get back to you soon.</span>
            </CardContent>
          </Card>
        )}

        {/* Form Card */}
        <Card>
          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 space-x-2 text-red-800 bg-red-100 border border-red-500 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
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
                  placeholder="Subject of your inquiry"
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
            </div>

            {/* Submit Button */}
            <Button onClick={handleSubmit} className="w-full mt-6">
              Send Message
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
