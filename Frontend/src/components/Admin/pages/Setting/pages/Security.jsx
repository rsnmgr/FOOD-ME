import { useEffect, useState, useContext } from 'react';
import moment from 'moment';
import { LoginContext } from '../../../../ContextProvider/Context';
import { HiPlus } from 'react-icons/hi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Security({ userRole }) {
  const [ipAddress, setIpAddress] = useState('');
  const { loginData } = useContext(LoginContext);
  const [ipList, setIpList] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIp, setSelectedIp] = useState(null);
  const userId = userRole === 'admin' ? loginData?.validUser?._id : loginData?.validUser?.AdminId;
  const { t } = useTranslation();

  // Fetch the SERVER IP from your backend API
  const fetchServerIP = async () => {
    try {
      const res = await fetch(`${API_URL}/api/server-ip`);
      if (!res.ok) throw new Error('Failed to fetch server IP');
      const data = await res.json();
      setIpAddress(data.localIP || '');
    } catch (err) {
      console.error('Error fetching server IP:', err);
      setIpAddress(t('unableToFetchIp'));
    }
  };

  // Fetch IP list from backend
  const fetchIpList = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/get-ip/${userId}`);
      const data = await res.json();
      setIpList(data.ips || []);
    } catch (err) {
      console.error('Error fetching IP list:', err);
      setIpList([]);
    }
  };

  const addIp = async (ip) => {
    if (!userId || !ip) return;
    try {
      const res = await fetch(`${API_URL}/api/add-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AdminId: userId, ip }),
      });
      const data = await res.json();
      if (res.ok) {
        setIpList((prev) => [...prev, { ip, Date: new Date().toISOString() }]);
        toast.success(data.message || 'IP added successfully!');
      } else {
        toast.error(data.message || 'Failed to add IP');
      }
    } catch (err) {
      console.error('Error adding IP:', err);
      toast.error('Error adding IP');
    }
  };

  const deleteIp = async (ip) => {
    if (!userId || !ip) return;
    try {
      const res = await fetch(`${API_URL}/api/delete-ip`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AdminId: userId, ip }),
      });
      const data = await res.json();
      if (res.ok) {
        setIpList((prev) => prev.filter((item) => (typeof item === 'string' ? item !== ip : item.ip !== ip)));
        toast.success(data.message || 'IP deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete IP');
      }
    } catch (err) {
      console.error('Error deleting IP:', err);
      toast.error('Error deleting IP');
    }
  };

  const handleDeleteClick = (ip) => {
    setSelectedIp(ip);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteIp(selectedIp);
    setShowConfirm(false);
    setSelectedIp(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedIp(null);
  };

  useEffect(() => {
    fetchServerIP();
  }, []);

  useEffect(() => {
    fetchIpList();
  }, [userId]);

  const handleAddIP = () => {
    if (
      ipAddress &&
      ipAddress !== 'Unable to fetch IP' &&
      !ipList.some((item) => (typeof item === 'string' ? item === ipAddress : item.ip === ipAddress))
    ) {
      addIp(ipAddress);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl mb-4 font-bold">{t('securityTitle')}</h1>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-950 bg-opacity-50 z-50">
          <div className="bg-gray-800 border border-gray-500 p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 ">{t('confirmDeletion')}</h2>
            <p className="mb-4 ">
              {t('deleteIpPrompt')} <strong>{selectedIp}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">
                {t('cancel')}
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                 {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {ipAddress &&
        ipAddress !== 'Unable to fetch IP' &&
        !ipList.some((item) => (typeof item === 'string' ? item === ipAddress : item.ip === ipAddress)) && (
          <div className="mb-6 p-4 border border-yellow-400 rounded bg-yellow-900 text-yellow-300 flex justify-between items-center">
            <div>
              {t('serverLocalIpNotAdded')}: <strong>{ipAddress || t('loading')}</strong>
            </div>
            <button onClick={handleAddIP} className="text-green-400 hover:text-green-600" title={t('addServerIp')}>
              <HiPlus className="inline h-6 w-6" />
            </button>
          </div>
        )}

      <div className="rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-gray-600 rounded-lg">
              <table className="min-w-full table-fixed text-sm text-left">
                <thead className="bg-gray-700 text-gray-200 w-full table table-fixed">
                  <tr>
                    <th className="w-[10%] px-4 py-2 border border-gray-600">{t('sn')}</th>
                    <th className="w-[30%] px-4 py-2 border border-gray-600">{t('ipAddress')}</th>
                    <th className="w-[40%] px-4 py-2 border border-gray-600">{t('date')}</th>
                    <th className="w-[20%] px-4 py-2 border border-gray-600">{t('action')}</th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-64 overflow-y-auto w-full">
                <table className="min-w-full table-fixed text-sm text-left">
                  <tbody className="w-full table table-fixed">
                    {ipList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-center text-gray-400">
                          {t('noIpFound')}
                        </td>
                      </tr>
                    ) : (
                      ipList.map((entry, index) => {
                        const ip = typeof entry === 'string' ? entry : entry.ip;
                        const dateStr = entry.Date || entry.createdAt || entry.date;
                        return (
                          <tr key={ip} className="hover:bg-gray-700">
                            <td className="w-[10%] px-4 py-2 border border-gray-700">{index + 1}</td>
                            <td className="w-[30%] px-4 py-2 border border-gray-700">{ip}</td>
                            <td className="w-[40%] px-4 py-2 border border-gray-700">
                              {dateStr ? moment(dateStr).format('MMMM Do YYYY, h:mm a') : t('na')}
                            </td>
                            <td className="w-[20%] px-4 py-2 border border-gray-700">
                              <button
                                title="Remove IP"
                                className="text-red-400 hover:text-red-600"
                                onClick={() => handleDeleteClick(ip)}
                              >
                                <RiDeleteBin6Fill className="inline h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
