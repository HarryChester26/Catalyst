"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [customDateTime, setCustomDateTime] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleValueChange = (newValue: string) => {
    if (newValue === 'custom') {
      setIsCustom(true);
      onChange(customDateTime);
    } else {
      setIsCustom(false);
      onChange(newValue);
    }
  };

  const handleCustomDateTimeChange = (dateTime: string) => {
    setCustomDateTime(dateTime);
    if (isCustom) {
      onChange(dateTime);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className={`${className} relative z-10`}>
      {!isCustom ? (
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger className="bg-white border-2 border-gray-200 shadow-lg backdrop-blur-none">
            <SelectValue placeholder="When do you want to leave?" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 border-gray-200 shadow-xl backdrop-blur-none z-50">
            <SelectItem value="now" className="bg-white hover:bg-gray-50">Leave Now</SelectItem>
            <SelectItem value="15min" className="bg-white hover:bg-gray-50">In 15 minutes</SelectItem>
            <SelectItem value="30min" className="bg-white hover:bg-gray-50">In 30 minutes</SelectItem>
            <SelectItem value="1hour" className="bg-white hover:bg-gray-50">In 1 hour</SelectItem>
            <SelectItem value="custom" className="bg-white hover:bg-gray-50">Custom Time</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="datetime-local"
          value={customDateTime || getCurrentDateTime()}
          onChange={(e) => handleCustomDateTimeChange(e.target.value)}
          min={getCurrentDateTime()}
          className="bg-white border-2 border-gray-200 shadow-lg backdrop-blur-none"
        />
      )}
    </div>
  );
}
