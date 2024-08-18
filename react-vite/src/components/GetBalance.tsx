import { Health } from "@ethersphere/bee-js";
import { useWallet } from "../hooks/useWallet";
import HandleCopy from "./HandleCopy";

type NodeStatusProps = {
  nodeHealth: Health | null | undefined;
};
export default function GetBalance(props: NodeStatusProps) {
  const { balance, error, isLoading } = useWallet();

  const bzzBalance = () => Number(balance?.bzzBalance) / 10 ** 16;
  const nativeTokenBalance = () =>
    Number(balance?.nativeTokenBalance) / 10 ** 18;

  return (
    <div className="">
      {props.nodeHealth?.status === "ok" && (
        <>
          <p>{isLoading && "Loading balance..."}</p>
          <p>{error && "Error loading balance..."}</p>

          {!isLoading && !error && (
            <div className="flex flex-col space-y-1">
              <span className=" font-semibold">
                {bzzBalance().toString().substring(0, 6)} xBzz
              </span>
              <span className=" font-semibold">
                {nativeTokenBalance().toString().substring(0, 6)} xDai
              </span>
              <div className=" font-semibold tooltip">
                {balance?.walletAddress.substring(0, 6)}...
                {balance?.walletAddress.substring(
                  balance?.walletAddress.length - 6
                )}
                <span className=" font-semibold tooltip inline-block">
                  <HandleCopy
                    txt={String(
                      balance?.walletAddress.substring(
                        balance?.walletAddress.length - 6
                      )
                    )}
                  />
                  <span className=" font-semibold tooltip-text">
                    {balance?.walletAddress}
                  </span>
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
