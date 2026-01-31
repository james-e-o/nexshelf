'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function StaffInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [step, setStep] = useState('verify'); // verify, form, success
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Verified invite data
  const [inviteData, setInviteData] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    documents: {},
  });

  const [documentFiles, setDocumentFiles] = useState({});

  // Verify token on mount
  // useEffect(() => {
  //   const verifyToken = async () => {
  //     if (!token) {
  //       setError('Invalid or missing invitation link');
  //       setStep('error');
  //       setIsLoading(false);
  //       return;
  //     }

  //     try {
  //       setIsLoading(true);
  //       // Call backend to verify token
  //       const response = await fetch(`/api/staff-apply/verify?token=${token}`);
  //       const data = await response.json();

  //       if (!response.ok) {
  //         setError(data.message || 'Invalid invitation link');
  //         setStep('error');
  //         return;
  //       }

  //       setInviteData(data);
  //       setFormData(prev => ({
  //         ...prev,
  //         email: data.email || '',
  //       }));
  //       setStep('form');
  //     } catch (err) {
  //       console.error('Verification error:', err);
  //       setError('Failed to verify invitation');
  //       setStep('error');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   verifyToken();
  // }, [token]);

  // TODO: Enable token verification when backend is ready
  useEffect(() => {
    setIsLoading(false);
    setStep('form');
    setInviteData({
      companyName: 'Sample Company',
      role: 'Staff',
      email: 'staff@example.com'
    });
    setFormData(prev => ({
      ...prev,
      email: 'staff@example.com',
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentUpload = (e, documentType) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFiles(prev => ({
        ...prev,
        [documentType]: file,
      }));
      toast.success(`${documentType} uploaded`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Enable submission when backend is ready
    // try {
    //   const formDataToSend = new FormData();
    //   formDataToSend.append('token', token);
    //   formDataToSend.append('data', JSON.stringify(formData));

    //   // Append documents
    //   Object.entries(documentFiles).forEach(([key, file]) => {
    //     formDataToSend.append(key, file);
    //   });

    //   const response = await fetch('/api/staff-apply/submit', {
    //     method: 'POST',
    //     body: formDataToSend,
    //   });

    //   const data = await response.json();

    //   if (!response.ok) {
    //     setError(data.message || 'Submission failed');
    //     return;
    //   }

    //   toast.success('Application submitted successfully!');
    //   setStep('success');
    // } catch (err) {
    //   console.error('Submission error:', err);
    //   setError('Failed to submit application');
    //   toast.error('Failed to submit application');
    // } finally {
    //   setIsSubmitting(false);
    // }

    // Demo: Show success immediately
    toast.success('Application submitted successfully!');
    setStep('success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-core" spinning={true} />
          <p className="text-sm text-slate-600">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <AlertCircle className="size-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-900">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 text-center mb-6">{error}</p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="h-full overflow-y-scroll flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-900">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-800 text-center">
              Your application has been received. You'll be notified once it's reviewed.
            </p>
            <div className="bg-green-100 rounded-lg p-4 text-xs text-green-900">
              <p className="font-medium mb-1">What's next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>We'll review your documents</li>
                <li>You'll receive an email with next steps</li>
                <li>Account creation will be completed upon approval</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              Return Home 
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full font-WixMade overflow-y-scroll bg-linear-to-b from-white from-35% via-indigo-100 to-indigo-200  py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
            <div className="flex scale-[85%] justify-center items-center w-full ">
                <div className="flex pt-0 md:pt-0 size-8 justify-center">
                    <Image className="dark:invert w-7/8 scale-75 " src="/logo.png" alt="logo" width={200} height={200} priority />
                </div>
                <p className="font-Lato text-army -ml-0.5 text-2xl font-extrabold">{'NEXSHELF'}</p>
            </div>
          <h1 className="text-2xl font-bold font-WixMade text-slate-900 mt-3 mb-2">Staff Invite Form</h1>
          <p className="text-slate-600">
            {inviteData?.companyName && `Join ${inviteData.companyName} on Nexshelf`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              {inviteData?.role && `Position: ${inviteData.role}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="bg-slate-100"
                  />
                  <p className="text-xs text-slate-500">Your invitation email</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Required Documents</h3>
                <p className="text-sm text-slate-600">
                  Please upload the following documents for verification
                </p>

                {['ID', 'Certificate', 'License'].map((docType) => (
                  <div key={docType} className="space-y-2">
                    <Label htmlFor={`doc-${docType}`} className="flex items-center gap-2">
                      <span>{docType}</span>
                      {documentFiles[docType] && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ Uploaded
                        </span>
                      )}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`doc-${docType}`}
                        type="file"
                        onChange={(e) => handleDocumentUpload(e, docType)}
                        accept="image/*,.pdf"
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500">PDF or Image, max 5MB</p>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-core hover:bg-core/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-4 mr-2" spinning={true} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                By submitting, you agree to our terms and privacy policy
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
