import React, { useState } from "react";
import { useNodeHealth } from "../../hooks/useNodeHealth";
import utils from "../../utils";

export default function BeeNodeUrlSetup() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isRequired, setIsRequird] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateUrl, setUpdateUrl] = useState(false);

  const { healthError, isLoading: loadingHealth, nodeHealth } = useNodeHealth();

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();

    const value = e.currentTarget.value;

    if (value) {
      setIsRequird(false);
      setUrl(value);
    }
  };

  const handleUpdateNodeUrl = () => {
    try {
      if (url === "") {
        setIsRequird(true);
        setUrlError("Enter a Bee node URL");
        return;
      }

      if (!utils.isValidURL(url.trim())) {
        setIsRequird(true);
        setUrlError("Not a valid Bee node URL");
        return;
      }

      setIsSaving(true);

      utils.updateBeeNodeUrl(utils.removeSlashFromUrl(url.trim()));
      setUrl("");
    } catch (err) {
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container bg">
      {loadingHealth && (
        <p style={{ fontSize: "1.2rem", textAlign: "center" }}>Loading...</p>
      )}

      {healthError && (
        <p style={{ textAlign: "center", fontWeight: 500 }}>
          <span className="error" style={{ fontSize: "1.25rem" }}>
            {healthError === "ERR_NETWORK" && "Error with the network: Check if Bee Node is running..."}
          </span>
        </p>
      )}

      {!healthError && nodeHealth?.status === "ok" && (
        <div className="container">
          <div className="row">
            <div
              className="bg"
              style={{
                display: "inline-flex",
                gap: "4px",
                flexDirection: "column",
                margin: "24px 0",
                fontWeight: 500,
                fontSize: "1.12rem",
              }}
            >
              <span>Status: {nodeHealth?.status}</span>
              <span>Api Version: {nodeHealth?.apiVersion}</span>
              <span>Version: {nodeHealth?.version}</span>
              <div>Connected to node via: {utils.getBeeNodeUrl()}</div>
            </div>
          </div>

          <div className="row">
            <div
              style={{
                display: "inline-flex",
                gap: "4px",
                margin: "24px 0",
              }}
            >
              <button
                onClick={() => setUpdateUrl(!updateUrl)}
                style={{ display: `${updateUrl ? "none" : "block"}` }}
              >
                Update Bee Node Url
              </button>
            </div>
          </div>

          {updateUrl && (
            <div className="row">
              <div>
                <h1 style={{ fontSize: "2rem" }}>
                  Update the URL to your Bee Node.
                </h1>
                <p style={{ fontSize: "1.25rem", marginBottom: "24px" }}>
                  (Url would be saved to your browser local storage)
                </p>
              </div>

              <div>
                <label
                  htmlFor="nodeUrl"
                  style={{
                    fontSize: "1.2rem",
                    display: "inline-block",
                    fontWeight: "bolder",
                    marginTop: "24px",
                  }}
                >
                  Bee Node Url
                </label>

                <input
                  onChange={onChange}
                  type="text"
                  name="nodeUrl"
                  id="nodeUrl"
                  height="80px"
                  value={url}
                  placeholder="Enter node url"
                />
              </div>

              <div className="row">
                {isRequired && (
                  <span style={{ fontSize: "1rem" }} className="error">
                    {urlError}
                  </span>
                )}
              </div>
              <div
                className="row"
                style={{ display: "inline-flex", gap: "24px" }}
              >
                <button onClick={handleUpdateNodeUrl}>
                  {isSaving ? "Updating..." : "Update"}
                </button>
                <button onClick={() => setUpdateUrl(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
