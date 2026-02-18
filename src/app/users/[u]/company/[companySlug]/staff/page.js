"use client"
import { useState,useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { Plus,X, UserPlus,ChevronDown,Users,ArrowLeft, Shield, ClipboardList,Pencil, PlusCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Your custom tab system
import { motion, AnimatePresence } from "framer-motion"; 
import Link from 'next/link'

export default function StaffManagementPage() {

   const params = useParams()
   const {u, companySlug} = params


  return (
    <div className="w-full min-h-screen font-WixMade pt-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-6">
        <h1 className="text-base font-semibold text-gray-800">Staff Management</h1>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Link href={`/users/${u}/company/${companySlug}/staff/new`}>
                <Button className="bg-army hover:bg-army/90 text-white text-xs h-7 px-3 py-2 rounded-md flex items-center gap-1">
                    <UserPlus className="h-3.5 w-3.5" /> Add New Staff
                </Button>
            </Link>
        </div>
      </div>

      {/* Tabs Wrapper */}
      <Tabs defaultValue="directory" className="w-full">
        {/* Tabs Header */}
        <TabsList className="flex border-b text-xs font-medium text-gray-600 space-x-4">
          <TabsTrigger
            value="directory"
            className="flex text-xs items-center cursor-pointer gap-1 pb-1 data-[state=active]:border-b-2 data-[state=active]:border-core data-[state=active]:text-neutral-900 transition-all"
          >
            <Users className="size-3" />
            Staff Directory
          </TabsTrigger>

          <TabsTrigger
            value="roles"
            className="flex text-xs items-center cursor-pointer gap-1 pb-1 data-[state=active]:border-b-2 data-[state=active]:border-core data-[state=active]:text-neutral-900 transition-all"
          >
            <Shield className="size-3" />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="directory">
          <StaffDirectory />
        </TabsContent>

        {/* <TabsContent value="onboarding">
          <StaffOnboarding />
        </TabsContent> */}

        <TabsContent value="roles">
          <RoleGroupingsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Staff Directory Section                        */
/* -------------------------------------------------------------------------- */

function StaffDirectory() {
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [staffList, setStaffList] = useState([
    { name: "Jane Doe", email: "jane@company.com", role: "Supervisor", status: "Active" },
    { name: "John Smith", email: "john@company.com", role: "Staff", status: "Suspended" },
    { name: "Will Kane", email: "will@company.com", role: "Staff", status: "Inactive" },
  ]);

  const [roles] = useState(["Staff", "Second Supervisor", "Main Supervisor", "Supervisor"]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const handleRoleChange = (event) => {
    setSelectedStaff({ ...selectedStaff, role: event.target.value });
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStaff({ ...selectedStaff, status: newStatus });
    setStatusDropdownOpen(false);
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-gray-200 text-gray-700";
      case "Suspended":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="bg-white pt-2 mt-2 font-WixMade text-xs relative overflow-hidden">
      <h2 className="text-sm px-2 font-semibold mb-3">Staff Directory</h2>

      <AnimatePresence mode="wait">
        {!selectedStaff ? (
          // ------------------------- Staff Table View -------------------------
          <motion.div
            key="staffTable"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <table className="w-full border-collapse text-xs">
              <thead className="text-left bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <td className="p-3">{staff.name}</td>
                    <td className="p-3">{staff.email}</td>
                    <td className="p-3">{staff.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusClasses(
                          staff.status
                        )}`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <button className="text-blue-600 hover:underline">Edit</button>
                      <button className="text-gray-500 hover:text-gray-700">Suspend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          // ------------------------- Staff Detail View -------------------------
          <motion.div
            key="staffDetails"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="p-1"
          >
            <Card className="shadow-xs rounded-sm">
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:bg-gray-100"
                    onClick={() => setSelectedStaff(null)}
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <CardTitle className="text-base font-semibold">
                    {selectedStaff.name}'s Information
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xs text-gray-600 mb-1">Full Name</h3>
                  <p className="font-medium">{selectedStaff.name}</p>
                </div>

                <div>
                  <h3 className="text-xs text-gray-600 mb-1">Email Address</h3>
                  <p className="font-medium">{selectedStaff.email}</p>
                </div>

                {/* -------- Status Section with Dropdown -------- */}
                <div className="relative">
                  <h3 className="text-xs text-gray-600 mb-1">Status</h3>
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${getStatusClasses(
                      selectedStaff.status
                    )}`}
                  >
                    {selectedStaff.status}
                    <ChevronDown size={12} className="ml-1" />
                  </button>

                  <AnimatePresence>
                    {statusDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute mt-1 bg-white shadow-md rounded-lg border border-gray-100 w-28 z-10"
                      >
                        {["Active", "Inactive", "Suspended"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`block w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 ${
                              selectedStaff.status === status
                                ? "font-semibold"
                                : "font-normal"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* -------- Change Role Section -------- */}
                <div className="border-t pt-3">
                  <h3 className="text-xs text-gray-600 mb-1">Role Grouping</h3>
                  <select
                    className="border rounded p-2 text-xs w-48"
                    value={selectedStaff.role}
                    onChange={handleRoleChange}
                  >
                    {roles.map((role, idx) => (
                      <option key={idx} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* -------- Optional Editable Fields -------- */}
                <div className="mt-4">
                  <h3 className="text-xs text-gray-600 mb-1">Update Staff Info</h3>
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Update name" className="text-xs w-48" />
                    <Input placeholder="Update email" className="text-xs w-48" />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => setSelectedStaff(null)}
                  >
                    Cancel
                  </Button>
                  <Button className="text-xs h-7 bg-core hover:bg-core/90">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Onboarding Section                             */
/* -------------------------------------------------------------------------- */

function StaffOnboarding() {
  return (
    <div className="bg-white mx-auto shadow-sm rounded-lg p-5 max-w-md mt-5">
      <h2 className="text-base font-semibold mb-3">Onboard New Staff</h2>

      <form className="flex flex-col gap-3 text-xs">
        <div>
          <label className="block mb-1 text-gray-600">Full Name</label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600">Email</label>
          <input
            type="email"
            placeholder="e.g. john@company.com"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600">Phone</label>
          <input
            type="tel"
            placeholder="+234 812 345 6789"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600">Role</label>
          <select className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>Supervisor</option>
            <option>Lower Supervisor</option>
            <option>Staff</option>
            <option>Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-md"
        >
          Send Invite
        </button>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Roles & Permissions Section                         */
/* -------------------------------------------------------------------------- */

function RoleGroupingsTable() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [newGrouping, setNewGrouping] = useState("");

  const [roleGroupings, setRoleGroupings] = useState([
    {
      name: "Supervisor",
      permissions: { sales: true, inventory: true, purchases: true, logistics: true },
    },
    {
      name: "Main Supervisor",
      permissions: { sales: true, inventory: true, purchases: false, logistics: false },
    },
    {
      name: "Second Supervisor",
      permissions: { sales: true, inventory: false, purchases: false, logistics: false },
    },
    {
      name: "Staff",
      permissions: { sales: false, inventory: false, purchases: false, logistics: false },
    },
  ]);

  // 👇 dynamic modules list
  const modules = ["Sales", "Inventory", "Purchases", "Logistics"];

  const togglePermission = (roleIndex, moduleKey) => {
    const updated = [...roleGroupings];
    updated[roleIndex].permissions[moduleKey.toLowerCase()] =
      !updated[roleIndex].permissions[moduleKey.toLowerCase()];
    setRoleGroupings(updated);
  };

  const addGrouping = () => {
    if (!newGrouping.trim()) return;
    setRoleGroupings([
      ...roleGroupings,
      {
        name: newGrouping,
        permissions: Object.fromEntries(
          modules.map((m) => [m.toLowerCase(), false])
        ),
      },
    ]);
    setNewGrouping("");
  };

  return (
    <div className="relative font-wixMade text-xs w-full">
      <Card className="overflow-hidden shadow-xs rounded-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Role Groupings & Permissions
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {/* Add new grouping */}
          <div className="mb-4 h-10 flex gap-2 items-center">
            <Input
              value={newGrouping}
              onChange={(e) => setNewGrouping(e.target.value)}
              placeholder="Add new role grouping"
              className="text-xs h-7 w-56"
            />
            <Button className="text-xs bg-core hover:bg-core/90 h-7" onClick={addGrouping}>
              Add
            </Button>
          </div>

          {/* Table */}
          <div className="relative min-h-104">
            <table className="w-full border-collapse text-xs">
              <thead className="text-left bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 w-1/4">Role Grouping</th>
                  {modules.map((mod, i) => (
                    <th key={i} className="p-3">
                      {mod}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roleGroupings.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedRole(r)}
                    className="border-b hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <td className="p-3 font-medium">{r.name}</td>
                    {modules.map((mod, j) => (
                      <td key={j} className="p-3 text-center">
                        {r.permissions[mod.toLowerCase()] ? "✅" : "❌"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* AnimatePresence handles enter/exit animation */}
            <AnimatePresence>
              {selectedRole && (
                <motion.div
                  key="role-panel"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "tween", duration: 0.35 }}
                  className="absolute top-0 right-0 w-4/6 md:w-1/2 h-full bg-white border-l border-gray-200 shadow-lg overflow-y-auto"
                >
                  {/* Sticky Header with Close Button */}
                  <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-0.5 flex justify-between items-center">
                    <h3 className="text-base font-semibold">
                      Edit Permissions — {selectedRole.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:bg-gray-100"
                      onClick={() => setSelectedRole(null)}
                    >
                      <X size={16} />
                    </Button>
                  </div>

                  {/* Permissions List */}
                  <div className="p-5 space-y-3">
                    {modules.map((mod) => (
                      <div
                        key={mod}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <span>{mod} Access</span>
                        <Button
                          size="sm"
                          className={`text-[10px] h-6 ${
                            selectedRole.permissions[mod.toLowerCase()]
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                          onClick={() => {
                            const index = roleGroupings.findIndex(
                              (r) => r.name === selectedRole.name
                            );
                            togglePermission(index, mod);
                            setSelectedRole({
                              ...selectedRole,
                              permissions: {
                                ...selectedRole.permissions,
                                [mod.toLowerCase()]:
                                  !selectedRole.permissions[mod.toLowerCase()],
                              },
                            });
                          }}
                        >
                          {selectedRole.permissions[mod.toLowerCase()]
                            ? "Allowed"
                            : "Restricted"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="px-5">
                    <Button
                      onClick={() => setSelectedRole(null)}
                      className="text-xs hover:bg-core/90 bg-core mt-4 w-full"
                    >
                      Done
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}














export  function CompanyStaffManagements() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(false);

  const staffList = [
    { id: 1, name: "John Doe", email: "john@fedeco.com", role: "Sales Manager", group: "Staff" },
    { id: 2, name: "Jane Smith", email: "jane@fedeco.com", role: "Accountant", group: "Supervisor" },
  ];

  const roleGroupings = ["Supervisor", "Main Supervisor", "Second Supervisor", "Staff"];
  const [customGroupings, setCustomGroupings] = useState([]);
  const [newGrouping, setNewGrouping] = useState("");

  const addGrouping = () => {
    if (newGrouping.trim()) {
      setCustomGroupings([...customGroupings, newGrouping]);
      setNewGrouping("");
    }
  };

  return (
    <div className="p-6 font-wixMade text-xs space-y-6">
      <h2 className="text-base font-semibold">Staff Management</h2>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="flex gap-3 border-b pb-2">
          <TabsTrigger value="directory">Staff Directory</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* 🧩 Staff Directory */}
        <TabsContent value="directory" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((staff) => (
              <Card
                key={staff.id}
                onClick={() => {
                  setSelectedStaff(staff);
                  setEditingStaff(false);
                }}
                className={`cursor-pointer transition border hover:border-gray-400 ${
                  selectedStaff?.id === staff.id ? "border-black" : "border-gray-200"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-sm">{staff.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Email: {staff.email}</p>
                  <p>Role: {staff.role}</p>
                  <p>Group: {staff.group}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Staff Info Modal / Drawer */}
          {selectedStaff && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-base font-semibold mb-3">
                Staff Details — {selectedStaff.name}
              </h3>

              {!editingStaff ? (
                <div className="space-y-2">
                  <p>Name: {selectedStaff.name}</p>
                  <p>Email: {selectedStaff.email}</p>
                  <p>Role: {selectedStaff.role}</p>
                  <p>Grouping: {selectedStaff.group}</p>

                  <Button
                    onClick={() => setEditingStaff(true)}
                    className="text-xs mt-2 flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input defaultValue={selectedStaff.name} placeholder="Name" />
                  <Input defaultValue={selectedStaff.email} placeholder="Email" />
                  <Input defaultValue={selectedStaff.role} placeholder="Role" />

                  <select className="border rounded-md px-2 py-1 text-xs">
                    {roleGroupings.concat(customGroupings).map((group, i) => (
                      <option key={i} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={() => setEditingStaff(false)}
                    className="text-xs mt-2"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* 🧩 Onboarding */}
        <TabsContent value="onboarding" className="mt-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-sm">Invite New Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Staff Name" />
              <Input placeholder="Staff Email" />
              <Input placeholder="Role (e.g. Sales Manager)" />
              <p className="text-[11px] text-gray-500">
                Default role grouping: <span className="font-semibold">Staff</span>
              </p>
              <Button className="text-xs">Send Invite</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🧩 Roles & Permissions */}
        <TabsContent value="roles" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Role Groupings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-4 space-y-1">
                {roleGroupings.concat(customGroupings).map((group, i) => (
                  <li key={i} className="capitalize">
                    {group}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 mt-2">
                <Input value={newGrouping} onChange={(e) => setNewGrouping(e.target.value)} placeholder="Add new grouping" className="text-xs"/>
                <Button onClick={addGrouping} className="text-xs flex items-center gap-1">
                  <PlusCircle size={14} /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Defined Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-gray-500">
                Roles define what a person does (e.g., Accountant, Inventory Manager), 
                while role groupings define access levels.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
