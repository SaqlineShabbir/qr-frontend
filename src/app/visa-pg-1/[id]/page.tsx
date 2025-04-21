"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Image, ImagePlus, Upload, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import AutocompleteField from "@/components/autoCompleteField";
import { countries } from "country-data";
import Flag from "react-world-flags";
import toast, { Toaster } from "react-hot-toast";
import QrGenerator from "@/components/qrGenerator";
type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  Gender: string;
  photo: string;
};

type Errors = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  Gender?: string;
  photo?: string;
};

const VisaForm1 = () => {
  const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    maritalStatus: "",
    Gender: "",
    photo: "",
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const router = useRouter();

  const countryOptions = countries.all.map((country: any) => ({
    value: country.alpha2,
    label: country.name,
    flag: (
      <Flag
        code={country.alpha2}
        style={{ width: 20, height: 20, marginRight: 8 }}
      />
    ),
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [showQRCode, setShowQRCode] = useState(false);

  const [qrData, setQrData] = useState<{ url: string; token: string } | null>(
    null
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const tabLabels = [
    "Personal Details",
    "Passport Details",
    "Contact Details",
    "Visa Details",
  ];
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
      axios
        .get(`${API_URL}/api/visa/${visaId}`)
        .then((res) => {
          const data = res.data?.personalDetails;
          console.log("Fetched data:", data);
          if (data) {
            const updatedForm: FormData = {
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              dateOfBirth: data.dateOfBirth?.substring(0, 10) || "",
              nationality: data.nationality || "",
              maritalStatus: data.maritalStatus || "",
              Gender: data.gender || "",
              photo: data.photo || "",
            };
            setFormData(updatedForm);

            // If there's an existing photo, set the preview URL
            if (data.photo) {
              const photoPath = data.photo.replace(/\\/g, "/");
              setPreviewUrl(`${API_URL}/${photoPath}`);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch visa details:", err);
        });
    } else {
      // const savedForm = localStorage.getItem("visaFormDataOne");
      // if (savedForm) {
      //   setFormData(JSON.parse(savedForm));
      // }
    }
  }, []);
  // Add this handler for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = async () => {

    try {
      setFormData(initialFormData);
      setErrors({});
    

      const res = await fetch(`${API_URL}/api/visa/visa-form/${visaId}/reset-section`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "personalDetails",
        }),
      });
    } catch (error) {
      console.error("Error resetting section:", error);
    }
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};
    if (!formData.firstName) newErrors.firstName = "First name Mandatory.";
    if (!formData.lastName) newErrors.lastName = "Last name Mandatory.";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth Mandatory.";
    if (!formData.nationality) newErrors.nationality = "Nationality Mandatory.";
    if (!formData.maritalStatus)
      newErrors.maritalStatus = "Marital Status Mandatory.";
    if (!formData.Gender) newErrors.Gender = "Gender Mandatory.";
    return newErrors;
  };

  const handleTabClick = (index: number) => {
    if (index <= activeTab) setActiveTab(index);
  };

  // Modify your handleNext function to handle file upload
  const handleNext = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Append text data
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("maritalStatus", formData.maritalStatus);
      formDataToSend.append("gender", formData.Gender);

      // Append file if selected
      if (selectedFile) {
        formDataToSend.append("photo", selectedFile);
      }

      let response;
      if (visaId) {
        response = await axios.put(
          `${API_URL}/api/visa/${visaId}/photo`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(`${API_URL}/api/visa`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const savedId = response?.data?._id;
      localStorage.setItem("visaId", savedId);
      toast.success("Visa form data submitted successfully!");
      router.push(`/visa-pg-2/${savedId}`);
    } catch (error) {
      console.error("Error saving data to MongoDB:", error);
      toast.error("Error saving data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRCodeDisplay = async () => {
    if (showQRCode) {
      setShowQRCode(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/qr/generate`, {
        visaId,
      });
      setQrData({
        url: response.data.qrUrl,
        token: response.data.token,
      });
      setShowQRCode(true);
      toast.success("QR code generated!");
    } catch (error) {
      console.log("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  console.log("Form Data:", formData.nationality);

  return (
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
              Personal Details:
            </h4>

            {activeTab === 0 && (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Image className="w-5 h-5" /> Photo:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload</span>
                      </label>
                    </div>
                    {previewUrl && (
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    First Name:
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </span>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Last Name:
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </span>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="p-3 rounded-lg border w-full border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {errors.dateOfBirth && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.dateOfBirth}
                    </span>
                  )}
                </div>

                

                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Nationality:
                  </label>
                  <AutocompleteField
                    id="nationality"
                    name="nationality"
                    label="Select Nationality"
                    value={formData.nationality}
                    options={countryOptions}
                    onChange={handleChange}
                    required
                  />
                  {errors.nationality && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.nationality}
                    </span>
                  )}
                </div>

                {/* Marital Status Radio Buttons */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 font-medium mb-2">
                    Marital Status:
                  </label>
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
                  {errors.maritalStatus && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.maritalStatus}
                    </span>
                  )}
                </div>

                {/* Gender */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 font-medium mb-2">
                    Gender:
                  </label>
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
                  {errors.Gender && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.Gender}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:col-span-2 gap-4 mt-4">
                  <div className="flex flex-wrap justify-between gap-4 mb-[300px]">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex-1 min-w-[120px]"
                    >
                      Reset
                    </button>
                    {/* <button
                      type="button"
                      onClick={handleQRCodeDisplay}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 min-w-[120px]"
                    >
                      {showQRCode ? "Hide QR Code" : "Continue On Mobile"}
                    </button> */}
                    <div className="">
                      <QrGenerator visaId={visaId} page="visa-pg-1" />
                    </div>
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

                  {/* {showQRCode && qrData && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                      <h3 className="mb-3 text-lg font-medium text-gray-700">
                        Scan QR Code to Continue on Mobile
                      </h3>
                      <div className="flex justify-center">
                        <QRCodeCanvas value={qrData.url} size={180} />
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        This code will expire after first use
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(qrData.url);
                          toast.success("Link copied to clipboard!");
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Copy link instead
                      </button>
                    </div>
                  )} */}
                </div>
              </form>
            )}

            
            <Toaster position="top-right" reverseOrder={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaForm1;

