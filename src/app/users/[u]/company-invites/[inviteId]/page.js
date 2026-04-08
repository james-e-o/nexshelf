'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DataContext } from '../../layout';
import supabase from '@/config/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const data = useContext(DataContext);

  const [invite, setInvite] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    address_field: '',
    identity_type: 'NIN',
    identity_number: '',
    bank_name: '',
    bank_account: '',
    signature_file: null,
    additional_documents: [],
  });

  useEffect(() => {
    fetchInvite();
  }, []);

  const fetchInvite = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: inviteData, error: inviteError } = await supabase
        .from('company_invites')
        .select('*')
        .eq('id', params.inviteId)
        .single();

      if (inviteError) throw inviteError;

      if (!inviteData) {
        throw new Error('Invite not found');
      }

      if (inviteData.status !== 'pending') {
        throw new Error('This invite has already been processed');
      }

      setInvite(inviteData);

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, email, logo_url')
        .eq('id', inviteData.company_id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);
    } catch (err) {
      console.log('Error fetching invite:', err);
      setError(err.message || 'Failed to load invite details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const validateForm = () => {
    const required = [
      'first_name',
      'last_name',
      'phone',
      'address_field',
      'identity_number',
      'bank_name',
      'bank_account',
    ];

    for (let field of required) {
      if (!formData[field]) {
        setError(`${field.replace(/_/g, ' ')} is required`);
        return false;
      }
    }

    if (!formData.date_of_birth) {
      setError('Date of birth is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const { error: staffError } = await supabase
        .from('staff_pending_acceptance')
        .insert({
          company_invite_id: invite.id,
          company_id: invite.company_id,
          email: invite.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender || null,
          date_of_birth: formData.date_of_birth,
          phone: formData.phone,
          address_field: formData.address_field,
          identity_type: formData.identity_type,
          identity_number: formData.identity_number,
          bank_name: formData.bank_name,
          bank_account: formData.bank_account,
          signature_file: null,
          additional_documents: [],
          status: 'pending',
        });

      if (staffError) throw staffError;

      const { error: updateError } = await supabase
        .from('company_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      if (updateError) throw updateError;

      router.push(`/users/${params.u}/company-invites?success=true`);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-900 mb-2">
            Error
          </h1>
          <p className="text-red-700">{error}</p>
          <Button
            onClick={() => router.push(`/users/${params.u}/company-invites`)}
            className="mt-4"
            variant="outline"
          >
            Back to Invites
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Accept Invite</h1>
        {company && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Company:</span>
            <Badge variant="default">{company.name}</Badge>
          </div>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ... ALL YOUR FORM SECTIONS UNCHANGED ... */}

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Accept & Submit'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(`/users/${params.u}/company-invites`)
            }
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}