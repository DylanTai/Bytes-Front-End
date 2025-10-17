import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCat } from "../services/cats.js";
import nerdCat from "../assets/nerd-cat.svg";

function CreateCat() {
  let navigate = useNavigate();

  const [cat, setCat] = useState({
    name: "",
    breed: "",
    description: "",
    age: 0,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCat((prevCat) => ({
      ...prevCat,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createCat(cat);
    navigate("/cats");
  };

  return (
    <div className="create-cat-root">
      <div className="create-cat-heading">
        <h2>Add a Cat</h2>
        <img src={nerdCat} alt="a cat nerd" />
      </div>
      <form className="create-form" onSubmit={handleSubmit}>
        <input
          className="input-name"
          placeholder="Name"
          name="name"
          value={cat.name}
          onChange={handleChange}
          required
          autoFocus
        />
        <input
          className="input-breed"
          placeholder="Breed"
          name="breed"
          value={cat.breed}
          onChange={handleChange}
          required
        />
        <textarea
          className="input-description"
          placeholder="Description"
          name="description"
          value={cat.description}
          onChange={handleChange}
          required
          rows={5}
        />
        <div className="cat-form-age">
          <label htmlFor="cat-age">
            Please enter your cat's Age (between 0 and 25):
          </label>
          <input
            className="input-age"
            id="cat-age"
            type="number"
            name="age"
            value={cat.age}
            onChange={handleChange}
            min="0"
            max="25"
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreateCat;
