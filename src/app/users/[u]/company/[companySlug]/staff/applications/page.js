'use client';

import { useEffect, useState, useContext } from 'react';
import { DataContext } from '@/app/users/[u]/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Clock, User, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

export default function StaffApplicationsPage() {
  const params = useParams();
  const { data } = useContext(DataContext);
  const companySlug = params.companySlug;

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/users/staff-applications?companySlug=${companySlug}`
        );
        const data = await response.json();

        if (response.ok) {
          setApplications(data.applications || []);
        } else {
          toast.error(data.message || 'Failed to load applications');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [companySlug]);

  const handleViewDetails = (application) => {
    setSelectedApp(application);
    setIsDetailDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      setIsApproving(true);
      const response = await fetch(
        `/api/users/staff-applications/${selectedApp.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companySlug }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success('Application approved! Account created.');
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApp.id ? { ...app, status: 'approved' } : app
          )
        );
        setIsDetailDialogOpen(false);
        setSelectedApp(null);
      } else {
        toast.error(result.message || 'Approval failed');
      }
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve application');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsRejecting(true);
      const response = await fetch(
        `/api/users/staff-applications/${selectedApp.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectionReason, companySlug }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success('Application rejected');
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApp.id ? { ...app, status: 'rejected' } : app
          )
        );
        setIsDetailDialogOpen(false);
        setSelectedApp(null);
        setRejectionReason('');
      } else {
        toast.error(result.message || 'Rejection failed');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject application');
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = app.status === filterStatus;
    const matchesSearch =
      app.data?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.data?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="size-8 text-core" spinning={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Staff Applications</h1>
        <p className="text-slate-600 mt-2">Review and manage staff onboarding applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">
                {applications.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {applications.filter(a => a.status === 'rejected').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Filter and search staff applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs for Status Filter */}
          <Tabs value={filterStatus} onValueChange={setFilterStatus}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          {/* Applications Table */}
          {filteredApplications.length === 0 ? (
            <Alert>
              <AlertDescription>No applications found</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => {
                    const config = statusConfig[application.status];
                    const StatusIcon = config.icon;

                    return (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.data?.firstName} {application.data?.lastName}
                        </TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.data?.phone || '-'}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(application.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            <StatusIcon className="size-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApp?.data?.firstName} {selectedApp?.data?.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">First Name</p>
                    <p className="font-medium">{selectedApp.data?.firstName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Last Name</p>
                    <p className="font-medium">{selectedApp.data?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Email</p>
                    <p className="font-medium">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Phone</p>
                    <p className="font-medium">{selectedApp.data?.phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Address</h3>
                <div className="text-sm space-y-1">
                  <p>{selectedApp.data?.address}</p>
                  <p>
                    {selectedApp.data?.city}, {selectedApp.data?.state} {selectedApp.data?.zipCode}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Documents</h3>
                <div className="space-y-2">
                  {selectedApp.document_urls &&
                    Object.entries(selectedApp.document_urls).map(([docType, url]) => (
                      <div
                        key={docType}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-slate-600" />
                          <span className="text-sm font-medium">{docType}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <p className="font-medium mb-1">Rejection Reason:</p>
                    <p>{selectedApp.rejection_reason}</p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Rejection Reason Input (for pending) */}
              {selectedApp.status === 'pending' && (
                <div>
                  <label className="text-sm font-medium text-slate-900">
                    Rejection Reason (if applicable)
                  </label>
                  <Input
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedApp?.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleReject()}
                  disabled={isRejecting}
                >
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  className="bg-core hover:bg-core/90"
                  onClick={() => handleApprove()}
                  disabled={isApproving}
                >
                  {isApproving ? 'Approving...' : 'Approve & Create Account'}
                </Button>
              </div>
            )}
            {selectedApp?.status !== 'pending' && (
              <Button
                variant="outline"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
