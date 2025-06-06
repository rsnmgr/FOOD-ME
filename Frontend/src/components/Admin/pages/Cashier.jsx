import { useState } from 'react';
import Table from './cashier/Table';
import BillArea from './cashier/BillArea';

export default function Cashier({userRole}) {
  const [selectedTable, setSelectedTable] = useState(null);

  return (
    <div className="flex flex-col md:flex-row h-full gap-3">
      <div className={`w-full md:w-1/2 h-full overflow-y-auto ${selectedTable ? 'hidden md:block' : ''}`}>
        <Table onTableSelect={setSelectedTable} userRole={userRole} />
      </div>
      <div className={`w-full md:w-1/2 h-full overflow-y-auto  ${selectedTable ? 'block' : 'hidden md:block'}`}>
        <BillArea setSelectedTable={setSelectedTable} userRole={userRole} />
      </div>
    </div>
  );
}
