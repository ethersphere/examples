import {
  BatchId,
  PostageBatch,
  PostageBatchOptions,
} from "@ethersphere/bee-js";
import { useCallback, useEffect, useState } from "react";
import { bee } from "../utils/bee-node";

export interface BuyPostageBatchArgs {
  amount: number;
  depth: number;
  options?: PostageBatchOptions;
}
export function usePostageBatch() {
  const [postageStamps, setPostageStamps] = useState<PostageBatch[]>();
  const [isLoadingStamps, setIsLoadingStamps] = useState(false);
  const [creatingPostage, setCreatingPostage] = useState(false);
  const [errorCreatingPostage, setErrorCreatingPostage] = useState({
    hasError: false,
    msg: "",
  });
  const [getAllStampError, setGetAllStampError] = useState(false);
  const [newlyCreatedStampId, setNewlyCreatedStampId] = useState<BatchId>();
  const [nodeActive, setNodeActive] = useState(false);

  useEffect(() => {
    nodeIsConnected();
    getAllPostageStamps();

    let timeoutId: NodeJS.Timeout;

    if (getAllStampError) {
      timeoutId = setTimeout(() => {
        setGetAllStampError(false);
      }, 3000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [nodeActive]);

  const nodeIsConnected = async () => {
    if (await bee.isConnected()) {
      setNodeActive(true);
    }
  };

  const getAllPostageStamps = useCallback(async () => {
    try {
      setIsLoadingStamps(true);

      const ps: PostageBatch[] = await bee.getAllPostageBatch();
      setPostageStamps(ps);
    } catch (err) {
      setGetAllStampError(true);
    } finally {
      setGetAllStampError(false);
      setIsLoadingStamps(false);
    }
  }, [postageStamps]);

  /**
   * This function creates a Postage Stamp Batch
   * @param args
   */
  const createPostageBatch = async (args: BuyPostageBatchArgs) => {
    try {

      setCreatingPostage(true);

      const resBatchId = await bee.createPostageBatch(
        BigInt(args.amount).toString(),
        args.depth,

        {
          ...args.options,
        }
      );

      setCreatingPostage(false);
      setNewlyCreatedStampId(resBatchId);
    } catch (err: any) {
      console.error(err);
      setCreatingPostage(false);
      setErrorCreatingPostage({ hasError: true, msg: err });
    }
  };

  return {
    setErrorCreatingPostage,
    getAllStampError,
    getAllPostageStamps,
    postageStamps,
    isLoadingStamps,
    createPostageBatch,
    creatingPostage,
    newlyCreatedStampId,
    errorCreatingPostage,
  };
}
