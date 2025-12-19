import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin, openSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      const access = res.data.access;

      console.log("🟢 Login token:", access);

      // Save token
      localStorage.setItem("token", access);

      // Tell App.jsx that login is successful
      onLogin(access);

    } catch (err) {
      console.error("🔴 Login error:", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold text-center mb-4">Login</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="mt-4 space-y-4">
          <input
            className="w-full border dark:border-slate-700 p-2 rounded bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full border dark:border-slate-700 p-2 rounded bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <button
            onClick={openSignup}
            className="text-blue-500 dark:text-blue-300 underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
