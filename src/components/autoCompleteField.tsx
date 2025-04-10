"use client";
import React, { useEffect, useState } from "react";

interface AutocompleteFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string; flag: React.ReactNode }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  isLoading?: boolean;
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  required = false,
  isLoading = false,
}) => {


 
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [optionClicked, setOptionClicked] = useState(false);
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);

    const filtered = options.filter((option) =>
       
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    
    );
    setFilteredOptions(filtered);
    setOptionClicked(false); // Reset the flag on new input
  };

  const handleOptionSelect = (selectedValue: string, selectedLabel: string) => {
    setInputValue(selectedLabel); // Display the label in the input field
    onChange({
      target: { name, value: selectedLabel },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
    setOptionClicked(true); // Mark the option as clicked
    setIsFocused(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!optionClicked) {
        // Clear the input only if no option was clicked
        setInputValue("");
        onChange({
          target: { name, value: "" },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
      setIsFocused(false);
    }, 200); // Delay to allow dropdown clicks to register
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          required={required}
          disabled={isLoading}
           className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder={label}
          autoComplete="off"
        />
        {/* <label
          htmlFor={id}
          className={`absolute left-2 transform -translate-y-1/2 text-[#79747e] text-sm transition-all duration-100 ease-in-out ${inputValue
              ? "top-0 text-primary bg-[#FAFAFA] px-1 text-xs "
              : "top-1/2 text-sm text-[#79747e]"
            } peer-focus:top-0 peer-focus:bg-[#FAFAFA] peer-focus:px-1 peer-focus:text-xs peer-focus:text-primary peer-focus:border-primary`}
        >
          {label}
        </label> */}
      </div>

      {isFocused && filteredOptions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full max-h-40 overflow-y-auto shadow-md">
          {filteredOptions.map((option, index) => (
            <li
              key={`${option.value}-${index}`}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking an option
              onClick={() => handleOptionSelect(option.value, option.label)}
              className="px-3 flex items-center py-2 cursor-pointer hover:bg-gray-100"
            >
              {option.flag}
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {isFocused && filteredOptions.length === 0 && (
        <div className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full shadow-md p-2 text-gray-500">
          No options found
        </div>
      )}
    </div>
  );
};

export default AutocompleteField;
