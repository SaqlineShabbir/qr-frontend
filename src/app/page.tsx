'use client';

import { useState } from 'react';
import Link from 'next/link';

const Home = () => {
  const [language, setLanguage] = useState('English');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
    alert(`Language changed to: ${event.target.value}`);
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/visa-bg.jpg')" }}
    >
      {/* Language Dropdown */}
      <div className="absolute right-5 top-5">
        <label htmlFor="language-select" className="text-black mr-2">
          Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className="rounded border border-gray-300 px-2 py-1 text-black"
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Arabic">Arabic</option>
        </select>
      </div>

      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold">Welcome to Home Page</h1>
      </header>

      {/* Visa Apply Section */}
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold">Apply for Visa</h2>
        <Link href="/visa-pg-1" className="text-yellow-300 underline">
          Click here to fill out the Visa Form
        </Link>
      </div>

      {/* Bottom Note */}
      <div className="absolute bottom-12 w-full text-center text-xs text-black px-4">
        <h2>
          Please Note: Customers are advised to schedule their appointments well in advance with a
          minimum of 15 calendar days of the processing time frame from the date of travel.
        </h2>
      </div>
    </div>
  );
};

export default Home;
