import { createContext, useState } from "react";

const UserContext = createContext();

const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const user = JSON.parse(atob(token.split(".")[1])).payload;
    return user;
  }
  return null;
};

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(getUserFromToken());

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
