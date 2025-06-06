import { FaQrcode, FaMobileAlt, FaUtensils, FaShoppingCart, FaMoneyBillAlt, FaUserShield, FaClock, FaStar, FaGift } from 'react-icons/fa';

export default function Feature() {
  return (
    <div>
      <h1 className='text-center text-4xl text-orange-500 font-semibold mb-12'>Key Features</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        
        {/* QR Code Ordering Feature */}
        <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaQrcode className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>QR Code Table Ordering</h2>
          <p className='text-gray-300 text-center'>
            Customers can scan the QR code on their table to view the menu, place orders directly from their mobile devices, and track order status in real time.
          </p>
        </div>

        {/* Online Platform Feature */}
        <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaMobileAlt className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Online Ordering Platform</h2>
          <p className='text-gray-300 text-center'>
            Users can order food online through a user-friendly platform, offering seamless browsing of the menu, customizations, and real-time order updates.
          </p>
        </div>

        {/* Menu and Food Items */}
        <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaUtensils className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Extensive Menu</h2>
          <p className='text-gray-300 text-center'>
            Browse through an extensive menu with detailed descriptions, images, and customizable options for each dish, enhancing the dining experience.
          </p>
        </div>

        {/* Shopping Cart and Checkout */}
        <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaShoppingCart className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Easy Shopping Cart & Checkout</h2>
          <p className='text-gray-300 text-center'>
            Effortlessly add items to your cart and proceed through a simple, fast checkout process. Multiple payment methods supported.
          </p>
        </div>

        {/* Payment Options */}
        <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaMoneyBillAlt className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Multiple Payment Methods</h2>
          <p className='text-gray-300 text-center'>
            Supports a variety of payment options including credit cards, digital wallets, and contactless payments to make transactions convenient and secure.
          </p>
        </div>

        {/* Security and Privacy */}
        <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaUserShield className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Secure and Private</h2>
          <p className='text-gray-300 text-center'>
            Our platform prioritizes security with encrypted transactions and data privacy, ensuring a safe environment for both customers and restaurants.
          </p>
        </div>

        {/* Real-Time Order Tracking */}
        <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaClock className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Real-Time Order Tracking</h2>
          <p className='text-gray-300 text-center'>
            Customers can track the status of their orders in real time, from kitchen preparation to delivery at the table, ensuring transparency and convenience.
          </p>
        </div>

        {/* Customer Feedback Feature */}
        {/* <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaStar className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Customer Feedback</h2>
          <p className='text-gray-300 text-center'>
            Customers can easily leave feedback after their meals, helping restaurants improve service quality while building customer satisfaction and loyalty.
          </p>
        </div> */}

        {/* Loyalty Rewards Program Feature */}
        {/* <div className='bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gray-800 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer'>
          <div className='flex justify-center mb-6'>
            <FaGift className="text-orange-500 text-6xl" />
          </div>
          <h2 className='text-center text-2xl font-bold  mb-4'>Loyalty Rewards Program</h2>
          <p className='text-gray-300 text-center'>
            Implement a loyalty program where returning customers earn points for discounts, exclusive deals, and special offers, enhancing retention.
          </p>
        </div> */}

      </div>
    </div>
  );
}
