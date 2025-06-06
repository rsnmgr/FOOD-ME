import { useState } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { LuUtensilsCrossed } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import '../App.css'

// Landing pages components
import Home from '../components/Landing/Home';
import About from '../components/Landing/About';
import Feature from '../components/Landing/Feature';
import Services from '../components/Landing/Services';
import Contact from '../components/Landing/Contact';

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  const openMenu = () => setMenu(!menu);

  const handleScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    if (menu) {
      setMenu(false);
    }
  };

  const handleLoginClick = () => navigate("/login");
  const handleRegisterClick = () => navigate('/register');

  return (
    <div className='min-h-screen md:px-16 bg-gray-950'>
      {/* Header */}
      <header className='fixed top-0 left-0 right-0 bg-gray-900 z-50 p-4 shadow-md flex justify-between items-center'>
        <h1 className='text-lg md:text-xl font-extrabold'>
          FOOD <span className='text-orange-600'>ME</span>
        </h1>

        {/* Mobile Nav */}
        <div className='md:hidden'>
          <GiHamburgerMenu size={24} onClick={openMenu} className='cursor-pointer' />
          <nav
            className={`fixed top-0 right-0 h-screen w-[60%] sm:w-1/2 bg-gray-800 text-white 
                        transform ${menu ? 'translate-x-0' : 'translate-x-full'} 
                        transition-transform duration-300 ease-in-out z-50`}
          >
            <div className='flex justify-between items-center p-4'>
              <h1 className='underline cursor-pointer' onClick={handleRegisterClick}>Register</h1>
              <LuUtensilsCrossed size={22} onClick={openMenu} className='cursor-pointer' />
            </div>
            <ul className='text-center mt-6'>
              <li className='p-3 hover:bg-gray-700' onClick={() => handleScrollTo('home')}>Home</li>
              <li className='p-3 hover:bg-gray-700' onClick={() => handleScrollTo('about')}>About</li>
              <li className='p-3 hover:bg-gray-700' onClick={() => handleScrollTo('feature')}>Feature</li>
              <li className='p-3 hover:bg-gray-700' onClick={() => handleScrollTo('services')}>Services</li>
              <li className='p-3 hover:bg-gray-700' onClick={() => handleScrollTo('contact')}>Contact</li>
              <li className='p-3 border-t' onClick={handleLoginClick}>Login</li>
              <li className='p-3 border-b' onClick={handleRegisterClick}>Sign up</li>
            </ul>
          </nav>
        </div>

        {/* Desktop Nav */}
        <ul className='hidden md:flex items-center space-x-6 text-sm font-medium'>
          <li className='cursor-pointer' onClick={() => handleScrollTo('home')}>Home</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('about')}>About</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('feature')}>Feature</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('services')}>Services</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('contact')}>Contact</li>
          <li className='cursor-pointer' onClick={handleLoginClick}>Sign in</li>
          <li className='p-1 px-4 border border-orange-500 text-orange-600 rounded-md cursor-pointer hover:bg-orange-50' onClick={handleRegisterClick}>Sign up</li>
        </ul>
      </header>

      {/* Content */}
      <main className='pt-24 p-3'>
        <section id='home'><Home /></section>
        <section id='about'><About /></section>
        <section id='feature'><Feature /></section>
        <section id='services'><Services /></section>
        <section id='contact'><Contact /></section>
      </main>
    </div>
  );
}
