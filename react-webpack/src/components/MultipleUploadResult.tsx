import { UploadResultWithCid } from "@ethersphere/bee-js";
import React, { useEffect, useState } from "react";
import { useManifest } from "../hooks/useManifest";

type MultipleUploadResultProps = {
  uploadResultWithCid: UploadResultWithCid;
  link: string;
};

export default function MultipleUploadResult(props: MultipleUploadResultProps) {
  const { getHashes } = useManifest();
  const [refHashes, setRefHashes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log(
      "props.uploadResultWithCid.reference: ",
      props.uploadResultWithCid.reference
    );
    getHashes(props.uploadResultWithCid.reference)
      .then((hash) => {
        setIsProcessing(true);
        setRefHashes(hash);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setIsProcessing(false);
      });
  }, [props.uploadResultWithCid]);

  const getHashDetails = () => {
    return Object.keys(refHashes).map((key, i) => (
      <li
        key={i + key}
        style={{
          color: "#3111827",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <span className="font-semibold">
          {i + 1}. {key}:{" "}
        </span>{" "}
        <a
          href={`${props.link}/${props.uploadResultWithCid.reference}/${key}`}
          target="_blank"
          referrerPolicy="same-origin"
        >
          {`${props.link}/${props.uploadResultWithCid.reference}/${key}`}
        </a>
      </li>
    ));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        margin: "12px 0",
        padding: "2rem",
      }}
    >
      {!isProcessing ? (
        <>
          <h2 style={{ fontSize: "2rem", margin: "24px 0" }}>Preview file</h2>
          <ul style={{ padding: "16px 0" }}>{getHashDetails()}</ul>
        </>
      ) : (
        <p
          style={{
            padding: "16px 0",
            color: "#111827",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          Processing manifest...
        </p>
      )}
    </div>
  );
}
