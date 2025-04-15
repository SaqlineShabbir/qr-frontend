"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";

type FormData = {
  passportNumber: string;
  placeofIssue: string;
  dateOfIssue: string;
  dateOfExpiry: string;
};

type FormErrors = {
  passportNumber?: string;
  placeofIssue?: string;
  dateOfIssue?: string;
  dateOfExpiry?: string;
};

const VisaForm2 = () => {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

  const initialFormData: FormData = {
    passportNumber: "",
    placeofIssue: "",
    dateOfIssue: "",
    dateOfExpiry: "",
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [showQRCode, setShowQRCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(1); // Set to 1 for Passport Details tab
  const currentSessionURL = `${FRONTEND_URL}/visa-pg-2/${id}`;
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const tabLabels = [
    "Personal Details",
    "Passport Details",
    "Contact Details",
    "Visa Details",
  ];

  useEffect(() => {
    const visaId = Array.isArray(id) ? id[0] : id;

    if (visaId) {
      axios
        .get(`${API_URL}/api/visa/${visaId}`)
        .then((res) => {
          const data = res.data?.passportDetails;
          if (data) {
            const updatedForm: FormData = {
              passportNumber: data.passportNumber || "",
              placeofIssue: data.placeofIssue || "",
              dateOfIssue: data.dateOfIssue?.substring(0, 10) || "",
              dateOfExpiry: data.dateOfExpiry?.substring(0, 10) || "",
            };
            setFormData(updatedForm);

            // Handle existing passport scan preview
            if (data.passportCopy) {
              const filePath = data.passportCopy.replace(/\\/g, "/");
              if (filePath.endsWith(".pdf")) {
                // Show PDF icon for existing PDFs
                setPassportPreview("pdf");
              } else {
                // Show image preview for existing images
                setPassportPreview(`${API_URL}/${filePath}`);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch visa details:", err);
        });
    }
  }, [id, API_URL]);

  useEffect(() => {
    localStorage.setItem("visaFormData", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    localStorage.removeItem("visaFormData");
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.passportNumber.trim())
      newErrors.passportNumber = "Passport number is required";
    if (!formData.placeofIssue.trim())
      newErrors.placeofIssue = "Place of issue is required";
    if (!formData.dateOfIssue)
      newErrors.dateOfIssue = "Date of issue is required";
    if (!formData.dateOfExpiry)
      newErrors.dateOfExpiry = "Date of expiry is required";

    return newErrors;
  };

  const handleTabClick = (index: number) => {
    if (index <= activeTab) setActiveTab(index);
    if (index === 0) {
      router.push(`/visa-pg-1/${id}`);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          passportFile: "Please upload a JPEG, PNG, or PDF file",
        }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          passportFile: "File size must be less than 5MB",
        }));
        return;
      }

      setPassportFile(file);
      setErrors((prev) => ({ ...prev, passportFile: "" }));

      // Create preview for images (not for PDFs)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPassportPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPassportPreview(null); // No preview for PDFs
      }
    }
  };
  console.log("passportFile", passportFile);
  const handleNext = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append file if exists
      if (passportFile) {
        formDataToSend.append("passportCopy", passportFile);
      }

      const savedFormId = localStorage.getItem("visaId");
      if (!savedFormId?.trim()) {
        throw new Error("Invalid visa ID");
      }

      const response = await axios.put(
        `${API_URL}/api/visa/${savedFormId}/passport`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      if (response.data?._id) {
        localStorage.setItem("visaId", response.data._id);
        router.push(`/visa-pg-3/${response.data._id}`);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error saving data. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRCodeDisplay = () => {
    setShowQRCode(!showQRCode);
  };
  //hhh

  return (
    <>
      <Head>
        <title>Visa Application - Passport Details</title>
      </Head>

      <div
        className="min-h-screen p-4 md:p-8 font-sans text-gray-800"
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
                Passport Information:
              </h4>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passport Number */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Passport Number:
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.passportNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter passport number"
                  />
                  {errors.passportNumber && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.passportNumber}
                    </span>
                  )}
                </div>

                {/* Place of Issue */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Place of Issue:
                  </label>
                  <input
                    type="text"
                    name="placeofIssue"
                    value={formData.placeofIssue}
                    onChange={handleChange}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.placeofIssue ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter place of issue"
                  />
                  {errors.placeofIssue && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.placeofIssue}
                    </span>
                  )}
                </div>

                {/* Date of Issue */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Date of Issue:
                  </label>
                  <input
                    type="date"
                    name="dateOfIssue"
                    value={formData.dateOfIssue}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]} 
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.dateOfIssue ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dateOfIssue && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.dateOfIssue}
                    </span>
                  )}
                </div>

                {/* Date of Expiry */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Date of Expiry:
                  </label>
                  <input
                    type="date"
                    name="dateOfExpiry"
                    value={formData.dateOfExpiry}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.dateOfExpiry ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dateOfExpiry && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.dateOfExpiry}
                    </span>
                  )}
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 font-medium mb-1">
                    Upload Passport Scan:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        name="passportCopy"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        
                        className={`p-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300`}
                      />
                    </div>
                    {passportPreview && (
                      <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={passportPreview}
                          alt="Passport preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    {passportFile &&
                      passportFile.type === "application/pdf" && (
                        <div className="w-32 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                          <div className="text-center p-2">
                            <svg
                              className="w-10 h-10 mx-auto text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-xs mt-1 text-gray-600">
                              PDF File
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {passportFile.name}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                  {/* {errors.passportFile && (
    <span className="text-red-500 text-sm mt-1">{errors.passportFile}</span>
  )} */}
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:col-span-2 gap-4 mt-4">
                  <div className="flex flex-wrap justify-between gap-4">
                    <Link
                      href={`/visa-pg-1/${id}`}
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
      </div>
    </>
  );
};

export default VisaForm2;
