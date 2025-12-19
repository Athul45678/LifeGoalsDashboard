
import React, { useState } from "react";
import axios from "axios";

function Signup({ onSignupSuccess, openLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    axios
      .post("http://127.0.0.1:8000/api/signup/", {
        username,
        password,
      })
      .then(() => {
        setError("");
        onSignupSuccess(); // Switch to Login
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data.error || "Signup failed");
        } else {
          setError("Something went wrong");
        }
      });
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold text-center mb-4">Create Account</h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleSignup} className="mt-4 space-y-4">
          <input
            className="w-full border dark:border-slate-700 p-2 rounded bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Choose Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full border dark:border-slate-700 p-2 rounded bg-white dark:bg-slate-700 dark:text-white"
            placeholder="Choose Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <button
            className="text-blue-500 dark:text-blue-300 underline"
            onClick={onSignupSuccess}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
