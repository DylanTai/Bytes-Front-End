import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getToys } from "../services/toys.js";

function Toys() {
  const [toys, setToys] = useState([]);

  useEffect(() => {
    const fetchToys = async () => {
      const toysData = await getToys();
      setToys(toysData);
    };

    fetchToys();
  }, []);

  if (!toys.length) return <h1>loading...</h1>

  return (
    <div className="toys-root">
      <h2>All Cat Toys</h2>
      <div className="toys-container">
        {toys.length &&
          toys.map((toy) => (
            <Link key={toy.id} to={`/toys/${toy.id}`}>
              <div className="toy" style={{ background: toy.color }}>
                <h3>{toy.name}</h3>
                <p>A {toy.color} toy</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default Toys;
