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
    <div className={className}>
      {!isCustom ? (
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="When do you want to leave?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="now">Leave Now</SelectItem>
            <SelectItem value="15min">In 15 minutes</SelectItem>
            <SelectItem value="30min">In 30 minutes</SelectItem>
            <SelectItem value="1hour">In 1 hour</SelectItem>
            <SelectItem value="custom">Custom Time</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="datetime-local"
          value={customDateTime || getCurrentDateTime()}
          onChange={(e) => handleCustomDateTimeChange(e.target.value)}
          min={getCurrentDateTime()}
        />
      )}
    </div>
  );
}
