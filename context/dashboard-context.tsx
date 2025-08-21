import React, { createContext, useState, useContext } from 'react';

// Create the context
const DashboardContext = createContext({
  needsRefresh: false,
  setNeedsRefresh: (value) => {},
});

// Create a custom hook to easily use the context
export const useDashboard = () => {
  return useContext(DashboardContext);
};

// Create the provider component that will wrap your app
export const DashboardProvider = ({ children }) => {
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const value = {
    needsRefresh,
    setNeedsRefresh,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};