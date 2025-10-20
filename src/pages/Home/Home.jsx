import "./Home.css"

const Home = () => {

  const { user } = useContext(UserContext);
  if (user) {
    return <RecipeList />;
  }

  return (
    <main>
      <h1 className="landing-page-title">Bytes</h1>
      <p>Your Online Recipe Box</p>
    </main>
  );
};

export default Home;

