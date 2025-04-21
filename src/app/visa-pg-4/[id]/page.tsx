"use client";
import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import QrGenerator from "@/components/qrGenerator";

type FormData = {
  visaType: string;
  purposeofJourney: string;
  noofEntry: string;
  expentryDate: string;
  noofTravelDoc: string;
};

type FormErrors = {
  visaType?: string;
  purposeofJourney?: string;
  noofEntry?: string;
  expentryDate?: string;
  noofTravelDoc?: string;
};

const VisaForm4 = () => {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

  const initialFormData: FormData = {
    visaType: "",
    purposeofJourney: "",
    noofEntry: "",
    expentryDate: "",
    noofTravelDoc: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showQRCode, setShowQRCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(3); // Set to 3 for Visa Details tab
  const currentSessionURL = `${FRONTEND_URL}/visa-pg-4/${id}`;
  const [isSuccess, setIsSuccess] = useState(false);
  //ggg
  const tabLabels = [
    "Personal Details",
    "Passport Details",
    "Contact Details",
    "Visa Details",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
          section: "visaDetails",
        }),
      });
    } catch (error) {
      console.error("Error resetting section:", error);
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.visaType) newErrors.visaType = "Enter visa type.";
    if (!formData.purposeofJourney)
      newErrors.purposeofJourney = "Purpose of Entry required.";
    if (!formData.noofEntry) newErrors.noofEntry = "Mandatory.";
    if (!formData.expentryDate) newErrors.expentryDate = "Entry date required.";
    if (!formData.noofTravelDoc)
      newErrors.noofTravelDoc = "Travel document entered.";
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
      const visaDetailsJson = {
        visaDetails: {
          visaType: formData.visaType,
          purposeofJourney: formData.purposeofJourney,
          noofEntry: formData.noofEntry,
          expentryDate: formData.expentryDate,
          noofTravelDoc: formData.noofTravelDoc,
        },
      };

      const storedFormId = localStorage.getItem("visaId");
      const response = await axios.put(
        `${API_URL}/api/visa/${storedFormId}`,
        visaDetailsJson
      );

      localStorage.setItem("visaId", response?.data?._id);
      alert("Visa form data submitted successfully!");
     
      
      setIsSuccess(true);
      router.push(`/success`);
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
    } else if (index === 2) {
      router.push(`/visa-pg-3/${id}`);
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
          const data = res.data?.visaDetails;
          if (data) {
            const updatedForm: FormData = {
              visaType: data.visaType || "",
              purposeofJourney: data.purposeofJourney || "",
              noofEntry: data.noofEntry || "",
              expentryDate: data.expentryDate?.substring(0, 10) || "",
              noofTravelDoc: data.noofTravelDoc?.toString() || "",
            };
            setFormData(updatedForm);
          }
        })
        .catch(err => {
          console.error("Failed to fetch visa details:", err);
        });
    }
  }, []);
  
  return (
    <>
      <Head>
        <title>Visa Application - Visa Details</title>
      </Head>

      <div
        className="min-h-screen p-4 md:p-8 font-sans  text-gray-800"
        style={{
          backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/visa-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-block mb-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`px-4 py-2 rounded-lg transition-colors
                  ${
                    index === activeTab
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700"
                  }
                  ${
                    index <= activeTab
                      ? "hover:bg-green-500 cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }
                  text-sm md:text-base`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form Container */}
          <div className="bg-white bg-opacity-90 rounded-xl shadow-lg overflow-hidden">
           
            
           
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-green-700">
                  Visa Application Form
                </h2>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  {tabLabels[activeTab]}
                </h3>
                <h4 className="text-lg mb-6 text-gray-600 border-b pb-2">
                  Visa Information:
                </h4>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Visa Type */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Visa Type:
                    </label>
                    <select
                      name="visaType"
                      value={formData.visaType}
                      onChange={handleChange}
                      className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.visaType ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">-- Select Visa Type --</option>
                      <option value="Tourist Visa">Tourist Visa</option>
                      <option value="Business Visa">Business Visa</option>
                    </select>
                    {errors.visaType && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.visaType}
                      </span>
                    )}
                  </div>

                  {/* Purpose of Journey */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Purpose of Journey:
                    </label>
                    <input
                      type="text"
                      name="purposeofJourney"
                      value={formData.purposeofJourney}
                      onChange={handleChange}
                      className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.purposeofJourney
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter purpose of journey"
                    />
                    {errors.purposeofJourney && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.purposeofJourney}
                      </span>
                    )}
                  </div>

                  {/* Number of Entry */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Number of Entry:
                    </label>
                    <select
                      name="noofEntry"
                      value={formData.noofEntry}
                      onChange={handleChange}
                      className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.noofEntry ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">-- Select Entry type --</option>
                      <option value="Single Entry">Single Entry</option>
                      <option value="Multi Entry">Multi Entry</option>
                    </select>
                    {errors.noofEntry && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.noofEntry}
                      </span>
                    )}
                  </div>

                  {/* Expected Entry Date */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Expected Entry Date:
                    </label>
                    <input
                      type="date"
                      name="expentryDate"
                      value={formData.expentryDate}
                      onChange={handleChange}
                      className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.expentryDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.expentryDate && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.expentryDate}
                      </span>
                    )}
                  </div>

                  {/* Number of Travel Document */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Number of Travel Document:
                    </label>
                    <select
                      name="noofTravelDoc"
                      value={formData.noofTravelDoc}
                      onChange={handleChange}
                      className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.noofTravelDoc
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">
                        -- Number of documents presented --
                      </option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    {errors.noofTravelDoc && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.noofTravelDoc}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col md:col-span-2 gap-4 mt-4 ">
                    <div className="flex flex-wrap justify-between gap-4">
                      <Link
                        href={`/visa-pg-3/${id}`}
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
                        {isSubmitting ? "Processing..." : "Save & Submit"}
                      </button>
                    </div>

                    {showQRCode && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                        <h3 className="mb-3 text-lg font-medium text-gray-700">
                          Scan QR Code to Continue on Mobile
                        </h3>
                        <div className="flex justify-center">
                          <QRCodeCanvas value={currentSessionURL} size={180} />
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                          Scan this QR code with your mobile device to continue
                          the application
                        </p>
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

export default VisaForm4;
