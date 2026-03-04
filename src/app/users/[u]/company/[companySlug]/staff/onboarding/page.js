'use client';

import { useState, useContext } from 'react';
import { CompanyInfoContext } from '../../layout'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { CheckCircle2, XCircle, Clock, FileText, Download, Mail } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

const invitationStatusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  expired: { label: 'Expired', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

export default function OnboardingPage() {
  const { info, user } = useContext(CompanyInfoContext);

  // Applications State
  const [applications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [appFilterStatus, setAppFilterStatus] = useState('pending');
  const [appSearchTerm, setAppSearchTerm] = useState('');

  // Invitations State
  const [invitations] = useState([]);
  const [invSearchTerm, setInvSearchTerm] = useState('');
  const [invFilterStatus, setInvFilterStatus] = useState('pending');

  // Applications handlers
  const handleViewDetails = (application) => {
    setSelectedApp(application);
    setIsDetailDialogOpen(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = app.status === appFilterStatus;
    const matchesSearch =
      app.data?.firstName?.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.data?.lastName?.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(appSearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Invitations filters
  const filteredInvitations = invitations.filter(invite => {
    const matchesStatus = invite.status === invFilterStatus;
    const matchesSearch = 
      invite.email?.toLowerCase().includes(invSearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
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
              {/* Status Filter */}
              <div className="flex gap-2">
                {['pending', 'approved', 'rejected'].map(status => (
                  <Button
                    key={status}
                    variant={appFilterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppFilterStatus(status)}
                    className={appFilterStatus === status ? 'bg-core hover:bg-core/90' : ''}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <Input
                placeholder="Search by name or email..."
                value={appSearchTerm}
                onChange={(e) => setAppSearchTerm(e.target.value)}
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
                    <Button variant="outline">
                      Reject
                    </Button>
                    <Button className="bg-core hover:bg-core/90">
                      Approve & Create Account
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
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {invitations.filter(i => i.status === 'pending').length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Accepted</p>
                  <p className="text-3xl font-bold text-green-600">
                    {invitations.filter(i => i.status === 'accepted').length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Expired</p>
                  <p className="text-3xl font-bold text-red-600">
                    {invitations.filter(i => i.status === 'expired').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>Manage staff invitations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Filter */}
              <div className="flex gap-2">
                {['pending', 'accepted', 'expired'].map(status => (
                  <Button
                    key={status}
                    variant={invFilterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInvFilterStatus(status)}
                    className={invFilterStatus === status ? 'bg-core hover:bg-core/90' : ''}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <Input
                placeholder="Search by email..."
                value={invSearchTerm}
                onChange={(e) => setInvSearchTerm(e.target.value)}
                className="max-w-sm"
              />

              {/* Invitations Table */}
              {filteredInvitations.length === 0 ? (
                <Alert>
                  <AlertDescription>No invitations found</AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Sent Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvitations.map((invitation) => {
                        const config = invitationStatusConfig[invitation.status];
                        const StatusIcon = config.icon;

                        return (
                          <TableRow key={invitation.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Mail className="size-4 text-gray-400" />
                                {invitation.email}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {invitation.sent_at ? new Date(invitation.sent_at).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className={config.color}>
                                <StatusIcon className="size-3 mr-1" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={invitation.status !== 'pending'}
                              >
                                Resend
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
