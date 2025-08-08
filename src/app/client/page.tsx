"use client";

import RoleGate from "@/components/RoleGate";
import Projects from "@/modules/projects/Projects";

export default function ClientDashboard() {
  return (
    <RoleGate allowed={["client"]}>
      <h1 className="text-2xl font-semibold mb-4">Client Dashboard</h1>
      <Projects />
    </RoleGate>
  );
}