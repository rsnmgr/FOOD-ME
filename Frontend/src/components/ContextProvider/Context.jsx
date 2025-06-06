import { useState, createContext } from 'react';

// Create the LoginContext
export const LoginContext = createContext();

export default function Context({ children }) {
  const [loginData, setLoginData] = useState(""); // Fix the typo here
  return (
    <LoginContext.Provider value={{ loginData, setLoginData }}>
      {children}
    </LoginContext.Provider>
  );
}
