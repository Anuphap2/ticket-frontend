"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/userService";
import { User } from "@/types";
import { Card, Input, Button } from "@/components/ui";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  SearchX,
  Loader2,
  XCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const result = users.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(result);
  }, [searchTerm, users]);

  const handleDelete = async (id: string) => {
    const user = users.find((u) => u._id === id);
    if (
      user &&
      confirm(
        `Are you sure you want to remove ${user.firstName} ${user.lastName}?`,
      )
    ) {
      try {
        await userService.delete(id);
        setUsers(users.filter((user) => user._id !== id));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-zinc-50/50 min-h-screen antialiased">
      {/* 🎯 Header Section: Bold & Italic Style */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-zinc-900 tracking-tighter italic uppercase">
            User Network
          </h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Access Control & Account Hierarchy
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-full md:w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
              size={16}
            />
            <Input
              placeholder="SEARCH IDENTITY..."
              className="pl-11 h-12 bg-white border-zinc-200 rounded-2xl font-bold text-[11px] uppercase tracking-widest focus:ring-0 focus:border-zinc-900 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all"
            >
              <XCircle size={20} />
            </button>
          )}
        </div>
      </header>

      {/* 🎯 Stats Mini Card */}
      <div className="w-fit bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2 px-4 py-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          System Population:
        </span>
        <span className="text-sm font-black text-zinc-900 italic underline decoration-zinc-200 underline-offset-4">
          {users.length} Users
        </span>
      </div>

      {/* 🎯 Main Table: Clean & High Contrast */}
      <Card className="border-none shadow-[0_30px_100px_rgba(0,0,0,0.04)] overflow-hidden rounded-[2.5rem] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Identity Details
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Comms Channel
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">
                  Hierarchy
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Registry Date
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="group hover:bg-zinc-50/50 transition-all cursor-default"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-lg font-black text-zinc-900 tracking-tight uppercase italic leading-none group-hover:text-indigo-600 transition-colors">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                          <span className="h-1 w-1 bg-zinc-200 rounded-full"></span>
                          Node: {user._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-zinc-600 flex items-center gap-2">
                        <Mail size={12} className="text-zinc-300" />
                        {user.email}
                      </div>
                      <div className="text-[10px] font-medium text-zinc-400 flex items-center gap-2">
                        <Phone size={11} className="text-zinc-200" />
                        {user.phone || "---"}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Badge
                      className={
                        user.role === "admin"
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }
                    >
                      {user.role === "admin" && (
                        <ShieldCheck
                          size={10}
                          className="mr-1 inline text-indigo-400"
                        />
                      )}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[11px] font-black text-zinc-500 flex items-center gap-2">
                      <Calendar size={12} className="text-zinc-300" />
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td
                    className="px-8 py-6 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end items-center gap-2">
                      {/* 🎯 ปุ่มแก้ไข (Edit) สไตล์ Zinc/Black High Contrast */}
                      <Link href={`/admin/users/edit/${user._id}`}>
                       
                          <Edit
                            size={16}
                            className="text-zinc-600 group-hover/edit:text-white transition-colors"
                          />
                      </Link>

                      {/* 🎯 ปุ่มลบ (Delete) สไตล์ Rose High Contrast */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all duration-300 group/delete"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to remove ${user.firstName}?`,
                            )
                          ) {
                            handleDelete(user._id);
                          }
                        }}
                        title="Delete User"
                      >
                        <Trash2
                          size={16}
                          className="text-rose-500 group-hover/delete:text-white transition-colors"
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center bg-zinc-50/20">
              <SearchX
                size={48}
                className="text-zinc-200 mb-4"
                strokeWidth={1}
              />
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                Zero Matches Found In Database
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// 🎯 Reusable Styled Components เพื่อคุมโทนให้เหมือนหน้า Dashboard
function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-[0.15em] py-1.5 px-4 rounded-xl inline-flex items-center shadow-sm border border-zinc-100/50 ${className}`}
    >
      {children}
    </span>
  );
}
