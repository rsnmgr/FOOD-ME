import {useState} from 'react';
import axios from 'axios';  // Import axios

const API_URL = import.meta.env.VITE_API_URL;
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';  

export default function Contact() {
  const [formData,setFormData] = useState({
    name: '',
    phone:'',
    email:'',
    message:'',
  });
  const handleChange = (e)=>{
    const {id,value} = e.target;
    setFormData({...formData,[id]:value});
  }
  const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/message`, formData);
      
      // Display backend message in Toast
      toast.success(response.data.message);  

      // Clear form after success
      setFormData({ name: '',phone:'', email: '', message: '' });
    } catch (error) {
      // Display backend error message (if available)
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong! Please try again.");
      }
    }
  }
  return (
    <div>
      <h1 className='text-center text-4xl text-orange-500 font-semibold my-10'>Get in Touch</h1>

      {/* Contact Form */}
      <div className=''>
        <form className='bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <h2 className='text-2xl text-center mb-6'>Contact Us</h2>
          
          <div className='mb-4'>
            <label className='block  text-sm font-bold mb-2' htmlFor='name'>
              Name
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-900'
              id='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
              placeholder='Your Name'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block  text-sm font-bold mb-2' htmlFor='email'>
              Phone
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-900'
              id='phone'
              type='text'
              value={formData.phone}
              onChange={handleChange}
              placeholder='Your Phone'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block  text-sm font-bold mb-2' htmlFor='email'>
              Email
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-900'
              id='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Your Email'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block  text-sm font-bold mb-2' htmlFor='message'>
              Message
            </label>
            <textarea
              className='shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-900'
              id='message'
              value={formData.message}
              onChange={handleChange}
              placeholder='Your Message'
              rows='4'
              required
            />
          </div>

          <div className='flex'>
            <button
              className='bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline'
              type='submit'
              onClick={handleSubmit}
            >
              Send Message
            </button>
          </div>
        </form>
      </div>

      {/* Footer Section */}
      <footer className='bg-gray-900 text-white py-6'>
        <div className='max-w-4xl mx-auto text-center'>
          <p className='text-sm'>© 2024 FOODS ME. All Rights Reserved.</p>
          <p className='text-sm'>Follow us on social media: 
            <a href="https://www.facebook.com/profile.php?id=100084512194161" target="_blank" className='text-orange-500 hover:text-orange-400 mx-2'>Facebook</a> |
            <a href="#" target="_blank" className='text-orange-500 hover:text-orange-400 mx-2'>Twitter</a> |
            <a href="https://www.instagram.com/roshanthapamagar_/" target="_blank"  className='text-orange-500 hover:text-orange-400 mx-2'>Instagram</a>
          </p>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}
