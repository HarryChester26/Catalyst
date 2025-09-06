"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { GeocodingService, GeocodeResult } from '@/lib/google-maps/geocoding';

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: GeocodeResult) => void;
  className?: string;
}

export default function AddressAutocomplete({
  placeholder,
  value,
  onChange,
  onPlaceSelect,
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [geocodingService, setGeocodingService] = useState<GeocodingService | null>(null);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("AddressAutocomplete: Checking for Google Maps...");
    if (typeof window !== 'undefined' && window.google?.maps) {
      console.log("AddressAutocomplete: Google Maps found, initializing GeocodingService");
      setGeocodingService(new GeocodingService());
    } else {
      console.log("AddressAutocomplete: Google Maps not found");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (inputValue: string) => {
    console.log("AddressAutocomplete: Input changed to:", inputValue);
    onChange(inputValue);
    setNoResults(false);
    
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!inputValue.trim() || !geocodingService) {
      console.log("AddressAutocomplete: No input or no geocoding service");
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Debounce the geocoding request
    debounceTimeout.current = setTimeout(async () => {
      console.log("AddressAutocomplete: Starting geocoding for:", inputValue);
      setIsLoading(true);
      try {
        const results = await geocodingService.geocodeAddress(inputValue);
        console.log("AddressAutocomplete: Geocoding results:", results);
        
        if (results.length === 0) {
          setNoResults(true);
          setSuggestions([]);
          setIsOpen(false);
        } else {
          setNoResults(false);
          setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
          setIsOpen(results.length > 0);
        }
      } catch (error) {
        console.error('AddressAutocomplete: Error geocoding address:', error);
        setSuggestions([]);
        setIsOpen(false);
        setNoResults(true);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  };

  const handleSuggestionClick = (suggestion: GeocodeResult) => {
    console.log("AddressAutocomplete: Suggestion clicked:", suggestion);
    onChange(suggestion.formatted_address);
    onPlaceSelect(suggestion);
    setIsOpen(false);
    setNoResults(false);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder={placeholder || "Enter address..."}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        className={className}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.place_id}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium text-sm">{suggestion.name}</div>
              <div className="text-xs text-gray-600">{suggestion.formatted_address}</div>
            </div>
          ))}
        </div>
      )}

      {noResults && value.trim() && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="text-sm text-gray-600">
            No results found for "{value}". Try a different address or be more specific.
          </div>
        </div>
      )}
    </div>
  );
}
