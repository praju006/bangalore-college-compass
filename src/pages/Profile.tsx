import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`http://localhost:5000/api/profile/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const [recommended, setRecommended] = useState([]);
  useEffect(() => {
  fetch(`http://localhost:5000/api/profile/recommend/${userId}`)
    .then(res => res.json())
    .then(data => setRecommended(data));
}, []);

<h3>Recommended Colleges</h3>
{recommended.map(college => (
  <div key={college._id}>
    <p>{college.name}</p>
    <p>{college.rating}</p>
  </div>
))}

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>Saved Colleges</h3>

      {user.savedColleges.map(college => (
        <div key={college._id}>
          <p>{college.name}</p>
          <p>{college.city}</p>
        </div>
      ))}
    </div>
  );
}