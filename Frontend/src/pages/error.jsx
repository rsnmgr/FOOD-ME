import  { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const navigationEntries = window.performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0 && navigationEntries[0].type === "reload") {
      navigate('/');
    }
  }, [navigate]);

  return null;
}

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col md:flex-col xl:flex-row w-full h-full px-4 py-20 sm:px-6 md:px-8 lg:px-10 bg-black">
      <RedirectHandler /> {/* Ensures redirection on page refresh */}
      <div className="flex flex-col justify-center items-center px-4 py-20 md:px-8 lg:px-2 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 text-white">
          404 - Not Found!
        </h1>
        <p className="text-base sm:text-lg md:text-xl mt-8 mb-10 text-center text-white w-full max-w-[900px]">
          Sorry! The page you are looking for was either not found or does not exist. Try refreshing the page or click the button below to go back to the home page.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="w-40 text-white font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded md:text-sm text-xs mb-10"
        >
          Go to Home
        </button>
      </div>
    </main>
  );
}
