import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  const myEffect = () => {
    console.log("my effect was called");
  };
  useEffect(myEffect, [count]);

  const increment = () => {
    setCount((c) => c + 1);
  };

  const handleChange = (event) => {
    setName(event.target.value);
  };

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={increment}>+1</button>
      <hr />
      <p>{name}</p>
      <input value={name} onChange={handleChange} type="text" />
    </div>
  );
}

export default Counter;
