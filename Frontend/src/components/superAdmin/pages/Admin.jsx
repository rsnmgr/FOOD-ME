import { useState, useRef, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { RxCross1 } from "react-icons/rx";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import img from '../../../assets/defaultImg.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = import.meta.env.VITE_API_URL;
import moment from 'moment';

export default function Admin() {
  const [selectedImage, setSelectedImage] = useState(img);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const fileInputRef = useRef(null);
  const [inpVal, setInpVal] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    restaurant: '',
    password: '',
    status: 'Active',
    trialStartDate: new Date(),
    trialEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });
  const [customers, setCustomers] = useState([]);

  // Fetch customers function
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetchAll`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      } else {
        console.error('Failed to fetch customers:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInpVal({ ...inpVal, [name]: value });
  };

  const handleChooseImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleOpenForm = (customer = null) => {
    setFormVisible(true);
    if (customer) {
      setCurrentCustomerId(customer._id);
      setInpVal({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        restaurant: customer.restaurant,
        password: '', // Don't populate password for security reasons
        status: customer.status,
        trialStartDate: customer.trialStartDate ? new Date(customer.trialStartDate) : new Date(),
        trialEndDate: customer.trialEndDate ? new Date(customer.trialEndDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      });
      setSelectedImage(customer.image ? `${API_URL}/${customer.image}` : img);
    } else {
      setCurrentCustomerId(null);
      setInpVal({
        name: '',
        email: '',
        phone: '',
        address: '',
        restaurant: '',
        password: '',
        status: 'Active',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      });
      setSelectedImage(img);
    }
  };

  const handleDelete = (customerId) => {
    setDeleteConfirmVisible(true);
    setCurrentCustomerId(customerId);
  };

  const handleConfirmDelete = async () => {
    try {
      // Optimistically remove the customer from the local state before the deletion call
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer._id !== currentCustomerId));
  
      const response = await fetch(`${API_URL}/api/delete/${currentCustomerId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message); // Display backend success message
        fetchCustomers(); // Fetch customers again to make sure the data is synced with the server
      } else {
        toast.error(data.message); // Display backend error message
      }
    } catch (error) {
      toast.error('Error deleting customer');
      console.error('Error deleting customer:', error);
    } finally {
      setDeleteConfirmVisible(false);
      setCurrentCustomerId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    
    // Handle dates
    if (inpVal.trialStartDate) {
      formData.append('trialStartDate', inpVal.trialStartDate.toISOString());
    }
    if (inpVal.trialEndDate) {
      formData.append('trialEndDate', inpVal.trialEndDate.toISOString());
    }

    // Append other form data
    Object.entries(inpVal).forEach(([key, value]) => {
      if (!['trialStartDate', 'trialEndDate'].includes(key)) {
        formData.append(key, value);
      }
    });

    const fileInput = fileInputRef.current.files[0];
    if (fileInput) {
      formData.append('image', fileInput);
    }

    try {
      const response = currentCustomerId
        ? await fetch(`${API_URL}/api/update/${currentCustomerId}`, {
            method: 'PUT',
            body: formData,
          })
        : await fetch(`${API_URL}/api/create`, {
            method: 'POST',
            body: formData,
          });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message); // Display backend success message
        fetchCustomers(); // Fetch customers after add or edit
        setInpVal({
          name: '',
          email: '',
          phone: '',
          address: '',
          restaurant: '',
          password: '',
          status: '',
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        });
        setSelectedImage(img);
        setFormVisible(false);
        setCurrentCustomerId(null);
      } else {
        toast.error(data.message); // Display backend error message
      }
    } catch (error) {
      toast.error('Error saving customer');
      console.error('Error saving customer:', error);
    }
  };

  const CustomDateTimeInput = ({ value, onChange, label, minDate, maxDate }) => {
    const handleChange = (e) => {
      const dateTimeStr = e.target.value;
      const [datePart, timePart] = dateTimeStr.split('T');
      if (datePart && timePart) {
        const [hours, minutes] = timePart.split(':');
        const date = new Date(dateTimeStr);
        onChange(date);
      }
    };

    const formatDateTimeLocal = (date) => {
      if (!date) return '';
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <input
          type="datetime-local"
          value={formatDateTimeLocal(value)}
          onChange={handleChange}
          min={minDate ? formatDateTimeLocal(minDate) : undefined}
          max={maxDate ? formatDateTimeLocal(maxDate) : undefined}
          className="w-full p-1 mt-1 text-gray-300 border border-gray-500 outline-none bg-gray-800"
          required
        />
      </div>
    );
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <h1>My Customers</h1>
        <div className="bg-gray-700 p-2" onClick={() => handleOpenForm()}>
          <FaPlus size={16} />
        </div>
      </div>

      {/* Table Section */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-center rtl:text-right ">
          <thead className="text-xs uppercase bg-gray-800  border-b border-gray-600">
            <tr>
              <th scope="col" className="px-6 py-3">SN</th>
              <th scope="col" className="px-6 py-3">User name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Phone</th>
              <th scope="col" className="px-6 py-3">Address</th>
              <th scope="col" className="px-6 py-3">Restaurant Name</th>
              <th scope="col" className="px-6 py-3">Image</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer, index) => (
                customer && (
                  <tr key={customer._id} className="bg-gray-900 border-b border-gray-800">
                    <td className="px-6 py-4 items-center text-center">{index + 1}</td>
                    <th scope="row" className="px-6 py-4 font-medium  whitespace-nowrap items-center text-center">
                      {customer.name}
                    </th>
                    <td className="px-6 py-4 items-center text-center">{customer.email}</td>
                    <td className="px-6 py-4 items-center text-center">{customer.phone}</td>
                    <td className="px-6 py-4 items-center text-center">{customer.address}</td>
                    <td className="px-6 py-4 items-center text-center">{customer.restaurant}</td>
                    <td className="px-6 py-4 items-center text-center">
                      <img src={customer.image ? `${API_URL}/${customer.image}` : img} className="w-8 h-8 border border-gray-600" alt="Customer" />
                    </td>
                    
                    <td className="px-6 py-4 items-center text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="flex items-center justify-center px-6 py-4 space-x-4">
                      <a href="#" className="font-medium text-blue-600  hover:underline">
                        <FaEdit size={16} className="inline-block" onClick={() => handleOpenForm(customer)} />
                      </a>
                      <a href="#" className="font-medium text-red-600  hover:underline">
                        <FaTrash size={16} className="inline-block" onClick={() => handleDelete(customer._id)} />
                      </a>
                    </td>
                  </tr>
                )
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-300">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add and Edit Form */}
      {formVisible && (
  <div className="absolute inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 overflow-y-auto">
    <div className="bg-gray-800 w-[95%] md:w-2/3 p-6 rounded-md max-h-screen overflow-y-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-white">{currentCustomerId ? 'Edit Customer' : 'Add Customer'}</h2>
        <RxCross1 size={20} className="text-white cursor-pointer" onClick={() => setFormVisible(false)} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Left Section */}
          <div className="space-y-4">
            {[
              { id: 'name', label: 'Name', type: 'text' },
              { id: 'email', label: 'Email', type: 'email' },
              { id: 'phone', label: 'Phone', type: 'tel' },
              { id: 'address', label: 'Address', type: 'text' },
              { id: 'restaurant', label: 'Restaurant', type: 'text' },
              { id: 'password', label: 'Password', type: 'text' }
            ].map(({ id, label, type }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-300">{label}</label>
                <input
                  type={type}
                  id={id}
                  name={id}
                  onChange={handleChange}
                  value={inpVal[id]}
                  className="w-full px-3 py-2 mt-1 text-sm text-gray-200 border border-gray-600 outline-none bg-gray-900 rounded"
                  required={id === 'password' ? currentCustomerId === null : true}
                />
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="space-y-4">
            <CustomDateTimeInput
              value={inpVal.trialStartDate}
              onChange={(date) => {
                const now = new Date();
                if (date > now) {
                  toast.error('Trial start date cannot be in the future');
                  return;
                }
                setInpVal({ ...inpVal, trialStartDate: date });
              }}
              label="Trial Start Date & Time"
              maxDate={new Date()}
            />

            <CustomDateTimeInput
              value={inpVal.trialEndDate}
              onChange={(date) => setInpVal({ ...inpVal, trialEndDate: date })}
              label="Trial End Date & Time"
              minDate={inpVal.trialStartDate}
            />

            <div>
              <label className="block text-sm font-medium text-white mb-1">Status</label>
              <select
                name="status"
                value={inpVal.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 text-white rounded outline-none"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex flex-col items-center gap-3">
              <img
                src={selectedImage}
                alt="Customer"
                className="max-h-40 w-full border border-gray-500 rounded object-cover"
              />
              <button
                type="button"
                className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-800 w-full"
                onClick={handleChooseImageClick}
              >
                Choose Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded"
        >
          {currentCustomerId ? 'Update Customer' : 'Add Customer'}
        </button>
      </form>
    </div>
  </div>
)}


      {/* Confirmation Modal */}
      {deleteConfirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-md space-y-4">
            <h3 className="text-white">Are you sure you want to delete this customer?</h3>
            <div className="flex space-x-4">
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-md"
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-600 text-white py-2 px-4 rounded-md"
                onClick={() => setDeleteConfirmVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-left" />
    </div>
  );
}
