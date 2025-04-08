"use client";

import { useState } from "react";
import Link from "next/link";

const Home = () => {
  const [language, setLanguage] = useState("English");

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
    alert(`Language changed to: ${event.target.value}`);
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/visa-bg.jpg')",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Language Dropdown - More elegant */}
      <div className="absolute right-5 top-5 z-10">
        <div className="flex items-center space-x-2">
          {/* <GlobeIcon className="h-5 w-5 text-white" /> */}
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="rounded-lg border border-white bg-transparent px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option className="text-black" value="English">
              English
            </option>
            <option className="text-black" value="Spanish">
              Español
            </option>
            <option className="text-black" value="French">
              Français
            </option>
            <option className="text-black" value="German">
              Deutsch
            </option>
            <option className="text-black" value="Arabic">
              العربية
            </option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 text-center">
        {/* Header with animation */}
        <header className="mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Welcome to <span className="text-yellow-400">Visa Services</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
            Your trusted partner for seamless visa application processing
          </p>
        </header>

        {/* Visa Apply Section with card effect */}
        <div className="mt-8 max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 transition-all hover:scale-105">
          <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
          <p className="mb-6 text-gray-200">
            Start your visa application process with our simple online form
          </p>
          <Link
            href="/visa-pg-1"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
          >
            Begin Visa Application
          </Link>
        </div>
      </main>

      {/* Bottom Note - More readable */}
      <div className="absolute bottom-8 w-full px-4">
        <div className="max-w-4xl mx-auto bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <p className="text-sm text-yellow-100">
            <span className="font-semibold">Important:</span> Please schedule
            appointments at least
            <span className="font-bold text-yellow-300">
              {" "}
              15 calendar days{" "}
            </span>
            before your intended travel date to allow for processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
