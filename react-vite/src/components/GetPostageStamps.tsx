import { useState } from "react";
import { usePostageBatch } from "../hooks/usePostageBatch";
import HandleCopy from "./HandleCopy";

export function GetPostageStamps() {
  const { postageStamps, getAllStampError, isLoadingStamps } =
    usePostageBatch();

  const [showStamps, setShowStamp] = useState(false);

  const handleViewPostageStamps = () => {
    setShowStamp(!showStamps);
  };

  return (
    <div>
      <section className="px-8">
        {getAllStampError && (
          <p className="text-red-500 py-4">Error fetching Postage stamps!</p>
        )}
      </section>
      <section>
        <div className="bg-slate-200 mb-8">
          {postageStamps && postageStamps.length > 0 && (
            <div
              className="flex justify-between mb-1 p-8 hover:cursor-pointer"
              onClick={handleViewPostageStamps}
            >
              <h3 className="font-semibold text-black">
                Available Stamps ({postageStamps?.length})
              </h3>
              <span className="animate-arrow">▼</span>
            </div>
          )}

          {showStamps && (
            <ul className="bg-slate-50 p-8">
              {isLoadingStamps && (
                <li className="p-8 bg-slate-400">Loading...</li>
              )}

              {postageStamps &&
                postageStamps.map((ps) => (
                  <li
                    key={ps.batchID}
                    className="flex flex-col mb-12 space-y-2 divide-y divide-slate-300 border-b-4 pb-4"
                  >
                    <p className="flex justify-between hover:cursor-pointer ">
                      <span className="text-gray-500 font-semibold text-ellipsis">
                        Batch ID:
                      </span>
                      <span className="tooltip inline-block">
                        <HandleCopy txt={ps.batchID} />
                        <span className="tooltip-text">{ps.batchID}</span>
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Label:
                      </span>{" "}
                      {ps.label}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Block Number:
                      </span>{" "}
                      {ps.blockNumber}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Amount:
                      </span>{" "}
                      {ps.amount}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        BucketDepth:
                      </span>{" "}
                      {ps.bucketDepth}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Utilization:
                      </span>{" "}
                      {ps.utilization}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Exists:
                      </span>{" "}
                      {ps.exists ? "Yes" : "No"}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Depth:
                      </span>{" "}
                      {ps.depth}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Immutable Flag:
                      </span>{" "}
                      {ps.immutableFlag}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        Usable:
                      </span>{" "}
                      {ps.usable ? "Yes" : "No"}
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 font-semibold">
                        {" "}
                        BatchTTL:
                      </span>{" "}
                      {ps.batchTTL}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>

      {postageStamps && postageStamps?.length === 0 && (
        <section className="flex flex-col p-8 bg-slate-200 text-slate-600 text-lg">
          <p>You don't have any Postage Stamp</p>
        </section>
      )}
    </div>
  );
}
