import { useState, useEffect } from 'react'
import { verifyUser } from './services/users.js'
import Nav from './components/Nav'
import Home from './pages/Home'
import Register from './pages/Register'
import SignOut from './pages/SignOut.jsx'
import Cats from './pages/Cats'
import CatDetail from './pages/CatDetail'
import CreateCat from './pages/CreateCat'
import EditCat from './pages/EditCat'
import Toys from './pages/Toys'
import ToyDetail from './pages/ToyDetail'
import CreateToy from './pages/CreateToy'
import { Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await verifyUser();
      user ? setUser(user) : setUser(null);
    };

    fetchUser();
  }, []);

  return (
    <>
      <Nav user={user} />
      <Routes>
        <Route path="/" element={<Home setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/sign-out" element={<SignOut setUser={setUser} />} />
        <Route path="/cats" element={<Cats />} />
        <Route path="/cats/add" element={<CreateCat />} />
        <Route path="/cats/:catId/edit" element={<EditCat />} />
        <Route path="/cats/:catId" element={<CatDetail />} />
        <Route path="/toys" element={<Toys />} />
        <Route path="/toys/add" element={<CreateToy />} />
        <Route path="/toys/:toyId" element={<ToyDetail />} />
      </Routes>
    </>
  )
}

export default App
