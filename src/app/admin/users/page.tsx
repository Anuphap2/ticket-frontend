"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/userService";
import { User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Trash2,
  Edit,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    userService
      .getAll()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const handleDelete = async (user: User) => {
    if (currentUser?._id === user._id) {
      toast.error("You cannot delete your own account");
      return;
    }

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
    <div className="p-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {users.length} registered accounts in system
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">
              {users.filter((u) => u.role === "admin").length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 mt-1">
              Admins
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-800">
              {users.filter((u) => u.role !== "admin").length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 mt-1">
              Members
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr className="text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5 text-center">Role</th>
                <th className="px-8 py-5">Joined</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2
                      className="animate-spin text-indigo-500 mx-auto"
                      size={32}
                    />
                    <p className="text-gray-400 text-xs mt-4 uppercase tracking-widest">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Users
                      size={42}
                      strokeWidth={1}
                      className="text-gray-300 mx-auto mb-4"
                    />
                    <p className="text-gray-500 text-sm">
                      {search
                        ? "No matching users found."
                        : "No users in system."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* User */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-semibold">
                          {user.firstName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.phoneNumber && (
                            <p className="text-gray-500 text-xs mt-1">
                              {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-8 py-6 text-gray-600 text-sm">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`inline-flex items-center gap-2 text-[11px] font-semibold px-3 py-1 rounded-full ${
                          user.role === "admin"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <ShieldOff size={12} />
                        )}
                        {user.role ?? "user"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-8 py-6 text-gray-500 text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/edit/${user._id}`}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-all"
                        >
                          <Edit size={16} />
                        </Link>

                        <button
                          disabled={currentUser?._id === user._id}
                          onClick={() => handleDelete(user)}
                          className={`p-2 rounded-lg border transition-all ${
                            currentUser?._id === user._id
                              ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                              : "border-gray-200 hover:bg-rose-50 text-gray-600 hover:text-rose-600"
                          }`}
                        >
                          <Trash2 size={16} />
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
