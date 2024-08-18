import { UploadResultWithCid } from "@ethersphere/bee-js";

type MultipleUploadResultProps = {
  uploadResultWithCid: UploadResultWithCid;
  link: string;
};

export default function SingleUploadResult(props: MultipleUploadResultProps) {
  return (
    <div className="flex flex-col space-y-2 bg-slate-200 p-8">
      <h2 className="text-2xl mb-6">Preview file</h2>
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
