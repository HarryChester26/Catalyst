"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GeocodingService, GeocodeResult } from '@/lib/google-maps/geocoding';
import { Search, MapPin, X } from 'lucide-react';

interface QuickAddressInputProps {
  placeholder: string;
  onPlaceSelect: (place: GeocodeResult) => void;
  className?: string;
}

export default function QuickAddressInput({ placeholder, onPlaceSelect, className }: QuickAddressInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [geocodingService, setGeocodingService] = useState<GeocodingService | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      setGeocodingService(new GeocodingService());
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

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    setNoResults(false);
    
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!value.trim() || !geocodingService) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Debounce the geocoding request
    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await geocodingService.geocodeAddress(value);
        
        if (results.length === 0) {
          setNoResults(true);
          setSuggestions([]);
          setIsOpen(false);
        } else {
          setNoResults(false);
          setSuggestions(results.slice(0, 8)); // Show more options (8 instead of 5)
          setIsOpen(results.length > 0);
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
        setSuggestions([]);
        setIsOpen(false);
        setNoResults(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion: GeocodeResult) => {
    setSelectedPlace(suggestion);
    setInputValue(suggestion.formatted_address);
    onPlaceSelect(suggestion);
    setIsOpen(false);
    setNoResults(false);
  };

  const clearSelection = () => {
    setSelectedPlace(null);
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    setNoResults(false);
  };

  const handleSearch = () => {
    if (inputValue.trim() && geocodingService) {
      handleInputChange(inputValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            className="pr-10"
          />
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            </div>
          )}

          {selectedPlace && !isLoading && (
            <button
              onClick={clearSelection}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Button
          onClick={handleSearch}
          disabled={!inputValue.trim() || isLoading}
          variant="outline"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.place_id}-${index}`}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {suggestion.formatted_address}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {noResults && inputValue.trim() && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="text-sm text-gray-600">
            No results found for "{inputValue}". Try a different address or be more specific.
          </div>
        </div>
      )}

      {/* Selected Address Display */}
      {selectedPlace && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-green-800 font-medium truncate">
                {selectedPlace.name}
              </div>
              <div className="text-xs text-green-700 truncate">
                {selectedPlace.formatted_address}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
