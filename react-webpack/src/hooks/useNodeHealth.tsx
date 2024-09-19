import { Health } from "@ethersphere/bee-js";
import { useContext, useEffect, useState } from "react";
import { BeeContext } from "../context/beeContext";

export const useNodeHealth = () => {
  const [nodeHealth, setNodeHealth] = useState<Health | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [healthError, setHealthError] = useState("");

  const bee = useContext(BeeContext);

  useEffect(() => {
    handleIsNodeOnline();
  }, [nodeHealth?.status]);

  const handleIsNodeOnline = async () => {
    try {
      setIsLoading(true);
      const health = await bee!.getHealth();      
      setNodeHealth(health);
    } catch (err: any) {
      setHealthError(err.statusText);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    healthError,
    nodeHealth,
    isLoading,
  };
};
