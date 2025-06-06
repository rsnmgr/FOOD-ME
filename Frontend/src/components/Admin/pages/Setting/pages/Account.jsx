import { useState, useContext } from 'react';
import { LoginContext } from '../../../../ContextProvider/Context';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Admin() {
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;
  const { t } = useTranslation();

  // State to store old password, new password, and confirm password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Function to handle form submission
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/updatePassword/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      // Show the backend message only
      if (response.ok) {
        toast.success(data.message || 'Password updated successfully');
        handleClearFields(); // Clear fields after success
      } else {
        toast.error(data.message || 'Error updating password');
      }
    } catch (error) {
      console.error("Error updating password:", error);
      // toast.error('An error occurred while updating the password.');
    }
  };

  // Function to clear input fields
  const handleClearFields = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className='px-4 py-4 md:px-12'>
      <h1 className='text-lg'>{t('accountSettings')}</h1>
      <form
  onSubmit={(e) => {
    e.preventDefault();
    handleUpdatePassword();
  }}
  className='px-4 py-4 md:px-12'
>
  <h1 className='text-lg'>{t('accountSettings')}</h1>

  <div className='grid md:grid-cols-2 gap-2 md:gap-4 mt-4'>
    <div>
      <label htmlFor="old" className="block text-sm font-medium text-gray-300">
        {t('oldPassword')}
      </label>
      <input
        type="password"
        id="old"
        name="oldPassword"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        className="w-full p-1 mt-1 text-gray-500 border border-gray-700 outline-none bg-gray-900"
        required
      />
    </div>

    <div className='md:col-span-2 grid grid-cols-2 gap-4'>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          {t('newPassword')}
        </label>
        <input
          type="password"
          id="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-1 mt-1 text-gray-500 border border-gray-700 outline-none bg-gray-900"
          required
          minLength={6}
        />
      </div>
      <div>
        <label htmlFor="cpassword" className="block text-sm font-medium text-gray-300">
          {t('confirmPassword')}
        </label>
        <input
          type="password"
          id="cpassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-1 mt-1 text-gray-500 border border-gray-700 outline-none bg-gray-900"
          required
          minLength={6}
        />
      </div>
    </div>
  </div>

  <div className='space-x-2 mt-4'>
    <button
      type="submit"
      className='p-2 bg-gray-800 hover:bg-gray-900 px-4 rounded-sm border border-gray-800'
    >
      {t('update')}
    </button>
    <button
      type="button"
      className='p-2 hover:bg-gray-800 px-4 rounded-sm border border-gray-800'
      onClick={handleClearFields}
    >
      {t('clear')}
    </button>
  </div>

  <ToastContainer position="bottom-right" />
</form>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
