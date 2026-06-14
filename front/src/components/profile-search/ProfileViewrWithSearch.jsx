import { useState, useEffect } from "react";
import axios from "axios";
import ProfileSearchForm from "./ProfileSearchForm.jsx";

const BASE_URL = "https://api.github.com/users";

function ProfileViewrWithSearch() {
  const [username, setUsername] = useState("Hoseinnaqvi");
  const [profile, setProfile] = useState({ data: null, isLoading: true });

  useEffect(
    function fetchUserOnUsernameChange() {
      async function fetchUser() {
        const userResult = await axios.get(`${BASE_URL}/${username}`);
        setProfile({ data: userResult.data, isLoading: false });
      }
      fetchUser();
    },
    [username]
  );

  const search = (username) => {
    setProfile({ data: null, isLoading: true });
    setUsername(username);
  };

  if (profile.isLoading) return <i>Loading...</i>;

  return (
    <div>
      <ProfileSearchForm search={search} />
      <h2>
        <b>{profile.data.name}</b>
      </h2>
      <img src={profile.data.avatar_url} alt="" />
    </div>
  );
}

export default ProfileViewrWithSearch;
