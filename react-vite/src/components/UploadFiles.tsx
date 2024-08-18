import React, { useEffect, useState } from "react";
import { BEE_NODE_URL } from "../constant";
import { IUpload, useUpload } from "../hooks/useUpload";
import MultipleUploadResult from "./MultipleUploadResult";
import SingleUploadResult from "./SingleUploadResult";

type UploadFileState = {} & IUpload;

export const UploadFile = () => {
  const [uploadData, setLoadData] = useState<UploadFileState>({
    files: [],
    postageBatchId: "",
  });

  const [fileSize, setFileSize] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [isMultipleFile, setIsMultipleFile] = useState(false);

  const {
    handleFileUpload,
    uploadResultWithCid,
    error,
    processing,
  } = useUpload();

  useEffect(() => {
    getFileSize();
    return () => {};
  }, [uploadData.files]);

  const handleOnchange = (e: React.FormEvent<HTMLInputElement>): void => {
    const target = e.currentTarget;
    const name = target.name;
    const value = target.value;

    setIsRequired(false);
    setIsMultipleFile(false);

    if (target.type === "file") {
      setLoadData((preState) => ({
        ...preState,
        files: Array.from(target.files as any),
      }));
    } else {
      setLoadData((preState) => ({
        ...preState,
        [name]: value,
      }));
    }
  };

  const handleUpload = async (e: any) => {
    e.preventDefault();

    if (uploadData.files.length == 0 || uploadData.postageBatchId == "") {
      setIsRequired(true);
      return;
    }

    setIsRequired(false);
    setIsMultipleFile(uploadData.files.length > 1);
    await handleFileUpload({
      postageBatchId: uploadData.postageBatchId,
      files: uploadData.files,
    });

    setLoadData({ files: [], postageBatchId: "" });

    // Reset the form
    e.target.reset();
  };

  const getFileSize = () => {
    // Calculate total size
    let numberOfBytes = 0;

    for (const file of uploadData.files) {
      numberOfBytes += file.size;
    }

    // Approximate to the closest prefixed unit
    const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    const exponent = Math.min(
      Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
      units.length - 1
    );
    const approx = numberOfBytes / 1024 ** exponent;

    const size =
      exponent === 0
        ? `${numberOfBytes} bytes`
        : `${approx.toFixed(3)} ${units[exponent]} (${numberOfBytes} bytes)`;

    setFileSize(size);
  };

  return (
    <section>
      <form onSubmit={handleUpload}>
        <div className="flex flex-col space-y-12 bg-slate-200 p-8">
          <h2 className="text-2xl mb-6">Upload a file</h2>

          <div className="flex flex-col sm:items-baseline justify-between">
            <label
              htmlFor="postageBatchId"
              className="text-stone-500 font-bold mb-4"
            >
              Postage ID:
            </label>

            <input
              className="p-4 text-stone-500 border-[1px] w-full"
              placeholder="Enter Postage Batch ID"
              type="text"
              value={uploadData.postageBatchId}
              id="postageBatchId"
              name="postageBatchId"
              onChange={handleOnchange}
              disabled={processing}
            />
            {isRequired && uploadData.postageBatchId === "" && (
              <span className="mt-2 text-red-500">
                Please fill in your Postage stamp ID
              </span>
            )}
          </div>

          <div className="flex flex-col sm:items-baseline justify-between">
            <label htmlFor="fileSelected" className="sr-only">
              Upload File
            </label>
            <input
              className="text-stone-500 file:mr-12 file:py-4 file:w-[50%] file:px-12 file:border-[0.5px]
               file:bg-stone-50 file:text-stone-700 hover:file:cursor-pointer hover:file:bg-yellow-500 hover:file:text-black"
              type="file"
              multiple
              id="fileSelected"
              name="fileSelected"
              onChange={handleOnchange}
              disabled={processing}
            />
            {isRequired && uploadData.files.length === 0 && (
              <span className="mt-2 text-red-500">
                Please one or more files
              </span>
            )}
          </div>
          <button
            type="submit"
            className="text-xl border-2 border-solid bg-gray-600 text-white w-56 hover:bg-yellow-500 hover:cursor-pointer hover:text-black p-2"
            disabled={processing}
          >
            {processing ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {uploadData.files.length > 0 && (
        <div className="space-y-2 my-6 border-spacing-1 border border-zinc-600 p-8">
          <h3 className="text-2xl  mb-6">Upload Summary</h3>
          <div>
            <label htmlFor="fileNum">Selected files:</label>
            <span id="fileNum"> {uploadData.files.length}</span>
          </div>
          <div>
            <label htmlFor="fileSize">Total size:</label>
            <span id="fileSize"> {fileSize}</span>
          </div>
        </div>
      )}

      {error && (
        <>
          <p className="mt-2 text-red-500">{error}</p>
        </>
      )}

      {!isMultipleFile && uploadResultWithCid?.reference && (
        <SingleUploadResult
          link={`${BEE_NODE_URL}/bzz`}
          uploadResultWithCid={uploadResultWithCid!}
        />
      )}

      {isMultipleFile && uploadResultWithCid?.reference && (
        <MultipleUploadResult
          link={`${BEE_NODE_URL}/bzz`}
          uploadResultWithCid={uploadResultWithCid!}
        />
      )}
    </section>
  );
};
