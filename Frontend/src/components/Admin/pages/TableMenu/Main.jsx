import { useState } from 'react';
import Sidebar from './Sidebar';
import Items from './Items';
import SelectedItems from './SelectedItems';
export default function Main({ userRole }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid md:grid-cols-2 h-full p-2">
      {/* Main content grid: sidebar and items */}
      <div className={`grid grid-cols-4 overflow-hidden ${isOpen ? 'hidden' : 'flex'} md:flex `}>
        {/* Sidebar */}
        <div className="col-span-1 overflow-y-auto border-r border-gray-700">
          <Sidebar onCategorySelect={setSelectedCategory} userRole={userRole} />
        </div>

        {/* Items */}
        <div className="col-span-3 overflow-y-auto w-full">
          <Items
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userRole={userRole}
            onCartClick={() => setIsOpen(true)}
          />
        </div>
      </div>

      {/* Bottom area */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block  border-t border-gray-700   text-white bg-black`}>
        <SelectedItems userRole={userRole} onCartClick={() => setIsOpen(false)}/>
      </div>
    </div>
  );
}
