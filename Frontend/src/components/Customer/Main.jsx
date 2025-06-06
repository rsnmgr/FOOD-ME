// Main.js
import { useState } from 'react';
import Navbar from './main/Navbar';
import Sidebar from './main/Sidebar';
import DisplayMenu from './main/DisplayMenu';

export default function Main() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // State for the search query
  return (
    <div className="flex flex-col h-full">
      {/* Navbar Section */}
      <div className="border-b border-gray-800 bg-gray-900">
        <Navbar onSearch={setSearchQuery} />
      </div>

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Section */}
        <div className="w-[30%] md:w-[20%] shadow-xl text-center text-sm overflow-y-auto p-0.5">
          <Sidebar onCategorySelect={setSelectedCategory} />
        </div>

        {/* Display Menu Section */}
        <div className="bg-gray-900 w-[70%] md:w-[80%] overflow-y-auto p-0.5">
          <DisplayMenu selectedCategory={selectedCategory} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
