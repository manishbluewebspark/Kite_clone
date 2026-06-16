// src/pages/Users.tsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/useUserHook";

interface UserRow {
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [rowData, setRowData] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof UserRow>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const { data, isLoading, error } = useUsers();

  useEffect(() => {
    if (data?.users) {
      const formattedData = data.users.map((user: any) => ({
        name: user.name,
        email: user.email,
        phone: user.mobile,
        status: user.status ? "Active" : "Inactive",
        createdAt: user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "-",
      }));
      setRowData(formattedData);
    }
  }, [data]);

  // Sort handler
  const handleSort = (key: keyof UserRow) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Filter + sort
  const filtered = rowData
    .filter((row) =>
      [row.name, row.email, row.phone, row.status]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortKey] ?? "";
      const valB = b[sortKey] ?? "";
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  const columns: { key: keyof UserRow; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
  ];

  const SortIcon = ({ col }: { col: keyof UserRow }) => (
    <span className="ml-1 inline-flex flex-col" style={{ lineHeight: 0 }}>
      <svg
        width="8" height="8" viewBox="0 0 8 8" fill="none"
        style={{ opacity: sortKey === col && sortDir === "asc" ? 1 : 0.3 }}
      >
        <path d="M4 1L7 6H1L4 1Z" fill="currentColor" />
      </svg>
      <svg
        width="8" height="8" viewBox="0 0 8 8" fill="none"
        style={{ opacity: sortKey === col && sortDir === "desc" ? 1 : 0.3, marginTop: 1 }}
      >
        <path d="M4 7L1 2H7L4 7Z" fill="currentColor" />
      </svg>
    </span>
  );

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-gray-300 bg-white text-[12px]">
            <FiSearch size={13} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-[12px] w-44 text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Add User */}
          <button
            onClick={() => navigate("/users/add-users")}
            className="flex items-center gap-1 px-3 py-2 rounded text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={14} />
            Add User
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <p className="text-[12px] py-4 text-gray-600">
          Loading users...
        </p>
      )}
      {error && (
        <p className="text-[12px] py-4 text-red-600">Error loading users</p>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left px-4 py-3 font-medium cursor-pointer select-none whitespace-nowrap text-gray-700 border-b border-gray-300"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <SortIcon col={col.key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-12 text-[12px] text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.email}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.phone}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            row.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer row count */}
          <div className="px-4 py-2 text-xs text-gray-600 border-t border-gray-300 bg-gray-50">
            {filtered.length} of {rowData.length} users
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;