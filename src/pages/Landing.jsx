
import { useEffect, useState } from "react";
import { verifyUser } from "../services/users";
import Recipes from "./Recipes";

export default function Landing() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await verifyUser();
      setUser(u || null);
      setChecked(true);
    })();
  }, []);

  if (!checked) return null;

  if (user) {
    return <Recipes />;
  }

  return (
    <div>
      <h1>Bytes</h1>
      <p>Save, organize, and build your favorite recipes all in one place.</p>
    </div>
  );
}
