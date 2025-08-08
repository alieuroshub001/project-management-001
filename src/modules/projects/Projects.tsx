"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export default function Projects() {
  const supabase = getSupabaseClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false });
    setError(error?.message || null);
    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("projects").insert({ name, description: description || null });
    if (error) return setError(error.message);
    setName("");
    setDescription("");
    load();
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return setError(error.message);
    load();
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={addProject} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="border px-3 py-2 rounded w-full" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="border px-3 py-2 rounded w-full" />
        </div>
        <button type="submit" className="border px-3 py-2 rounded">Add</button>
      </form>

      {loading ? (
        <div>Loading projects...</div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <ul className="grid gap-2">
          {projects.map((p) => (
            <li key={p.id} className="border rounded p-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{p.name}</div>
                {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
                <div className="text-xs text-gray-500 mt-1">{new Date(p.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => deleteProject(p.id)} className="text-sm text-red-600">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}