import { Bee } from "@ethersphere/bee-js";
import React, { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home";
import { BeeContext } from "./context/beeContext";
import utils from "./utils";

export default function App() {
  const [bee, setBee] = useState<Bee>();
  const [cnxError, setCnxError] = useState("");
  const [nodeIsConfigured, setNodeIsConfigured] = useState(false);
  const [nodeUrl, setNodeUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    try {
      const url = utils.getBeeNodeUrl();
      setBee(new Bee(url));
      setNodeIsConfigured(true);
    } catch (err: any) {
      console.error(err);
      setNodeIsConfigured(false);
    }
  }, [nodeUrl]);

  useEffect(() => {
    bee
      ?.checkConnection()
      .then(() => {
        setAlive(true);
      })
      .catch((err) => {
        console.error(err);
        setCnxError(err);
      });
  }, [bee, alive]);

  const handleSaveToLocalhost = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    setSavingUrl(true);
    utils.setBeeNodeUrl(nodeUrl);

    setSavingUrl(false);
    setNodeUrl("");
  };

  return (
    <>
      {bee && (
        <BeeContext.Provider value={bee}>
          <Home />
        </BeeContext.Provider>
      )}

      {!nodeIsConfigured && bee === undefined && (
        <div className="app-container">
          <div className="app-container-chaid">
            <h1>Set up URL to Bee Node</h1>
            <p>
              The URL is used to connect to an active Bee Node and would be
              saved to your browser local storage.
            </p>
            <form>
              <input
                type="text"
                id="beeNodeUrl"
                placeholder="Enter Bee Node URL"
                onChange={(e) => setNodeUrl(e.target.value)}
              />
              <button
                style={{
                  width: "100%",
                  fontSize: 20,
                  cursor: `${nodeUrl === "" ? "not-allowed" : "pointer"}`,
                }}
                disabled={nodeUrl === ""}
                onClick={handleSaveToLocalhost}
              >
                {savingUrl ? "Saving..." : "Save"}
              </button>
            </form>

            {cnxError && (
              <p
                style={{
                  color: "tomato",
                  fontWeight: 600,
                  backgroundColor: "rgba(255,0,0,0.08)",
                  padding: "8px",
                }}
              >
                {String(cnxError).split(":")[1]}: There is no live Bee node on
                the given URL!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
