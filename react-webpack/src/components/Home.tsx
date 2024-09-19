import React from "react";
import { useNodeHealth } from "../hooks/useNodeHealth";
import BeeNodeUrlSetup from "./BeeNodeUrlSetup/BeeNodeUrlSetup";
import ListPostageStampsBatch from "./ListPostageStampBatch";

export default function Home() {
  const date = new Date();
  const { healthError } = useNodeHealth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <header>
        <BeeNodeUrlSetup />
      </header>
      <main>
        <ListPostageStampsBatch />
      </main>
      {!healthError && (
        <footer style={{ textAlign: "center", margin: "12px 0" }}>
          &copy; {date.getFullYear()}
        </footer>
      )}
    </div>
  );
}
