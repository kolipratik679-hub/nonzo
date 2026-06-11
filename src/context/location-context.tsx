"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LocationContextType {
  selectedLocation: string | null;
  skippedLocation: boolean;
  isLocationModalOpen: boolean;
  outOfServiceLocation: string | null;
  setLocation: (location: string) => void;
  skipLocation: () => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  setOutOfService: (location: string | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const SERVICE_AREAS = [
  "Ulwe Sector 5",
  "Ulwe Sector 8",
  "Ulwe Sector 17",
  "Ulwe Sector 24"
];

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [skippedLocation, setSkippedLocation] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [outOfServiceLocation, setOutOfServiceLocation] = useState<string | null>(null);

  // Load initial state from localStorage on mount
  useEffect(() => {
    const savedLoc = localStorage.getItem("nonzo_location");
    const savedSkip = localStorage.getItem("nonzo_location_skipped");
    
    if (savedLoc) {
      setTimeout(() => {
        setSelectedLocation(savedLoc);
        setIsLocationModalOpen(false);
      }, 0);
    } else if (savedSkip === "true") {
      setTimeout(() => {
        setSkippedLocation(true);
        setIsLocationModalOpen(false);
      }, 0);
    } else {
      // Open modal after splash screen completes (which is 2.5s)
      const timer = setTimeout(() => {
        setIsLocationModalOpen(true);
      }, 2700);
      return () => clearTimeout(timer);
    }
  }, []);

  const setLocation = (location: string) => {
    if (SERVICE_AREAS.includes(location)) {
      setSelectedLocation(location);
      setSkippedLocation(false);
      setOutOfServiceLocation(null);
      localStorage.setItem("nonzo_location", location);
      localStorage.removeItem("nonzo_location_skipped");
      setIsLocationModalOpen(false);
    } else {
      setOutOfServiceLocation(location);
    }
  };

  const skipLocation = () => {
    setSkippedLocation(true);
    setSelectedLocation(null);
    setOutOfServiceLocation(null);
    localStorage.setItem("nonzo_location_skipped", "true");
    localStorage.removeItem("nonzo_location");
    setIsLocationModalOpen(false);
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    // Only allow closing if a location is selected or skipped
    if (selectedLocation || skippedLocation) {
      setIsLocationModalOpen(false);
    }
  };

  const setOutOfService = (location: string | null) => {
    setOutOfServiceLocation(location);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        skippedLocation,
        isLocationModalOpen,
        outOfServiceLocation,
        setLocation,
        skipLocation,
        openLocationModal,
        closeLocationModal,
        setOutOfService
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
