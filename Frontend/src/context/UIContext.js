import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [showDropdowns, setShowDropdowns] = useState(() => {
    const saved = localStorage.getItem('showDropdowns');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('showDropdowns', JSON.stringify(showDropdowns));
  }, [showDropdowns]);

  const toggleDropdowns = () => {
    setShowDropdowns(prev => !prev);
  };

  return (
    <UIContext.Provider value={{ showDropdowns, toggleDropdowns }}>
      {children}
    </UIContext.Provider>
  );
};