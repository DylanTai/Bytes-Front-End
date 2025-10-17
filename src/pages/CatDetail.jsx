import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCat, deleteCat, addToyForCat, removeToyFromCat } from "../services/cats.js";
import { getCatFeedings, addCatFeeding } from "../services/feedings.js";
import FeedingsTable from "../components/FeedingsTable.jsx";
import catDetailAvatar from "../assets/cat-detail.png";

function CatDetail() {
  const [catDetail, setCatDetail] = useState(null);
  const [catFeedings, setCatFeedings] = useState([])
  const [toggle, setToggle] = useState(false)

  const [feeding, setFeeding] = useState({
    date: "",
    meal: "Breakfast"
  });

  let { catId } = useParams();
  let navigate = useNavigate()

  useEffect(() => {
    const fetchCat = async () => {
      const catData = await getCat(catId);
      const feedingsData = await getCatFeedings(catId)
      setCatDetail(catData);
      setCatFeedings(feedingsData)
    };

    fetchCat();
  }, [catId, toggle]);

  const handleDelete = async () => {
    await deleteCat(catId)
    navigate('/cats')
  }

  const handleAddToy = async (toyId) => {
    await addToyForCat(catId, toyId)
    setToggle(prev => !prev)
  }

  const handleRemoveToy = async (toyId) => {
    await removeToyFromCat(catId, toyId)
    setToggle(prev => !prev)
  }

  const handleDateAndMealChange = (e) => {
    const { name, value } = e.target

    setFeeding((prevFeeding) => ({
      ...prevFeeding,
      [name]: value
    }))
  };

  const handleFeedingSubmit = async (e) => {
    e.preventDefault()
    
    const mealMap = {
      Breakfast: 'B',
      Lunch: 'L',
      Dinner: 'D'
    };

    const { date, meal } = feeding

    const finalFeeding = {
      date,
      meal: mealMap[meal]
    } // mealMap[meal] Converts "Breakfast" to "B" for django model

    const createdFeeding = await addCatFeeding(catId, finalFeeding)
    
    if (createdFeeding) {
      setToggle(prev => !prev)
    }
  }

  return (
    <div className="cat-detail-root">
      <div className="cat-detail-container">
        <img src={catDetailAvatar} alt="cat avatar" />
        <div>
          <h2>{catDetail?.cat?.name}</h2>
          <p>
            A {catDetail?.cat?.age} year old {catDetail?.cat?.breed} cat
          </p>
          <p>{catDetail?.cat?.description}</p>
          <div>
            <Link to={`/cats/${catDetail?.cat?.id}/edit`}>
              <button className="cat-detail-edit">Edit</button>
            </Link>
            <button className="cat-detail-delete" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
      <div className="cat-detail-bottom-container">
        <div className="feedings-container">
          <h2>Feedings</h2>
          <h3>Add a Feeding</h3>
          {catDetail?.cat?.fed_for_today ?
            <p>{catDetail?.cat?.name} has been fed all their meals today! 🥰</p> : <p>Looks like {catDetail?.cat?.name} is still hungry 😔</p>}
          <form onSubmit={handleFeedingSubmit}>
            <div>  
              <label htmlFor="feeding-date">Feeding Date: </label>
              <input
                type="date"
                name="date"
                id="feeding-date"
                value={feeding.date}
                onChange={handleDateAndMealChange}
              />
            </div>
            <div>
              <label htmlFor="feeding-meal">Meal: </label>
              <select
                name="meal"
                id="feeding-meal"
                value={feeding.meal}
                onChange={handleDateAndMealChange}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
            <button type="submit">Add Feeding</button>
          </form>
          <h3>Past Feedings</h3>
          <FeedingsTable feedings={catFeedings} />
        </div>
        <div className="cat-toys-container">
          <h2>Toys</h2>
          <h3>{catDetail?.cat?.name}'s Toys</h3>
          {catDetail && catDetail.cat.toys.map((toy) => (
            <div key={toy.id} className="cats-personal-owned-toys">
              <div style={{ background: toy?.color }}></div>
              <p>A {toy.color} {toy.name}</p>
              <button onClick={() => handleRemoveToy(toy.id)}>Remove Toy</button>
            </div>
          ))}
          <h3>Available Toys</h3>
          {catDetail && catDetail?.toys_not_associated.map((toy) => (
            <div key={toy.id} className="cats-personal-toys">
              <div style={{ background: toy?.color }}></div>
              <p>A {toy.color} {toy.name}</p>
              <button onClick={() => handleAddToy(toy.id)}>Give Toy</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CatDetail;
