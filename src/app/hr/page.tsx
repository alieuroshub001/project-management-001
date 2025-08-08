"use client";

import RoleGate from "@/components/RoleGate";
import Projects from "@/modules/projects/Projects";

export default function HrDashboard() {
  return (
    <RoleGate allowed={["hr"]}>
      <h1 className="text-2xl font-semibold mb-4">HR Dashboard</h1>
      <Projects />
    </RoleGate>
  );
}