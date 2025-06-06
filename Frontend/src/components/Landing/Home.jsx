import { FaLongArrowAltRight } from "react-icons/fa";
import Food from '../../assets/Food.png';

export default function Home() {
  return (
    <div className=' grid md:grid-cols-2 grid-cols-1 gap-6 '>
      {/* Right Section - Image first on small screens */}
      <div className='flex justify-center md:justify-end items-center order-1 md:order-2 mb-6 md:mb-0'>
        <img src={Food} alt="Delicious food displayed beautifully" className='object-cover' />
      </div>
      
      {/* Left Section - Centered Vertically */}
      <div className='flex flex-col justify-center space-y-6 text-center md:text-start order-2 md:order-1'>
        <h1 className='text-4xl md:text-6xl font-bold leading-tight'>
          Enjoy <span className='text-orange-600 underline block md:inline'>Delicious Food</span> 
          <span className='block md:inline'> in Your Healthy Life</span>
        </h1>
        <p className='text-gray-600'>
          Discover the joy of eating healthy, delicious meals that are perfect for your lifestyle. 
          We offer a wide variety of dishes that are not only tasty but also good for you.
        </p>
        <div className='flex items-center justify-center md:justify-start space-x-4'>
          <div className='p-2 bg-orange-600 border border-orange-600 hover:bg-gray-900 px-4 rounded-sm cursor-pointer'>
            <h1 className='text-white'>Learn More</h1>
          </div>
          <div className='flex items-center space-x-2 p-2 border border-orange-600 hover:bg-orange-600 px-4 rounded-sm cursor-pointer'>
            <h1 className='text-white'>Join Now</h1>
            <FaLongArrowAltRight className='text-white'/>
          </div>
        </div>
      </div>
    </div>
  );
}
