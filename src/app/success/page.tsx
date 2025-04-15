import Link from 'next/link'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div   style={{
      backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/visa-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }} className=" h-screen text-center flex flex-col items-center justify-center">
    <div className=" p-4 md:p-0 rounded-lg  max-w-2xl">
   <div className='flex justify-start items-center mb-4'>
   <Link
            href="/"
            className="inline-block mb-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
   </div>
      <div className='bg-white mx-auto md:p-8 p-4 rounded-lg shadow-lg'>
      <div className="text-green-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-green-700">
        Visa Application Submitted Successfully!
      </h2>
      <p className="text-gray-600 mb-6">
        Thank you for submitting your visa application. Your application is now being processed.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>You'll receive a confirmation email shortly</li>
          <li>Our team will review your application within 3-5 business days</li>
          <li>We may contact you if additional information is required</li>
          <li>You'll receive notification once a decision is made</li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        
        {/* <a 
          href="/application-status" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Check Application Status
        </a> */}
      </div>
      </div>
    </div>
  </div>
  )
}
export default page