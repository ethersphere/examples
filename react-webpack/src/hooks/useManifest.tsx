import { ManifestJs } from "@ethersphere/manifest-js";
import { useContext } from "react";
import { BeeContext } from "../context/beeContext";

export function useManifest() {
  const bee = useContext(BeeContext);
  const manifestJs = new ManifestJs(bee!);

  const isManifest = async (hash: string) => {
    return manifestJs.isManifest(hash);
  };

  const getHashes = async (hash: string) => {
    return await manifestJs.getHashes(hash);
  };

  const getIndexDocumentPath = async (hash: string) => {
    return await manifestJs.getIndexDocumentPath(hash);
  };

  return { isManifest, getHashes, getIndexDocumentPath };
}
