import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { index } from "../../services/userService";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await index();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error(error);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  return (
    <main>
      <h1>Welcome, {user.username}</h1>
      <p>
        This is the dashboard page where you can see a list of all the users.
      </p>
      {users.map((user) => (
        <div key={user._id}>{user.username}</div>
      ))}
    </main>
  );
};

export default Dashboard;
