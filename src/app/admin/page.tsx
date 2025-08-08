"use client";

import RoleGate from "@/components/RoleGate";
import Projects from "@/modules/projects/Projects";

export default function AdminDashboard() {
  return (
    <RoleGate allowed={["admin"]}>
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <Projects />
    </RoleGate>
  );
}