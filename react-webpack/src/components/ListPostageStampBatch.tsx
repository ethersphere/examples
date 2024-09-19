import { Utils } from "@ethersphere/bee-js";
import React, { useState } from "react";
import { useNodeHealth } from "../hooks/useNodeHealth";
import { usePostageBatch } from "../hooks/usePostageBatch";
import CreatePostageStamp from "./CreatePostageStamp";
import UploadToSwarm from "./UploadToSwarm";

export default function ListPostageStampsBatch() {
  const { getAllPostageError, postageBatches, isLoadingPostageBatch } =
    usePostageBatch();

  const { nodeHealth } = useNodeHealth();

  const [name, setValue] = useState("");
  const [selectedBatchId, setSelectBatchId] = useState("");

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    setValue(value);
    setSelectBatchId(value);
  };

  const toxBZZ = (plur: number) => {
    const amt = Utils.getAmountForTtl(7);
    return (plur / 10 ** 16).toFixed(4);
  };

  return (
    <>
      {nodeHealth?.status === "ok" && (
        <>
          <CreatePostageStamp avaliablePostBatch={postageBatches.length} />
          {getAllPostageError && (
            <div className="row">
              <p className="error">Error fetching Postage stamps!</p>
            </div>
          )}
          {postageBatches && postageBatches.length > 0 && (
            <div className="container">
              <div className="row">
                <h2 style={{ fontSize: "2rem", margin: "24px 0" }}>
                  Available Stamps ({postageBatches?.length})
                </h2>
              </div>

              <ul className="postageStamps" style={{ margin: "24px 0" }}>
                {isLoadingPostageBatch && <li>Loading...</li>}
                {postageBatches &&
                  postageBatches.map((ps, i) => (
                    <li
                      key={i + ps.batchID.toString()}
                      className="postageStamps"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      id={ps.batchID.toString()}
                    >
                      <span className="unit">
                        <label>Label: </label>
                        <span>{ps.label}</span>
                      </span>
                      <span className="unit">
                        <label>BatchID: </label>
                        <span>
                          {ps.batchID.slice(0, 4) +
                            "...." +
                            ps.batchID.slice(-4)}
                        </span>
                      </span>
                      <span className="unit">
                        <label>Depth: </label>
                        <span>{ps.depth}</span>
                      </span>
                      <span className="unit">
                        <label>Amount: </label>
                        <span>{toxBZZ(+ps.amount)}</span>
                        {Utils.getStampCostInBzz(ps.depth, +ps.amount)}
                      </span>
                      <span className="unit">
                        <label>BucketDepth: </label>
                        <span>{ps.bucketDepth}</span>
                      </span>
                      <span className="unit">
                        <label>Usable: </label>
                        <span>{ps.usable ? "Yes" : "No"}</span>
                      </span>
                      <span className="unit">
                        <label>Utilization: </label>
                        <span>{ps.utilization}</span>
                      </span>
                      <span className="unit">
                        <span>Select</span>
                        <label style={{ display: "none" }}>
                          {ps.batchID.toString()}
                        </label>

                        <input
                          value={ps.batchID.toString()}
                          type="radio"
                          checked={true ? ps.batchID.toString() == name : false}
                          name={`radio-${i}`}
                          onChange={handleChange}
                        />
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <UploadToSwarm selectedBatchId={selectedBatchId} />
        </>
      )}
    </>
  );
}
