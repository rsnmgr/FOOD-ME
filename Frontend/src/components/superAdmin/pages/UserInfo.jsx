import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi"; // Trash icon
const API_URL = import.meta.env.VITE_API_URL;

export default function UserInfo() {
  const [userMessages, setUserMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/message`);
      const data = await response.json();
      setUserMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/message/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setUserMessages((prev) => prev.filter((msg) => msg._id !== id));
      } else {
        console.error("Failed to delete message:", result.message);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {userMessages.length === 0 ? (
          <p className="text-center text-gray-400">No messages found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {userMessages.map((msg) => (
              <div
                key={msg._id}
                className="bg-gray-800 rounded-2xl shadow-md border border-gray-700 hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between relative"
              >
                <button
                  onClick={() => handleDelete(msg._id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 size={18} />
                </button>
                <div>
                  <div className="mb-3">
                    <h2 className="text-xl font-semibold text-indigo-400">{msg.name}</h2>
                    <p className="text-sm text-gray-400">{msg.email}</p>
                    <p className="text-sm text-gray-400">{msg.phone}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-sm text-gray-100 leading-relaxed">
                    {msg.message}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-4">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
