import {
  BatchId,
  PostageBatch,
  PostageBatchOptions,
} from "@ethersphere/bee-js";
import { useCallback, useContext, useEffect, useState } from "react";
import { BeeContext } from "../context/beeContext";

export interface BuyPostageBatchArgs {
  amount: number;
  depth: number;
  options?: PostageBatchOptions;
}

export function usePostageBatch() {
  const bee = useContext(BeeContext);

  const [postageBatches, setPostageBatch] = useState<PostageBatch[]>([]);
  const [isLoadingPostageBatch, setIsLoadingStamps] = useState(false);
  const [creatingPostageBatch, setCreatingPostageBatch] = useState(false);
  const [errorCreatingPostageBatch, setErrorCreatingPostageBatch] = useState({
    hasError: false,
    msg: "",
  });
  const [getAllPostageError, setGetAllPostageError] = useState(false);
  const [newlyCreatedStampId, setNewlyCreatedStampId] = useState<BatchId>();
  const [nodeActive, setNodeActive] = useState(false);

  useEffect(() => {
    nodeIsConnected();
    getAllPostageBatches();

    let timeoutId: NodeJS.Timeout;
    if (getAllPostageError) {
      timeoutId = setTimeout(() => {
        setGetAllPostageError(false);
      }, 3000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [nodeActive]);

  const nodeIsConnected = async () => {
    if (bee) {
      const conn = await bee.isConnected();
      setNodeActive(conn);
    }
  };

  const getAllPostageBatches = useCallback(async () => {
    try {
      setIsLoadingStamps(true);

      const ps: PostageBatch[] = await bee!.getAllPostageBatch();
      setPostageBatch(ps);
    } catch (err) {
      setGetAllPostageError(true);
    } finally {
      setGetAllPostageError(false);
      setIsLoadingStamps(false);
    }
  }, [postageBatches]);

  /**
   * This function creates a Postage Stamp Batch
   * @param args
   */
  const createPostageBatch = async (args: BuyPostageBatchArgs) => {
    try {
      setCreatingPostageBatch(true);

      const resBatchId = await bee!.createPostageBatch(
        BigInt(args.amount).toString(),
        args.depth,

        {
          ...args.options,
        }
      );

      setCreatingPostageBatch(false);
      setNewlyCreatedStampId(resBatchId);
    } catch (err: any) {
      console.error(err);
      setCreatingPostageBatch(false);
      setErrorCreatingPostageBatch({ hasError: true, msg: err });
    }
  };

  return {
    setErrorCreatingPostageBatch,
    getAllPostageBatches,
    createPostageBatch,
    getAllPostageError,
    postageBatches,
    isLoadingPostageBatch,
    creatingPostageBatch,
    newlyCreatedStampId,
    errorCreatingPostageBatch,
  };
}
