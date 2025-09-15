import { useEffect, useState } from "react";

function App() {
  const [visitor, setVisitor] = useState(null);

  useEffect(() => {
    fetch("http://localhost:2306/") // call your backend
      .then((res) => res.json())
      .then((data) => setVisitor(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Visitor Counter</h1>
      {visitor ? (
        <>
          <p>{visitor.message}</p>
          <p>IP: {visitor.ip}</p>
          <p>Last Visit: {new Date(visitor.lastVisit).toLocaleString()}</p>
        </>
      ) : (
        <p>Loading…</p>
      )}
    </div>
  );
}

export default App;
