import Roshan from '../../assets/roshan.png';
import Sadir from '../../assets/Sadir.png';
import Rijan from '../../assets/Rijan.png';
import { FaFacebook, FaInstagramSquare, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

export default function About() {
  return (
    <div className='py-12'>
      <h1 className='text-center text-4xl text-orange-500 font-semibold mb-12'>Our Team Member</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 '>
        
        {/* Roshan's Card */}
        <div className='bg-gray-900 hover:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out'>
          <div className='flex justify-center'>
            <img src={Roshan} alt="Roshan Thapa Magar" className='h-[30vh] w-[30vh] rounded-full border-4 border-gray-700 object-cover' />
          </div>
          <div className='text-center mt-6'>
            <h1 className='text-2xl text-white font-bold'>Roshan Thapa Magar</h1>
            <h2 className='text-orange-400 font-medium'>Project Manager</h2>
            <p className='text-gray-400 mt-4'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita vero adipisci sapiente!
            </p>
            <ul className='flex justify-center space-x-4 mt-6'>
              <li><FaFacebook className="text-blue-600 hover:text-blue-800 transition duration-200 cursor-pointer" /></li>
              <li><FaInstagramSquare className="text-pink-500 hover:text-pink-700 transition duration-200 cursor-pointer" /></li>
              <li><FaTwitter className="text-blue-400 hover:text-blue-600 transition duration-200 cursor-pointer" /></li>
              <li><FaGithub className="text-gray-400 hover:text-white transition duration-200 cursor-pointer" /></li>
              <li><FaLinkedin className="text-blue-700 hover:text-blue-900 transition duration-200 cursor-pointer" /></li>
            </ul>
          </div>
        </div>

        {/* Sadir's Card */}
        <div className='bg-gray-900 hover:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out'>
          <div className='flex justify-center'>
            <img src={Sadir} alt="Sadir Singh" className='h-[30vh] w-[30vh] rounded-full border-4 border-gray-700 object-cover' />
          </div>
          <div className='text-center mt-6'>
            <h1 className='text-2xl text-white font-bold'>Sadir Thapa Magar</h1>
            <h2 className='text-orange-400 font-medium'>UI/UX Designer</h2>
            <p className='text-gray-400 mt-4'>
              Designing with passion, creating user-friendly experiences with a modern aesthetic.
            </p>
            <ul className='flex justify-center space-x-4 mt-6'>
              <li><FaFacebook className="text-blue-600 hover:text-blue-800 transition duration-200 cursor-pointer" /></li>
              <li><FaInstagramSquare className="text-pink-500 hover:text-pink-700 transition duration-200 cursor-pointer" /></li>
              <li><FaTwitter className="text-blue-400 hover:text-blue-600 transition duration-200 cursor-pointer" /></li>
              <li><FaGithub className="text-gray-400 hover:text-white transition duration-200 cursor-pointer" /></li>
              <li><FaLinkedin className="text-blue-700 hover:text-blue-900 transition duration-200 cursor-pointer" /></li>
            </ul>
          </div>
        </div>

        {/* Rijan's Card */}
        <div className='bg-gray-900 hover:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out'>
          <div className='flex justify-center'>
            <img src={Rijan} alt="Rijan Karki" className='h-[30vh] w-[30vh] rounded-full border-4 border-gray-700 object-cover' />
          </div>
          <div className='text-center mt-6'>
            <h1 className='text-2xl text-white font-bold'>Rijan Thapa Magar</h1>
            <h2 className='text-orange-400 font-medium'>Backend Developer</h2>
            <p className='text-gray-400 mt-4'>
              Backend architecture and databases are my playground, turning ideas into scalable solutions.
            </p>
            <ul className='flex justify-center space-x-4 mt-6'>
              <li><FaFacebook className="text-blue-600 hover:text-blue-800 transition duration-200 cursor-pointer" /></li>
              <li><FaInstagramSquare className="text-pink-500 hover:text-pink-700 transition duration-200 cursor-pointer" /></li>
              <li><FaTwitter className="text-blue-400 hover:text-blue-600 transition duration-200 cursor-pointer" /></li>
              <li><FaGithub className="text-gray-400 hover:text-white transition duration-200 cursor-pointer" /></li>
              <li><FaLinkedin className="text-blue-700 hover:text-blue-900 transition duration-200 cursor-pointer" /></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
