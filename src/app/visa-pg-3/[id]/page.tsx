"use client";
import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import QrGenerator from "@/components/qrGenerator";
import { Toaster } from "react-hot-toast";

type FormData = {
  presentAddress: string;
  permanent: string;
  phone: string;
  email: string;
  currentOccupation: string;
  employerName: string;
};

type FormErrors = {
  presentAddress?: string;
  permanent?: string;
  phone?: string;
  email?: string;
  currentOccupation?: string;
  employerName?: string;
};

const VisaForm3 = () => {
  const router = useRouter();
  const { id } = useParams(); 
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

  const initialFormData: FormData = {
    presentAddress: "",
    permanent: "",
    phone: "",
    email: "",
    currentOccupation: "",
    employerName: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showQRCode, setShowQRCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(2); // Set to 2 for Contact Details tab
  const currentSessionURL = `${FRONTEND_URL}/visa-pg-3/${id}`;
  
  const tabLabels = ["Personal Details", "Passport Details", "Contact Details", "Visa Details"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleReset = async () => {
  
      try {
        setFormData(initialFormData);
        setErrors({});
        const res = await fetch(`${API_URL}/api/visa/visa-form/${id}/reset-section`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "contactDetails",
          }),
        });
      } catch (error) {
        console.error("Error resetting section:", error);
      }
    };



  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.presentAddress) newErrors.presentAddress = "Current Address is required.";
    if (!formData.permanent) newErrors.permanent = "Permanent Address is required.";
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
    if (!formData.currentOccupation) newErrors.currentOccupation = "Enter Occupation.";
    if (!formData.employerName) newErrors.employerName = "Enter Employer details.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const personalDetailsJson = {
        contactDetails: {
          presentAddress: formData.presentAddress,
          permanent: formData.permanent,
          phone: formData.phone,
          email: formData.email,
          currentOccupation: formData.currentOccupation,
          employerName: formData.employerName,
        },
      };

      const storedFormId = localStorage.getItem("visaId");
      const response = await axios.put(`${API_URL}/api/visa/${storedFormId}`, personalDetailsJson);
      
      localStorage.setItem("visaId", response?.data?._id);
      router.push(`/visa-pg-4/${response?.data?._id}`);
    } catch (error) {
      console.error("Error saving data to MongoDB:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabClick = (index: number) => {
    if (index <= activeTab) setActiveTab(index);
    if (index === 0) {
      router.push(`/visa-pg-2/${id}`);
    } else if (index === 1) {
      router.push(`/visa-pg-2/${id}`);
    }
  };

  const handleQRCodeDisplay = () => {
    setShowQRCode(!showQRCode);
  };

  
useEffect(() => {
  const visaId = Array.isArray(id) ? id[0] : id;

  if (visaId) {
    axios.get(`${API_URL}/api/visa/${visaId}`)
      .then(res => {
        const data = res.data?.contactDetails;
        if (data) {
          const updatedForm: FormData = {
            presentAddress: data.presentAddress || "",
            permanent: data.permanent || "",
            phone: data.phone || "",
            email: data.email || "",
            currentOccupation: data.currentOccupation || "",
            employerName: data.employerName || "",
          };
          setFormData(updatedForm);
        }
      })
      .catch(err => {
        console.error("Failed to fetch contact details:", err);
      });
  }
}, []);

  return (
    <>
      <Head>
        <title>Visa Application - Contact Details</title>
      </Head>

      <div 
        className="min-h-screen p-4 md:p-8 font-sans text-gray-800"
        style={{
          backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/visa-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors">
            ← Back to Home
          </Link>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`px-4 py-2 rounded-lg transition-colors
                  ${index === activeTab ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'}
                  ${index <= activeTab ? 'hover:bg-green-500 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  text-sm md:text-base`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form Container */}
          <div className="bg-white bg-opacity-90 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-green-700">Visa Application Form</h2>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">{tabLabels[activeTab]}</h3>
              <h4 className="text-lg mb-6 text-gray-600 border-b pb-2">Contact Information:</h4>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Present Address */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Present Address:</label>
                  <input
                    type="text"
                    name="presentAddress"
                    value={formData.presentAddress}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.presentAddress ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter current address"
                  />
                  {errors.presentAddress && (
                    <span className="text-red-500 text-sm mt-1">{errors.presentAddress}</span>
                  )}
                </div>

                {/* Permanent Address */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Permanent Address:</label>
                  <input
                    type="text"
                    name="permanent"
                    value={formData.permanent}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.permanent ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter permanent address"
                  />
                  {errors.permanent && (
                    <span className="text-red-500 text-sm mt-1">{errors.permanent}</span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm mt-1">{errors.email}</span>
                  )}
                </div>

                {/* Phone Number */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Phone Number:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-sm mt-1">{errors.phone}</span>
                  )}
                </div>

                {/* Current Occupation */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Current Occupation:</label>
                  <input
                    type="text"
                    name="currentOccupation"
                    value={formData.currentOccupation}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.currentOccupation ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your occupation"
                  />
                  {errors.currentOccupation && (
                    <span className="text-red-500 text-sm mt-1">{errors.currentOccupation}</span>
                  )}
                </div>

                {/* Employer Name */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Employer Name:</label>
                  <input
                    type="text"
                    name="employerName"
                    value={formData.employerName}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.employerName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter employer name"
                  />
                  {errors.employerName && (
                    <span className="text-red-500 text-sm mt-1">{errors.employerName}</span>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:col-span-2 gap-4 mt-4 ">
                  <div className="flex flex-wrap justify-between gap-4">
                    <Link 
                      href={`/visa-pg-2/${id}`}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex-1 min-w-[120px] text-center"
                    >
                       ← Back
                    </Link>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex-1 min-w-[120px]"
                    >
                      Reset
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleQRCodeDisplay}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 min-w-[120px]"
                    >
                      {showQRCode ? "Hide QR Code" : "Continue On Mobile"}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 rounded-lg transition-colors flex-1 min-w-[120px] ${
                        isSubmitting
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {isSubmitting ? "Processing..." : "Next"}
                    </button>
                  </div>

                  {showQRCode && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                      <h3 className="mb-3 text-lg font-medium text-gray-700">Scan QR Code to Continue on Mobile</h3>
                      <div className="flex justify-center">
                        <QRCodeCanvas value={currentSessionURL} size={180} />
                      </div>
                      <p className="mt-3 text-sm text-gray-600">Scan this QR code with your mobile device to continue the application</p>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </>
  );
};

export default VisaForm3;