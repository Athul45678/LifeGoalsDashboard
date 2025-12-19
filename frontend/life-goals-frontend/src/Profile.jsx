
import { useEffect, useState } from "react";
import axios from "axios";

function Profile({ token }) {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");

  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Load profile
    axios
      .get("http://127.0.0.1:8000/api/profile/")
      .then((res) => {
        setProfile(res.data);
        setBio(res.data.bio || "");
        setUsername(res.data.username || "");
        setNewUsername(res.data.username || "");
        // setPreview(
        //   res.data.avatar
        //     ? `http://127.0.0.1:8000${res.data.avatar}`
        //     : "https://via.placeholder.com/120"
        // );
        setPreview(
  res.data.avatar
    ? (res.data.avatar.startsWith("http")
        ? res.data.avatar
        : `http://127.0.0.1:8000${res.data.avatar}`
      )
    : "https://via.placeholder.com/120"
);

      })
      .catch((err) => console.log("Profile load error:", err));

    // Load stats from goals
    axios
      .get("http://127.0.0.1:8000/api/goals/")
      .then((res) => {
        const goals = res.data;
        const totalGoals = goals.length;
        const completedGoals = goals.filter((g) => (g.progress || 0) >= 100).length;

        const allTasks = goals.flatMap((g) => g.tasks || []);
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t) => t.completed).length;

        setStats({
          totalGoals,
          completedGoals,
          totalTasks,
          completedTasks,
        });
      })
      .catch((err) => console.log("Stats load error:", err));
  }, [token]);

  const handleSaveProfile = () => {
    if (!profile) return;

    const formData = new FormData();
    formData.append("bio", bio);
    if (avatar) formData.append("avatar", avatar);

    axios
      .patch(`http://127.0.0.1:8000/api/profile/${profile.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Profile updated!");
      })
      .catch((err) => console.log("Update error:", err));
  };

  const handleChangeUsername = () => {
    setUsernameMessage("");

    axios
      .post("http://127.0.0.1:8000/api/profile/change-username/", {
        username: newUsername,
      })
      .then((res) => {
        setUsername(res.data.username);
        setUsernameMessage("Username updated successfully");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.error || "Failed to update username";
        setUsernameMessage(msg);
      });
  };

  const handleChangePassword = () => {
    setPasswordMessage("");

    axios
      .post("http://127.0.0.1:8000/api/profile/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      })
      .then(() => {
        setPasswordMessage("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.error || "Failed to change password";
        setPasswordMessage(
          Array.isArray(msg) ? msg.join(", ") : msg
        );
      });
  };

  if (!profile) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-300 mt-10">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-6">

      {/* Stats Row */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Total Goals
          </p>
          <p className="text-2xl font-bold">{stats.totalGoals}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Completed Goals
          </p>
          <p className="text-2xl font-bold">{stats.completedGoals}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Total Tasks
          </p>
          <p className="text-2xl font-bold">{stats.totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Completed Tasks
          </p>
          <p className="text-2xl font-bold">{stats.completedTasks}</p>
        </div>
      </div>

      {/* Main layout: left avatar + right details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Avatar + Basic Info */}
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Profile</h2>

          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover border"
            />

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setAvatar(file);
                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
              className="mt-2 text-sm"
            />

            <p className="mt-2 text-sm">
              <span className="font-semibold">Current Username:</span>{" "}
              {username}
            </p>
          </div>

          <div className="mt-4">
            <label className="text-sm">Bio</label>
            <textarea
              className="w-full border p-2 rounded mt-1 dark:bg-slate-700 dark:border-slate-600"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>

        {/* Right: Username + Password */}
        <div className="space-y-4">
          {/* Username Card */}
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">Update Username</h2>

            <input
              className="w-full border p-2 rounded dark:bg-slate-700 dark:border-slate-600"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />

            <button
              onClick={handleChangeUsername}
              className="mt-3 w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 text-sm"
            >
              Save Username
            </button>

            {usernameMessage && (
              <p className="mt-2 text-xs text-center text-amber-400">
                {usernameMessage}
              </p>
            )}
          </div>

          {/* Password Card */}
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">Change Password</h2>

            <input
              type="password"
              className="w-full border p-2 rounded mb-2 dark:bg-slate-700 dark:border-slate-600"
              placeholder="Current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <input
              type="password"
              className="w-full border p-2 rounded mb-2 dark:bg-slate-700 dark:border-slate-600"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              onClick={handleChangePassword}
              className="mt-1 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm"
            >
              Change Password
            </button>

            {passwordMessage && (
              <p className="mt-2 text-xs text-center text-amber-400">
                {passwordMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

