"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/userService";
import { User } from "@/types";
import {
  Search,
  Mail,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Trash2,
  Edit,
  Users,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    userService
      .getAll()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          `${u.firstName} ${u.lastName} ${u.email}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Remove ${user.firstName} ${user.lastName}?`)) return;
    try {
      await userService.delete(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      toast.success("User removed");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Users</h1>
          <p className="text-zinc-500 text-xs mt-1">
            {users.length} registered accounts
          </p>
        </div>
        {/* Stats */}
        <div className="flex gap-3">
          <div className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-center">
            <p className="text-white font-black text-lg leading-none">
              {users.filter((u) => u.role === "admin").length}
            </p>
            <p className="text-zinc-500 text-[9px] uppercase tracking-widest mt-0.5">Admins</p>
          </div>
          <div className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-center">
            <p className="text-white font-black text-lg leading-none">
              {users.filter((u) => u.role !== "admin").length}
            </p>
            <p className="text-zinc-500 text-[9px] uppercase tracking-widest mt-0.5">Members</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={28} />
                    <p className="text-zinc-600 text-xs mt-3 uppercase tracking-widest">
                      Loading…
                    </p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Users size={36} strokeWidth={1} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">
                      {search ? "No users match your search." : "No users found."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-black shrink-0">
                          {user.firstName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.phoneNumber && (
                            <p className="text-zinc-600 text-xs mt-0.5">{user.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Mail size={12} className="text-zinc-600 shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${user.role === "admin"
                            ? "bg-indigo-500/10 text-indigo-400"
                            : "bg-zinc-800 text-zinc-500"
                          }`}
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck size={10} />
                        ) : (
                          <ShieldOff size={10} />
                        )}
                        {user.role ?? "user"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                        <Calendar size={11} className="text-zinc-600" />
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/users/edit/${user._id}`}
                          className="p-2 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
