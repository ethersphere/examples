import {
  BatchId,
  FileUploadOptions,
  Tag,
  UploadRedundancyOptions,
  UploadResultWithCid,
} from "@ethersphere/bee-js";
import { useContext, useState } from "react";
import { BeeContext } from "../context/beeContext";

export interface IUpload {
  postageBatchId: string | BatchId;
  files: File[];
  options: FileUploadOptions & UploadRedundancyOptions;
}

const useUpload = () => {
  const bee = useContext(BeeContext);

  const [uploadResultWithCid, setUploadResultWithCid] =
    useState<UploadResultWithCid>();
  const [tagProgress, setTagProgress] = useState<Tag>();
  const [processing, setIsProcessing] = useState(false);
  const [error, setError] = useState<any>();

  const handleFileUpload = async (args: IUpload) => {
    const opts: Record<string, any> = {
      contentType: args.files[0].type,
      pin: args.options.pin,
      size: args.files[0].size,
      redundancyLevel: args.options.redundancyLevel,
    };

    try {
      let result;
      setIsProcessing(true);

      if (args) {
        if (args.files.length === 1) {
          result = await bee!.uploadFile(
            args.postageBatchId,
            args.files[0],
            args.files[0].name,
            { ...opts }
          );
        }
        if (args.files.length > 1) {
          result = await bee!.uploadFiles(args.postageBatchId, args.files, {
            ...opts,
          });
        }
      }
      setIsProcessing(false);
      setUploadResultWithCid(result);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setError(err);
    }
  };

  const getTagProgress = async () => {
    try {
      if (uploadResultWithCid?.tagUid) {
        setIsProcessing(true);
        const tag = await bee!.retrieveTag(uploadResultWithCid.tagUid);

        setTagProgress(tag);
        setIsProcessing(false);
      }
    } catch (err) {
      setIsProcessing(false);
      setError(err);
    }
  };

  return {
    getTagProgress,
    tagProgress,
    handleFileUpload,
    uploadResultWithCid,
    processing,
    error,
  };
};

export default useUpload;
