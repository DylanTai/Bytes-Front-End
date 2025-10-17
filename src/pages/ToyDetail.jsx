import { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { getToy, deleteToy } from "../services/toys.js";

function ToyDetail() {
  const [toyDetail, setToyDetail] = useState({});

  let { toyId } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    const fetchToy = async () => {
      const toyData = await getToy(toyId);
      setToyDetail(toyData);
    };

    fetchToy();
  }, [toyId]);

  const handleToyDelete = async () => {
    await deleteToy(toyId)
    navigate("/toys")
  }

  return (
    <div className='toy-root-container'>
      <div className="toy" style={{ background: toyDetail.color }}>
        <h3>{toyDetail.name}</h3>
        <p>A {toyDetail.color} toy</p>
      </div>
      <div>
        <button className="toy-detail-edit">Edit</button>
        <button className="toy-detail-delete" onClick={handleToyDelete}>Delete</button>
      </div>
    </div>
  )
}

export default ToyDetail