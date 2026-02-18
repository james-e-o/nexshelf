"use client";
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyInfoContext } from "../../layout";
import { toast } from "sonner";
import Image from "next/image";
import { supabase } from "../../../../../../../../config/supabaseClient";
import {  AlertDialog,  AlertDialogAction,  AlertDialogCancel,  AlertDialogContent,  AlertDialogDescription,  AlertDialogTitle,} from "@/components/ui/alert-dialog";



export default function StaffOnboarding({ companyId, companyName, companyLogo }) {
  const [loading, setLoading] = useState(false);
  const { info } = useContext(CompanyInfoContext);

  // Invite Staff Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [showExistsDialog, setShowExistsDialog] = useState(false);
  const [showAlreadyAcceptedDialog, setShowAlreadyAcceptedDialog] = useState(false);
  const [existingInvite, setExistingInvite] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleInviteSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const checkingToast = toast.loading("Checking...");

    try {
      // First, check if the email already exists for this company
      const { data: existingData, error: checkError } = await supabase
        .from('company_invites')
        .select('*')
        .eq('email', inviteEmail)
        .eq('company_id', info.id);

      if (checkError) {
        console.error('Error checking if email exists:', checkError);
        toast.dismiss(checkingToast);
        toast.error("Failed to check if invite has been sent to this email");
        setLoading(false);
        return;
      }

      // If email exists, check if it's been accepted
      if (existingData && existingData.length > 0) {
        toast.dismiss(checkingToast);
        const invite = existingData[0];
        setExistingInvite(invite);
        
        // If accepted is true, show the already accepted dialog
        if (invite.accepted === true) {
          setShowAlreadyAcceptedDialog(true);
        } else {
          // If accepted is false, show the pending invite dialog
          setShowExistsDialog(true);
        }
        setLoading(false);
        return;
      }

      // If email doesn't exist, dismiss checking toast and proceed with insert
      toast.dismiss(checkingToast);
      await insertNewInvite();
    } catch (err) {
      console.error(err);
      toast.dismiss(checkingToast);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function insertNewInvite() {
    const t = toast.loading("Sending invite...");

    try {
      // Calculate expiry date (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      // Insert into company_invites table
      const { data, error } = await supabase
        .from('company_invites')
        .insert([
          {
            email: inviteEmail,
            company_id: info.id,
            company_name: info.name,
            expiry: expiryDate.getTime()
          },
        ])
        .select();

      if (error) {
        console.error('Error inserting company invite:', error);
        toast.error("Failed to save invitation to database");
        toast.dismiss(t);
        return;
      } else {
        toast.dismiss(t);
        toast.success("Invite sent!");
        setInviteEmail("");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(t);
      toast.error("Something went wrong.");
    }
  }

  async function handleResend() {
    setResendLoading(true);
    const t = toast.loading("Resending invite...");

    try {
      // Calculate new expiry date (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      // Update the existing invite record
      const { data, error } = await supabase
        .from('company_invites')
        .update({
          expiry: expiryDate.getTime()
        })
        .eq('id', existingInvite.id)
        .select();

      if (error) {
        console.error('Error updating company invite:', error);
        toast.error("Failed to resend invitation");
        toast.dismiss(t);
        setResendLoading(false);
        return;
      } else {
        toast.dismiss(t);
        toast.success("Invite resent!");
        setShowExistsDialog(false);
        setExistingInvite(null);
        setInviteEmail("");
        setResendLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(t);
      toast.error("Something went wrong.");
      setResendLoading(false);
    }
  }

  return (
    <div className="bg-white font-WixMade mx-auto shadow-sm rounded-lg p-6 min-w-xl w-fit mt-5">
      
      {/* Logo Header */}
      <div className="flex scale-[85%] justify-center items-center w-full -mt-2 -mb-2">
        <div className="flex pt-0 md:pt-0 size-8 justify-center">
          <Image
            className="dark:invert w-7/8 scale-75"
            src="/logo.png"
            alt="logo"
            width={200}
            height={200}
            priority
          />
        </div>
        <p className="font-Lato text-army -ml-0.5 text-2xl font-extrabold">
          NEXSHELF
        </p>
      </div>

      {/* Title */}
      <h2 className="text-sm text-center font-semibold my-4">
        Invite Staff Member
      </h2>

      {/* Company Info Display */}
      <div className="bg-slate-50 rounded-lg p-4 mb-5 border border-slate-200">
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 font-medium">Company Name</p>
            <p className="text-sm font-semibold text-gray-800">
              {info?.name || "Company"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Company Email</p>
            <p className="text-sm text-blue-600">
              {info?.email || "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Invite Staff Form */}
      <form
        className="flex flex-col gap-3 text-xs"
        onSubmit={handleInviteSubmit}
      >
        <div>
          <Label className="block mb-1 text-xs text-gray-600 font-medium">
            Staff Email Address
          </Label>
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            type="email"
            required
            placeholder="staff@example.com"
            className="text-xs"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-3 bg-core hover:bg-army text-white text-xs py-2 rounded-md font-medium"
        >
          {loading ? "Sending..." : "Send Invite"}
        </Button>
      </form>

      {/* Alert Dialog for Existing Email */}
      <AlertDialog open={showExistsDialog} onOpenChange={setShowExistsDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Invite Already Sent</AlertDialogTitle>
          <AlertDialogDescription>
            An invite has been sent to <span className="font-semibold">{inviteEmail}</span> already. Would you like to resend the invitation?
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel onClick={() => {
              setShowExistsDialog(false);
              setExistingInvite(null);
              setInviteEmail("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResend}
              disabled={resendLoading}
              className="bg-core hover:bg-army"
            >
              {resendLoading ? "Resending..." : "Resend"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Already Accepted Invite */}
      <AlertDialog open={showAlreadyAcceptedDialog} onOpenChange={setShowAlreadyAcceptedDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>User Already a Member</AlertDialogTitle>
          <AlertDialogDescription>
            This user has already accepted your previous invite and is already a member of your organization.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel onClick={() => {
              setShowAlreadyAcceptedDialog(false);
              setExistingInvite(null);
              setInviteEmail("");
            }}>
              Close
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
