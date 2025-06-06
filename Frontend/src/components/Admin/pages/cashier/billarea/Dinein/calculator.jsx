import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function Calculator({
  setCalculator,
  tableData,
  totalAfterDiscount,
  playClickSound,
}) {
  const [enteredAmount, setEnteredAmount] = useState(""); // State for entered amount
  const [returnAmount, setReturnAmount] = useState(""); // State for return amount
  const { t } = useTranslation();
  const handleEnteredAmountChange = (e) => {
    const value = e.target.value;
    setEnteredAmount(value);

    // Calculate return amount when entered amount changes
    if (value && !isNaN(value)) {
      setReturnAmount(value - totalAfterDiscount);
    } else {
      setReturnAmount("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('calculator')}</h1>
        <h1 className="text-xl font-bold">
          {t('table')} : {tableData?.table?.name || t('na')}
        </h1>
      </div>
      <div className="flex justify-between items-center space-x-4">
        <div className="space-y-2">
          <label htmlFor="">{t('totalAmount')}</label>
          <input
            className="block outline-none bg-gray-800 border border-gray-500 p-1"
            type="text"
            name=""
            id=""
            value={totalAfterDiscount}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="">{t('enterAmount')} </label>
          <input
            className="block outline-none bg-gray-800 border border-gray-500 p-1"
            type="text"
            name=""
            id=""
            value={enteredAmount}
            onChange={handleEnteredAmountChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="" className="flex justify-center items-center">
          {t('returnAmount')}
        </label>
        <input
          className="block outline-none w-full text-center bg-gray-800 border border-gray-500 p-1"
          type="text"
          name=""
          id=""
          value={returnAmount ? returnAmount.toFixed(2) : ""}
          readOnly
        />
      </div>
      <button
        className="w-full bg-gray-900 p-2 rounded"
        onClick={() => {playClickSound();setCalculator(false)}}
      >
        {t('close')}
      </button>
    </div>
  );
}
