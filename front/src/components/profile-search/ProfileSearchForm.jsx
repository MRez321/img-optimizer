import { useState } from "react";

function ProfileSearchForm({ search }) {
  const [term, setTerm] = useState("");

  const handleChange = (evt) => {
    setTerm(evt.target.value);
  };
  const handleSubmit = (evt) => {
    evt.preventDefault();
    search(term);
    setTerm("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={term} onChange={handleChange} type="text" />
      <br />
      <button>Search!</button>
    </form>
  );
}

export default ProfileSearchForm;
