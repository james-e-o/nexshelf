'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function InvitationsPage() {
  const [settings, setSettings] = useState({
    default_role_id: 'basic',
    default_access_level: 'basic',
    invite_expiration_hours: 48,
    allow_role_assignment_on_invite: true,
    allow_branch_assignment_on_invite: true,
    auto_activate_staff: false,
    allow_invite_resend: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="../" className="text-blue-600 hover:underline text-sm mb-2 block">
          ← Back to Settings
        </Link>
        <h2 className="text-base font-medium tracking-tight">Invitation Settings</h2>
        <p className="text-gray-600 text-sm mt-2">Control staff onboarding behavior</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid gap-6">
          <div>
            <Label htmlFor="default_role_id">Default Role for New Invitations</Label>
            <Select name="default_role_id" value={settings.default_role_id} onValueChange={(value) =>
              setSettings(prev => ({ ...prev, default_role_id: value }))
            }>
              <option value="basic">Basic</option>
              <option value="operator">Operator</option>
              <option value="supervisor">Supervisor</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="default_access_level">Default Access Level</Label>
            <Select name="default_access_level" value={settings.default_access_level} onValueChange={(value) =>
              setSettings(prev => ({ ...prev, default_access_level: value }))
            }>
              <option value="basic">Basic</option>
              <option value="operator">Operator</option>
              <option value="finance">Finance</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="invite_expiration_hours">Invitation Expiration (hours)</Label>
            <Input
              id="invite_expiration_hours"
              name="invite_expiration_hours"
              type="number"
              value={settings.invite_expiration_hours}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Allow Role Assignment on Invite</Label>
              <Switch
                checked={settings.allow_role_assignment_on_invite}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, allow_role_assignment_on_invite: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Allow Branch Assignment on Invite</Label>
              <Switch
                checked={settings.allow_branch_assignment_on_invite}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, allow_branch_assignment_on_invite: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto-activate Staff</Label>
              <Switch
                checked={settings.auto_activate_staff}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, auto_activate_staff: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Allow Invite Resend</Label>
              <Switch
                checked={settings.allow_invite_resend}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, allow_invite_resend: checked }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button>Save Settings</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
