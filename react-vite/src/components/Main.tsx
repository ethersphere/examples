import { useNodeHealth } from "../hooks/useNodeHealth";
import { usePostageBatch } from "../hooks/usePostageBatch";
import { PostageStamps } from "./PostageStamps";
import { UploadFile } from "./UploadFiles";

function Main() {
  const { postageStamps } = usePostageBatch();
  const { nodeHealth } = useNodeHealth();

  return (
    <main className="flex-grow">
      {nodeHealth?.status == "ok" && (
        <>
          <PostageStamps />
          {postageStamps && postageStamps?.length > 0 && <UploadFile />}
        </>
      )}
      {nodeHealth?.status != "ok" && (
        <div className="flex flex-col justify-center items-center ">
          <div className="py-52">
            <p className="text-slate-700 text-2xl text-center"> Oops! Seems your Bee node is not active....</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default Main;
