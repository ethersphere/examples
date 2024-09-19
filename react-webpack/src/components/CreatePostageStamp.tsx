import { Utils } from "@ethersphere/bee-js";
import React, { useEffect, useState } from "react";
import { usePostageBatch } from "../hooks/usePostageBatch";
import utils from "../utils";
import {
  GNOSIS_BLOCKTIME_IN_SECONDS,
  MINIMUM_POSTAGE_STAMPS_DEPTH,
} from "../utils/constant";

type CreatePostageBatch = {
  numOfDays: number | string;
  depth: number | string;
  label?: string;
};

const CreatePostageStamp = (props: { avaliablePostBatch: number }) => {
  const [buyBtn, setBuyBtn] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [stampPrice, setStampPrice] = useState(24000);

  const [postageData, setPostageData] = useState<CreatePostageBatch>({
    numOfDays: "",
    depth: "",
    label: "",
  });

  const {
    newlyCreatedStampId,
    createPostageBatch,
    getAllPostageBatches,
    creatingPostageBatch,
    errorCreatingPostageBatch,
    getAllPostageError,
    isLoadingPostageBatch,
    postageBatches,
    setErrorCreatingPostageBatch,
  } = usePostageBatch();

  useEffect(() => {
    getAllPostageBatches();
  }, [newlyCreatedStampId]);

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLSelectElement>,
    index: number = 0
  ): void => {
    const target = e.currentTarget;
    const name = target.name;
    const value = target.value;

    setPostageData((prevState) => ({ ...prevState, [name]: value }));
  };

  const createPostageStamp = async (e: any) => {
    e.preventDefault();

    if (
      postageData.numOfDays == "" ||
      postageData.label == "" ||
      postageData.depth == "" ||
      Number(postageData.depth) < MINIMUM_POSTAGE_STAMPS_DEPTH ||
      Number(postageData.numOfDays) <= 0
    ) {
      setIsRequired(true);
      return;
    }

    try {
      setIsRequired(false);

      await createPostageBatch({
        amount: estimatedAmountForTTL(),
        depth: Number(postageData.depth),
        options: {
          label: postageData.label,
        },
      });

      setPostageData({
        numOfDays: "",
        depth: "",
        label: "",
      });
    } catch (e: any) {
      console.error(e);
    } finally {
      e.target.reset();
    }
  };

  const estimatedAmountForTTL = () => {
    // Estimating `amount` needed for desired TTL
    const secsPerDay = 24 * 60 * 60;
    const storageTimeInSeconds = Number(postageData.numOfDays) * secsPerDay;

    const amount =
      (stampPrice / GNOSIS_BLOCKTIME_IN_SECONDS) * storageTimeInSeconds;

    return amount;
  };

  return (
    <div className="row " style={{ marginTop: "24px" }}>
      <div className="container bg">
        {props.avaliablePostBatch === 0 && (
          <p
            style={{
              width: "100%",
              background: "rgba(0,0,175,0.12)",
              padding: "8px",
              fontWeight: 600,
              color: "#333",
              marginBottom: "48px",
            }}
          >
            You don't have any Postage Stamp avaliable
          </p>
        )}
        <h2 className="" style={{ fontSize: "2rem", marginBottom: "32px" }}>
          Get Postage Stamp
        </h2>
        {!buyBtn && (
          <button type="submit" onClick={() => setBuyBtn(!buyBtn)}>
            Buy Postage Stamp
          </button>
        )}
      </div>

      {buyBtn && (
        <form onSubmit={createPostageStamp} className="container bg">
          <div className="row">
            <div className="block">
              <div className=" ">
                <label htmlFor="depth">Depth:</label>
                <input
                  type="number"
                  value={postageData["depth"]}
                  id="depth"
                  name="depth"
                  placeholder="Depth size"
                  min={MINIMUM_POSTAGE_STAMPS_DEPTH}
                  onChange={(e) => handleChange(e)}
                />
              </div>
              <span aria-describedby="error">
                {isRequired && postageData.depth == "" && (
                  <span className="error">Please enter a depth size</span>
                )}
                {postageData.depth !== "" &&
                  Number(postageData.depth) < MINIMUM_POSTAGE_STAMPS_DEPTH && (
                    <span className="error">
                      Minimum depth is {MINIMUM_POSTAGE_STAMPS_DEPTH}
                    </span>
                  )}

                {postageData.depth && (
                  <span className="">
                    <h4>Estimated file size:</h4>
                    <p>
                      Theoretical:{" "}
                      {postageData.depth &&
                        utils.UTILIZATION_TABLE(String(postageData.depth))
                          .theoreticalMaxVolume}
                      {/*  
                      {convertBytes(
                        estimateStorageSize().theoreticalStorageVolume
                      )}
                      */}
                    </p>
                    <p>
                      Effective:{" "}
                      {/* {convertBytes(
                        estimateStorageSize().effectiveStorageVolume
                      )} */}
                      {postageData.depth &&
                        utils.UTILIZATION_TABLE(String(postageData.depth))
                          .effectiveVolume}
                    </p>
                  </span>
                )}
              </span>
            </div>

            <div className="block">
              <div>
                <label htmlFor="numOfDays">Duration:</label>
                <input
                  type="number"
                  id="numOfDays"
                  name="numOfDays"
                  min="1"
                  max="365"
                  placeholder="Number of Days"
                  onChange={(e) => handleChange(e)}
                />
              </div>
              <span aria-describedby="error">
                {Number(postageData.numOfDays) != 0 &&
                  postageData.numOfDays && (
                    <span>
                      <span>
                        Estimated cost: {estimatedAmountForTTL()} PLUR
                      </span>
                    </span>
                  )}

                {isRequired && postageData.numOfDays === "" && (
                  <span className="error">Please enter a duration</span>
                )}
                {postageData.numOfDays != "" &&
                  Number(postageData.numOfDays) <= 0 && (
                    <span className="error">Minimium duration is 1</span>
                  )}
              </span>
            </div>
            <div className="block">
              <div className="">
                <label htmlFor="label">Batch Label:</label>
                <input
                  type="text"
                  value={postageData["label"]}
                  id="label"
                  name="label"
                  placeholder="Name of Batch"
                  onChange={(e) => handleChange(e)}
                />
                <span aria-describedby="error">
                  {isRequired && postageData.label === "" && (
                    <span className="error">Please enter a label</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <button
              disabled={creatingPostageBatch}
              style={{
                cursor: `${creatingPostageBatch ? "not-allowed" : "pointer"}`,
              }}
            >
              {creatingPostageBatch ? "Processing..." : "Buy"}
            </button>
            <button
              onClick={() => {
                setIsRequired(false);
                setBuyBtn(!buyBtn);
                setErrorCreatingPostageBatch({ hasError: false, msg: "" });
                setPostageData({
                  numOfDays: "",
                  depth: "",
                  label: "",
                });
              }}
            >
              Cancel
            </button>
          </div>
          {!newlyCreatedStampId && errorCreatingPostageBatch.hasError && (
            <div aria-describedby="error">
              <p className="error">
                <span>Error Creating Postage:</span>
                {JSON.stringify(errorCreatingPostageBatch.msg)}
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CreatePostageStamp;
