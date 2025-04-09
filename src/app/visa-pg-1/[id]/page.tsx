"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  Gender: string;
};

type Errors = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  Gender?: string;
};

const VisaForm1 = () => {
  const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    maritalStatus: "",
    Gender: "",
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const router = useRouter();

  console.log("API_URL:", API_URL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [showQRCode, setShowQRCode] = useState(false);
  
  const tabLabels = ["Personal Details", "Passport Details", "Contact Details", "Visa Details"];
  const currentSessionURL = `${FRONTEND_URL}/visa-pg-1`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    localStorage.setItem("visaFormDataOne", JSON.stringify(updatedForm));
    // setFormData({ ...formData, [name]: value });
  };

  const params = useParams();
  const visaId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
   
  
    if (visaId) {
      axios.get(`${API_URL}/api/visa/${visaId}`)
        .then(res => {
          const data = res.data?.personalDetails;
          if (data) {
            const updatedForm: FormData = {
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              dateOfBirth: data.dateOfBirth?.substring(0, 10) || "",
              nationality: data.nationality || "",
              maritalStatus: data.maritalStatus || "",
              Gender: data.gender || "",
            };
            setFormData(updatedForm);
          }
        })
        .catch(err => {
          console.error("Failed to fetch visa details:", err);
        });
    } else {
      // const savedForm = localStorage.getItem("visaFormDataOne");
      // if (savedForm) {
      //   setFormData(JSON.parse(savedForm));
      // }
    }
  }, []);

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    localStorage.removeItem("visaFormData");
    localStorage.removeItem("visaFormDataOne");
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};
    if (!formData.firstName) newErrors.firstName = "First name Mandatory.";
    if (!formData.lastName) newErrors.lastName = "Last name Mandatory.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth Mandatory.";
    if (!formData.nationality) newErrors.nationality = "Nationality Mandatory.";
    if (!formData.maritalStatus) newErrors.maritalStatus = "Marital Status Mandatory.";
    if (!formData.Gender) newErrors.Gender = "Gender Mandatory.";
    return newErrors;
  };

  const handleTabClick = (index: number) => {
    if (index <= activeTab) setActiveTab(index);
  };


  const handleNext = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
  
    setIsSubmitting(true);
    try {
      const personalDetailsJson = {
        personalDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          maritalStatus: formData.maritalStatus,
          gender: formData.Gender,
        },
      };
  
      let response;
      if (visaId) {
        response = await axios.put(`${API_URL}/api/visa/${visaId}`, personalDetailsJson);
      } else {
        response = await axios.post(`${API_URL}/api/visa`, personalDetailsJson);
      }
  
      const savedId = response?.data?._id;
      localStorage.setItem("visaId", savedId);
      alert("Visa form data submitted successfully!");
      router.push(`/visa-pg-2/${savedId}`);
    } catch (error) {
      console.error("Error saving data to MongoDB:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleQRCodeDisplay = () => {
    setShowQRCode(!showQRCode);
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 font-sans text-gray-800"
      style={{
        backgroundImage: "url('/visa-bg.jpg')",
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
            <h4 className="text-lg mb-6 text-gray-600 border-b pb-2">Personal Details:</h4>

            {activeTab === 0 && (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">First Name:</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <span className="text-red-500 text-sm mt-1">{errors.firstName}</span>}
                </div>

                {/* Last Name */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Last Name:</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <span className="text-red-500 text-sm mt-1">{errors.lastName}</span>}
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Date of Birth:</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="p-3 rounded-lg border w-full border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {errors.dateOfBirth && <span className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</span>}
                </div>

                {/* Nationality */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Nationality:</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your nationality"
                  />
                  {errors.nationality && <span className="text-red-500 text-sm mt-1">{errors.nationality}</span>}
                </div>

                {/* Marital Status Radio Buttons */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 font-medium mb-2">Marital Status:</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value="Single"
                        checked={formData.maritalStatus === "Single"}
                        onChange={handleChange}
                        className="h-5 w-5 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Single</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value="Married"
                        checked={formData.maritalStatus === "Married"}
                        onChange={handleChange}
                        className="h-5 w-5 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Married</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value="Divorced"
                        checked={formData.maritalStatus === "Divorced"}
                        onChange={handleChange}
                        className="h-5 w-5 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Divorced</span>
                    </label>
                  </div>
                  {errors.maritalStatus && <span className="text-red-500 text-sm mt-1">{errors.maritalStatus}</span>}
                </div>

                {/* Gender */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 font-medium mb-2">Gender:</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="Gender"
                        value="male"
                        checked={formData.Gender === "male"}
                        onChange={handleChange}
                        className="h-5 w-5 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="Gender"
                        value="female"
                        checked={formData.Gender === "female"}
                        onChange={handleChange}
                        className="h-5 w-5 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Female</span>
                    </label>
                  </div>
                  {errors.Gender && <span className="text-red-500 text-sm mt-1">{errors.Gender}</span>}
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:col-span-2 gap-4 mt-4">
                  <div className="flex flex-wrap justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex-1 min-w-[120px]"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className={`px-6 py-3 rounded-lg transition-colors flex-1 min-w-[120px] ${
                        isSubmitting
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {isSubmitting ? "Processing..." : "Next"}
                    </button>
                    <button
                      type="button"
                      onClick={handleQRCodeDisplay}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 min-w-[120px]"
                    >
                     {showQRCode ? "Hide QR Code" : "Continue On Mobile"}
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
            )}
            
            {/* {activeTab === 1 && (
              <div className="py-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700">Passport Details - Under Construction</h3>
                <p className="mt-2 text-gray-600">This section is currently being developed</p>
              </div>
            )} */}
            
            {/* {activeTab === 2 && (
              <div className="py-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700">Review Section - Under Construction</h3>
                <p className="mt-2 text-gray-600">This section is currently being developed</p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaForm1;