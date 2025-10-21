import RecipeList from "../RecipeList/RecipeList";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext.jsx";
import "./Home.css"

const Home = () => {

  const { user } = useContext(UserContext);
  if (user) {
    return <RecipeList />;
  }

  return (
    <main>
      <h1 className="landing-page-title">Bytes.AI</h1>
      <p>Your Online Recipe Box</p>
    </main>
  );
};

export default Home;

