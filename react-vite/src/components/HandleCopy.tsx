import { format } from "../utils";

const HandleCopy = ({ txt }: { txt: string }) => {
  const handleClick = async () => {
    try {
      await format.copyText(txt);
      alert("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text!");
    }
  };

  return <span onClick={handleClick}> {format.trimText(txt)}</span>;
};

export default HandleCopy;
