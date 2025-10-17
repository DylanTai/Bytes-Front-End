
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRecipe } from "../services/recipes";

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", notes: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const created = await createRecipe(form);
    navigate(`/recipes/${created.id || created._id}`);
  };

  return (
    <div>
      <h1>New Recipe</h1>
      <form onSubmit={handleSubmit}>
        <label>Title: <input name="title" value={form.title} onChange={handleChange} required /></label>
        <br />
        <label>Notes: <textarea name="notes" value={form.notes} onChange={handleChange} /></label>
        <br />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
