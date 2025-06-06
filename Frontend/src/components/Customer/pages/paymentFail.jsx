import { useNavigate } from 'react-router-dom';

export default function PaymentFail() {
  const navigate = useNavigate();
  
  return (
    <main className="flex flex-col md:flex-col xl:flex-row w-full h-full px-4 py-20 sm:px-6 md:px-8 lg:px-10">
      <div className="flex flex-col justify-center items-center px-4 py-20 md:px-8 lg:px-2 text-white w-full">
        {/* Cross inside round red circle */}
        <div className="bg-red-600 rounded-full p-6 mb-6">
          <svg 
            className="w-12 h-12 text-white" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4">
          Payment Failed
        </h1>
        <p className="text-base sm:text-lg md:text-xl mt-8 mb-10 text-center max-w-[900px]">
          Unfortunately, your payment could not be processed. Please try again or contact support.
        </p>
        <button 
          onClick={() => navigate('/menu/bill')}
          className="w-40 font-semibold px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded md:text-sm text-xs mb-10"
        >
          Go Menu
        </button>
      </div>
    </main>
  );
}
