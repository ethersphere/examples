import { Health } from "@ethersphere/bee-js";
import { useEffect, useState } from "react";
import { bee } from "../utils/bee-node";

export const useNodeHealth = () => {
  const [nodeHealth, setNodeHealth] = useState<Health | null>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleIsNodeOnline();
  }, [nodeHealth?.status]);

  const handleIsNodeOnline = async () => {
    try {
      setIsLoading(true);
      const health = await bee.getHealth();

      setNodeHealth(health);
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nodeHealth,
    isLoading,
  };
};
