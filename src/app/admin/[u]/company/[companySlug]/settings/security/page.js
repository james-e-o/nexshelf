"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {Shield,UserCog,KeyRound,Trash2,Edit3,Save,X,Mail} from "lucide-react";

export default function SecurityOwnershipSettings() {
  const [data, setData] = useState({
    owner: "Jamie (You)",
    twoFactor: "Enabled",
    recoveryEmail: "support@nexshelf.com",
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(data);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    setTimeout(() => {
      setData(formData);
      setEditMode(false);
      setLoading(false);
    }, 700);
  };

  const handleCancel = () => {
    setFormData(data);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen pt-2 font-WixMid text-xs">
      <div className="bg-white rounded-sm p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h1 className="text-base font-semibold text-gray-800">
              Security & Ownership
            </h1>
          </div>

          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1 px-2 py-1 h-7 text-xs font-medium bg-core text-white rounded-sm hover:bg-core/90 cursor-pointer transition"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 h-7 text-xs font-medium bg-core text-white rounded-sm hover:bg-core/90 cursor-pointer transition"
              >
                <Save className="w-3 h-3" />
                {loading ? "Saving..." : "Save"}
              </Button>

              <Button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2 py-1 h-7 text-xs font-medium border border-gray-300 rounded-sm hover:bg-gray-100 cursor-pointer transition"
              >
                <X className="w-3 h-3" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-200">

          {/* Ownership */}
          <div className="py-3 flex items-start justify-between">
            <div>
              <p className="text-gray-500 flex items-center gap-1">
                <UserCog className="w-3 h-3 text-gray-400" />
                Company Owner
              </p>

              {!editMode ? (
                <p className="text-gray-800 mt-1 font-medium">{data.owner}</p>
              ) : (
                <input
                  type="text"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  className="mt-1 text-xs border border-gray-300 rounded-sm px-2 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
            </div>
          </div>

          {/* 2FA */}
          <div className="py-3 flex items-start justify-between">
            <div>
              <p className="text-gray-500 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-gray-400" />
                Two-Factor Authentication
              </p>

              {!editMode ? (
                <p className="text-gray-800 mt-1 font-medium">{data.twoFactor}</p>
              ) : (
                <select
                  name="twoFactor"
                  value={formData.twoFactor}
                  onChange={handleChange}
                  className="mt-1 text-xs border border-gray-300 rounded-sm px-2 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              )}
            </div>
          </div>

          {/* Recovery Email */}
          <div className="py-3 flex items-start justify-between">
            <div>
              <p className="text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-400" />
                Recovery Email
              </p>

              {!editMode ? (
                <p className="text-gray-800 mt-1 font-medium">{data.recoveryEmail}</p>
              ) : (
                <input
                  type="email"
                  name="recoveryEmail"
                  value={formData.recoveryEmail}
                  onChange={handleChange}
                  className="mt-1 text-xs border border-gray-300 rounded-sm px-2 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="py-4">
            <p className="text-red-600 text-xs font-medium flex items-center gap-1 mb-2">
              <Trash2 className="w-3 h-3 text-red-600" />
              Danger Zone
            </p>

            <Button
              className="bg-red-600 text-white text-xs h-7 px-3 rounded-sm hover:bg-red-600/90 cursor-pointer"
            >
              Delete Company Permanently
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
