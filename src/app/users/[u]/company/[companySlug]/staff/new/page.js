"use client";
import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyInfoContext } from "../../layout";
import { toast } from "sonner";
import Image from "next/image";
import  supabase from "../../../../../../../config/supabaseClient";
import {  AlertDialog,  AlertDialogAction,  AlertDialogCancel,  AlertDialogContent,  AlertDialogDescription,  AlertDialogTitle,} from "@/components/ui/alert-dialog";



export default function StaffOnboarding({ companyId, companyName, companyLogo }) {
  const [loading, setLoading] = useState(false);
  const { info, user } = useContext(CompanyInfoContext);

  // Invite Staff Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [showExistsDialog, setShowExistsDialog] = useState(false);
  const [showAlreadyMemberDialog, setShowAlreadyMemberDialog] = useState(false);
  const [existingInvite, setExistingInvite] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const COOLDOWN_MINUTES = 3;

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  async function handleInviteSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const checkingToast = toast.loading("Checking...");

    try {
      // Step 1: Check if invite already exists for this email + company
      const { data: existingInvites, error: checkError } = await supabase
        .from('company_invites')
        .select('*')
        .eq('email', inviteEmail)
        .eq('company_id', info.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking invites:', checkError);
        toast.dismiss(checkingToast);
        toast.error("Failed to check invite status");
        setLoading(false);
        return;
      }

      const inviteExists = existingInvites !== null;

      if (inviteExists) {
        toast.dismiss(checkingToast);
        const invite = existingInvites;

        // Case 3: Invite already accepted - user belongs to company
        if (invite.status === 'accepted') {
          setExistingInvite(invite);
          setShowAlreadyMemberDialog(true);
          setLoading(false);
          return;
        }

        // Case 2: Invite is pending or registered - resend
        setExistingInvite(invite);
        
        // Calculate cooldown from last_sent
        if (invite.last_sent) {
          const lastSent = new Date(invite.last_sent).getTime();
          const now = new Date().getTime();
          const diffMs = now - lastSent;
          const diffMinutes = diffMs / 1000 / 60;

          if (diffMinutes < COOLDOWN_MINUTES) {
            const remainingSeconds = Math.ceil((COOLDOWN_MINUTES - diffMinutes) * 60);
            setCooldownSeconds(remainingSeconds);
          } else {
            setCooldownSeconds(0);
          }
        }

        setShowExistsDialog(true);
        setLoading(false);
        return;
      }

      // Case 1: No invite exists - create new invite
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
      // Calculate expiry date (24 hours from now)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);

      // Create new invite with pending status
      const { data: insertData, error } = await supabase
        .from('company_invites')
        .insert([
          {
            email: inviteEmail,
            company_id: info.id,
            company_name: info.name,
            expiry: expiryDate.getTime(),
            last_sent: new Date().toISOString(),
            status: 'pending',
            invited_by: user.id
          },
        ])
        .select();

      if (error) {
        console.error('Error inserting company invite:', error);
        toast.error("Failed to send invitation");
        toast.dismiss(t);
        return;
      }

      // Send email invite
      // TODO: Call email service to send invite to user
      toast.dismiss(t);
      toast.success("Invite sent via email!");
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      toast.dismiss(t);
      toast.error("Something went wrong.");
    }
  }

  async function handleResend() {
    // Check cooldown
    if (cooldownSeconds > 0) {
      toast.error(`Please wait ${cooldownSeconds} second(s) before resending`);
      return;
    }

    setResendLoading(true);
    const t = toast.loading("Resending invite...");

    try {
      // Calculate new expiry date (24 hours from now)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      // Update the existing invite record with new last_sent
      const { data, error } = await supabase
        .from('company_invites')
        .update({
          expiry: expiryDate.getTime(),
          last_sent: new Date().toISOString()
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
        setCooldownSeconds(COOLDOWN_MINUTES * 60); // Start cooldown
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
              setCooldownSeconds(0);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResend}
              disabled={resendLoading || cooldownSeconds > 0}
              className="bg-core hover:bg-army disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                "Resending..."
              ) : cooldownSeconds > 0 ? (
                `Resend in ${cooldownSeconds}s`
              ) : (
                "Resend"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Already Member */}
      <AlertDialog open={showAlreadyMemberDialog} onOpenChange={setShowAlreadyMemberDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>User Already a Member</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold">{inviteEmail}</span> is already a member of your company and has accepted the invite.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel onClick={() => {
              setShowAlreadyMemberDialog(false);
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
