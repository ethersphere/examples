import GetBalance from "./GetBalance";
import { NodeStatus } from "./NodeStatus";
import { useNodeHealth } from "../hooks/useNodeHealth";

function Header() {
  const { nodeHealth } = useNodeHealth();
  return (
    <>
      {nodeHealth?.status == "ok" && (
        <header className="flex flex-row justify-around my-8 p-8">
          <NodeStatus nodeHealth={nodeHealth} />
          <GetBalance nodeHealth={nodeHealth} />
        </header>
      )}
    </>
  );
}

export default Header;
