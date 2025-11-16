"use client";
import { useState,useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyInfo } from "../../layout";
import { toast } from "sonner";

export default function StaffOnboarding({ companyId, companyName, companyLogo }) {
  const [loading, setLoading] = useState(false);
  const {info,setInfo} = useContext(CompanyInfo)

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const body = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        companyId:info.id,
        companyName:'Nexshelf Inc.',
        link:`https://nexshelf-pro.vercel.app/`
    };

    const res = await fetch("/api/staff-invite", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast("Invite sent!");
    } else {
      toast("Error: " + data.message);
    }
  }

  return (
    <div className="bg-white font-WixMade mx-auto shadow-sm rounded-lg p-5 max-w-md mt-5">
      <h2 className="text-sm font-semibold mb-3">Onboard New Staff</h2>

      <form className="flex flex-col gap-3 text-xs" onSubmit={handleSubmit}>
        <div>
          <Label className="block mb-1 text-xs text-gray-600">Full Name</Label>
          <Input name="name" required />
        </div>

        <div>
          <Label className="block mb-1 text-xs text-gray-600">Email</Label>
          <Input name="email" type="email" required />
        </div>

        <div>
          <Label className="block mb-1 text-xs text-gray-600">Phone</Label>
          <Input name="phone" type="tel" required />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 bg-core hover:bg-army text-white text-xs py-2 rounded-md"
        >
          {loading ? "Sending..." : "Send Invite"}
        </Button>
      </form>
    </div>
  );
}
