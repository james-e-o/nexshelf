'use client';

import { useEffect, useState, useContext } from 'react';
import { DataContext } from '@/app/admin/[u]/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
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
import { Mail, Phone, MapPin, Briefcase, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

const roleColors = {
  staff: 'bg-blue-100 text-blue-800',
  supervisor: 'bg-purple-100 text-purple-800',
  manager: 'bg-orange-100 text-orange-800',
};

export default function ActiveStaffPage() {
  const params = useParams();
  const { data } = useContext(DataContext);
  const companySlug = params.companySlug;

  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch active staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/staff?companySlug=${companySlug}`
        );
        const data = await response.json();

        if (response.ok) {
          setStaff(data.staff || []);
        } else {
          toast.error(data.message || 'Failed to load staff');
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [companySlug]);

  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDetailDialogOpen(true);
  };

  const filteredStaff = staff.filter(member =>
    `${member.first_name} ${member.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-slate-900">Active Staff</h1>
        <p className="text-slate-600 mt-2">View and manage active staff members</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Total Staff</p>
              <p className="text-3xl font-bold text-slate-900">{staff.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Supervisors</p>
              <p className="text-3xl font-bold text-purple-600">
                {staff.filter(s => s.role === 'supervisor').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Staff Members</p>
              <p className="text-3xl font-bold text-blue-600">
                {staff.filter(s => s.role === 'staff').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>All active staff members in this company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          {/* Table */}
          {filteredStaff.length === 0 ? (
            <Alert>
              <AlertDescription>No staff members found</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branches</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.first_name} {member.last_name}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[member.role]}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {member.branch_count || 0} branch{member.branch_count !== 1 ? 'es' : ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(member)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff?.first_name} {selectedStaff?.last_name}
            </DialogTitle>
            <DialogDescription>Staff member details and information</DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-slate-600" />
                    <span className="text-sm">{selectedStaff.email}</span>
                  </div>
                  {selectedStaff.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-slate-600" />
                      <span className="text-sm">{selectedStaff.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role & Permissions */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Role & Permissions</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-600">Role</p>
                    <Badge className={roleColors[selectedStaff.role]}>
                      {selectedStaff.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Assigned Branches</p>
                    <p className="text-sm font-medium">{selectedStaff.branch_count || 0} branch{selectedStaff.branch_count !== 1 ? 'es' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Account Status</p>
                    <p className="font-medium">Active</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Date Joined</p>
                    <p className="font-medium">
                      {new Date(selectedStaff.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
