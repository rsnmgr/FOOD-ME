import React, { useState, useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useTranslation } from 'react-i18next';

// SearchableSelect component with customizable dropdown max height
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  required = false,
  maxDropdownHeight = "max-h-60", // default max height (15rem)
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className="relative w-full" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-white mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-left rounded cursor-pointer"
      >
        {selectedLabel || placeholder}
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded shadow-lg overflow-auto ${maxDropdownHeight}`}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 bg-gray-800 text-white border-b border-gray-700 outline-none"
          />
          <ul className="max-h-full overflow-y-auto">
            {filteredOptions.length === 0 && (
              <li className="p-2 text-gray-400 select-none">No options found</li>
            )}
            {filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`cursor-pointer px-3 py-2 hover:bg-blue-700 ${
                  opt.value === value ? "bg-blue-600" : ""
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Main ProductForm component
export default function ProductForm({
  selectedDetail,
  handleSubmit,
  formData,
  handleChange,
  categories,
  selectedImage,
  fileInputRef,
  handleImageChange,
  handleToggleModal,
  setFormData,
  units,
}) {
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      units: selectedDetail?.units ?? [],
    }));
  }, [selectedDetail, setFormData]);

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const unitOptions = units.map((unit) => ({
    value: unit._id,
    label: unit.name,
  }));

  const handleAddUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [...(prev.units || []), { size: "", price: "" }],
    }));
  };

  const handleUnitChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedUnits = [...(prev.units || [])];
      updatedUnits[index][field] = value;
      return { ...prev, units: updatedUnits };
    });
  };

  const handleRemoveUnit = (index) => {
    setFormData((prev) => {
      const updatedUnits = (prev.units || []).filter((_, i) => i !== index);
      return { ...prev, units: updatedUnits };
    });
  };
    const { t} = useTranslation();


  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-50 z-50">
      <div className="relative p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-md max-w-xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-semibold text-white">
            {selectedDetail ? t("edit_product") : t('add_product')}
          </h1>
          <RxCross2
            title="Close"
            size={25}
            className="cursor-pointer text-white"
            onClick={handleToggleModal}
          />
        </div>

        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                 {t('name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block p-2 bg-gray-900 px-3 border border-gray-700 outline-none w-full text-white"
                  required
                />
              </div>

              {/* Category Selection */}
              <SearchableSelect
                label={t('category')}
                options={categoryOptions}
                value={formData.category}
                onChange={(val) =>
                  handleChange({ target: { name: "category", value: val } })
                }
                placeholder="Select Category"
                required
                maxDropdownHeight="max-h-28" // smaller dropdown height here (8rem)

              />

              {/* Status Select */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  {t('status')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block p-2 bg-gray-900 px-3 border border-gray-700 outline-none w-full text-white"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Units Section */}
              <div className="space-y-2 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white font-semibold">{t('units')}</label>
                  <button
                    type="button"
                    className="p-2 bg-green-700 rounded"
                    onClick={handleAddUnit}
                    title="Add Unit"
                  >
                    <FaPlus size={16} />
                  </button>
                </div>
                <div className="h-[18vh]  overflow-y-auto">
                {(formData.units ?? []).map((unit, index) => (
                  <div key={index} className="flex gap-2 items-center mb-1">
                    <div className="flex-1">
                      <SearchableSelect
                        options={unitOptions}
                        value={unit.size}
                        onChange={(val) => handleUnitChange(index, "size", val)}
                        placeholder={t('selectUnit')}
                        required
                        maxDropdownHeight="max-h-20" // smaller dropdown height here (8rem)
                      />
                    </div>

                    <input
                      type="number"
                      placeholder={t('price')}
                      value={unit.price}
                      onChange={(e) =>
                        handleUnitChange(index, "price", e.target.value)
                      }
                      className="bg-gray-900 border border-gray-700 px-3 py-2 text-white w-24"
                      required
                      min="0"
                      step="any"
                    />

                    <button
                      type="button"
                      className="p-2 bg-red-700 rounded"
                      onClick={() => handleRemoveUnit(index)}
                      title="Remove Unit"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="object-cover w-full h-[37vh] rounded-md"
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-2 bg-green-700 text-white w-full rounded"
              >
               {t('browseImage')}
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-700 text-white w-full rounded"
              >
                {selectedDetail ? t('edit_product') : t('add_product')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
