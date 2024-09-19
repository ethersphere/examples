import { UploadResultWithCid } from "@ethersphere/bee-js";
import React from "react";

type MultipleUploadResultProps = {
  uploadResultWithCid: UploadResultWithCid;
  link: string;
};

export default function SingleUploadResult(props: MultipleUploadResultProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        margin: "12px 0",
        padding: "2rem",
      }}
    >
      <h2 style={{ fontSize: "2rem", margin: "24px 0" , lineHeight: '24px'}}>Preview file</h2>
      <p className="truncate hover:text-clip">
        <span className="font-semibold">Reference: </span>
        {props.uploadResultWithCid.reference}
      </p>
      <p className="text-clip overflow-hidden">
        <span className="font-semibold">Tag UID:</span>{" "}
        {props.uploadResultWithCid.tagUid}
      </p>
      <p className="text-gray-900 text-clip overflow-hidden">
        <span className="font-semibold">CID:</span>{" "}
        {props.uploadResultWithCid.cid()}
      </p>
      <p className="text-gray-900 truncate hover:text-clip">
        <span className="font-semibold">Link: </span>{" "}
        <a
          href={`${props.link}/${props.uploadResultWithCid.reference}/`}
          target="_blank"
          referrerPolicy="same-origin"
        >
          {`${props.link}/${props.uploadResultWithCid.reference}/`}
        </a>
      </p>
    </div>
  );
}
