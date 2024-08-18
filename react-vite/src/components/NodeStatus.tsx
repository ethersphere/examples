import { Health } from "@ethersphere/bee-js";

type NodeStatusProps = {
  nodeHealth: Health | null | undefined;
};
export function NodeStatus(props: NodeStatusProps) {
  return (
    <div className="connection-status">
      <p>
        <span
          className={props.nodeHealth?.status == "ok" ? "online" : "offline"}
        ></span>
        {props.nodeHealth?.status == "ok" ? "Connected" : "Disconnected"}
      </p>
    </div>
  );
}
