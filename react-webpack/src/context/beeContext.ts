import { Bee } from "@ethersphere/bee-js";
import { createContext } from "react";

export const BeeContext = createContext<Bee | undefined>(undefined);
