"use client";

import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";

export default function SettingsEditPattern() {
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    country: "Nigeria",
    region: "Lagos State",
    timezone: "Africa/Lagos",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  return (
    <div className="pt-2 font-WixMade text-xs w-full">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-sm ml-1 font-medium">Country & Region</h1>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="h-7 px-3 bg-core hover:bg-core/90 text-white rounded-sm cursor-pointer flex items-center gap-1 text-xs"
          >
            <Pencil size={14} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="h-7 px-3 bg-core hover:bg-core/90 text-white rounded-sm cursor-pointer flex items-center gap-1 text-xs"
            >
              <Save size={14} /> Save
            </button>

            <button
              onClick={handleCancel}
              className="h-7 px-3 bg-gray-200 hover:bg-gray-300 rounded-sm cursor-pointer flex items-center gap-1 text-xs"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* CARD */}
      <div className="bg-white border rounded-sm p-4 space-y-5">

        {/* COUNTRY */}
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Default Country</span>

          {!editMode ? (
            <p className="font-medium">{formData.country}</p>
          ) : (
            <select
              name="country"
              className="border rounded-sm px-2 py-1 text-xs w-60"
              value={formData.country}
              onChange={handleChange}
            >
              <option>Nigeria</option>
              <option>Ghana</option>
              <option>Kenya</option>
              <option>United States</option>
            </select>
          )}
        </div>

        {/* REGION */}
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Default Region / State</span>

          {!editMode ? (
            <p className="font-medium">{formData.region}</p>
          ) : (
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="border rounded-sm px-2 py-1 text-xs w-60"
            />
          )}
        </div>

        {/* TIMEZONE */}
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Timezone</span>

          {!editMode ? (
            <p className="font-medium">{formData.timezone}</p>
          ) : (
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="border rounded-sm px-2 py-1 text-xs w-60"
            >
              <option>Africa/Lagos</option>
              <option>Africa/Nairobi</option>
              <option>Europe/London</option>
              <option>America/New_York</option>
            </select>
          )}
        </div>

      </div>
    </div>
  );
}
