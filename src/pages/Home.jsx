
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../services/users";

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", isError: false, errorMsg: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSignIn = async (e) => {
    e.preventDefault();
    try {
      await signIn({ username: form.username, password: form.password });
      navigate("/");
    } catch (error) {
      setForm(f => ({ ...f, isError: true, errorMsg: "Invalid Credentials" }));
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={onSignIn}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        {form.isError && <div>{form.errorMsg}</div>}
        <button type="submit">Sign In</button>
      </form>
      <Link to="/register">No account? Sign up here!</Link>
    </div>
  );
}
