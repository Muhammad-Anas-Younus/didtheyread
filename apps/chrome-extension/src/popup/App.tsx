import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>();

  const getUserInfo = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:3000/api/auth/whoami", {
      credentials: "include",
    });
    const data = await res.json();
    if (data?.user) {
      setUser(data?.user);
    }
    setLoading(false);
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Did They Read?</h1>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>User: {user?.email}</div>
      ) : (
        <a target="_blank" href="http://localhost:3000/login">
          <button>Login</button>
        </a>
      )}
    </div>
  );
}
