import { useNodeHealth } from "../hooks/useNodeHealth";

export function Footer() {
  const { nodeHealth } = useNodeHealth();
  const date = new Date();

  return (
    <>
      {nodeHealth?.status === "ok" && (
        <footer className="flex justify-center text-gray-600">
          <p>&copy; {date.getFullYear()}</p>
        </footer>
      )}
    </>
  );
}
