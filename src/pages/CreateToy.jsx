import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { createToy } from '../services/toys.js';
import nerdCat from "../assets/nerd-cat.svg";

function CreateToy() {
  let navigate = useNavigate();

  const [toy, setToy] = useState({
    name: "",
    color: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setToy((prevToy) => ({
      ...prevToy,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createToy(toy);
    navigate("/toys");
  };

  return (
    <div className='create-toy-root'>
      <div className="create-toy-heading">
        <h2>Add a Toy</h2>
        <img src={nerdCat} alt="a cat nerd" />
      </div>
      <form className="create-toy-form" onSubmit={handleSubmit}>
        <input
          className="input-toy-name"
          placeholder="Name"
          name="name"
          value={toy.name}
          onChange={handleChange}
          required
          autoFocus
        />
        <input
          className="input-toy-color"
          placeholder="Color"
          name="color"
          value={toy.color}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default CreateToy