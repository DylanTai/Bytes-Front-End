import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCats } from '../services/cats'
import skateboardCat from "../assets/skateboard-cat.webp"

function Cats() {

  const [cats, setCats] = useState([])

  useEffect(() => {
    const fetchCats = async () => {
      const catsData = await getCats()
      setCats(catsData)
    }

    fetchCats()
  }, [])

  if (!cats.length) return <h1 style={{textAlign: "center"}}>Make sure to add some cats!</h1>

  return (
    <div className='cats-root'>
      <h1>Cat List</h1>
      <div className="cats-container">
        {cats.length && cats.map((cat) => (
          <div key={cat.id} className="cat-card">
              <Link to={`/cats/${cat.id}`}>
                <img src={skateboardCat} alt="cat on skateboard" />
              </Link>
              <h2>{cat.name}</h2>
              <p>{cat.breed}</p>
              <p>{cat.description}</p>
            </div>
        ))}
      </div>
    </div>
  )
}

export default Cats