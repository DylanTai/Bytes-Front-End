import RecipeList from "../RecipeList/RecipeList";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext.jsx";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";
import "./Home.css";

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingAnimation />;
  }

  const { user } = useContext(UserContext);
  if (user) {
    return <RecipeList />;
  }

  return (
    <main className="home-main">
      <h1 className="landing-page-title">Bytes.AI</h1>
      <p>Your Online Recipe Box</p>
    </main>
  );
};

export default Home;
