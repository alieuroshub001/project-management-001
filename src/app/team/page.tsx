"use client";

import RoleGate from "@/components/RoleGate";
import Projects from "@/modules/projects/Projects";

export default function TeamDashboard() {
  return (
    <RoleGate allowed={["team"]}>
      <h1 className="text-2xl font-semibold mb-4">Team Dashboard</h1>
      <Projects />
    </RoleGate>
  );
}