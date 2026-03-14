'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '../../../../../../../../../../config/supabaseClient';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

export default function AccessLevelDetailPage() {
  const params = useParams();
  const { level } = params;
  
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changed, setChanged] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const capitalizeLevel = (str) => {
    if (!str) return '';
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchPermissionsData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all permissions from permission_keys table
      const { data: allPermissions, error: permError } = await supabase
        .from('permission_keys')
        .select('*')
        .order('permission_group', { ascending: true });

      if (permError) throw permError;

      // Group permissions by permission_group
      const groupedPerms = {};
      (allPermissions || []).forEach(perm => {
        const group = perm.permission_group;
        if (!groupedPerms[group]) {
          groupedPerms[group] = {
            label: group.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            permissions: [],
          };
        }
        groupedPerms[group].permissions.push({
          key: perm.permission_key,
          label: perm.name,
          description: perm.description,
          enabled: false,
        });
      });

      // Fetch permissions assigned to this access level
      const { data: levelPermissions, error: levelError } = await supabase
        .from('access_level_permissions')
        .select('permission_key, allowed')
        .eq('access_level_key', level);

      if (levelError) throw levelError;

      // Create a map of which permissions are enabled for this level
      const enabledMap = {};
      (levelPermissions || []).forEach(perm => {
        enabledMap[perm.permission_key] = perm.allowed;
      });

      // Merge database state with fetched permissions
      Object.keys(groupedPerms).forEach(groupKey => {
        groupedPerms[groupKey].permissions = groupedPerms[groupKey].permissions.map(perm => ({
          ...perm,
          enabled: enabledMap[perm.key] ?? false,
        }));
      });

      setPermissions(groupedPerms);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPermissionsData();
  };

  useEffect(() => {
    fetchPermissionsData();
  }, [level]);

  const handlePermissionToggle = (groupKey, permissionKey) => {
    setPermissions(prev => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        permissions: prev[groupKey].permissions.map(perm =>
          perm.key === permissionKey ? { ...perm, enabled: !perm.enabled } : perm
        ),
      },
    }));
    setChanged(prev => ({
      ...prev,
      [permissionKey]: !changed[permissionKey],
    }));
  };

  const handleSave = async () => {
    try {
      // Upsert each changed permission
      const permissionsToUpdate = [];
      Object.keys(permissions).forEach(groupKey => {
        permissions[groupKey].permissions.forEach(perm => {
          if (changed[perm.key]) {
            permissionsToUpdate.push({
              access_level_key: level,
              permission_key: perm.key,
              allowed: perm.enabled,
            });
          }
        });
      });

      if (permissionsToUpdate.length > 0) {
        const { error: upsertError } = await supabase
          .from('access_level_permissions')
          .upsert(permissionsToUpdate);

        if (upsertError) throw upsertError;
      }

      setChanged({});
      alert('Permissions saved successfully!');
    } catch (err) {
      console.error('Error saving permissions:', err);
      alert('Error saving permissions: ' + err.message);
    }
  };

  const renderCategory = (groupKey, groupData) => (
    <div key={groupKey} className="space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
        {groupData.label}
      </h3>
      <div className="space-y-2 pl-2">
        {groupData.permissions.map((perm) => (
          <div key={perm.key} className="flex items-center gap-2">
            <Checkbox
              id={perm.key}
              checked={perm.enabled}
              onCheckedChange={() => handlePermissionToggle(groupKey, perm.key)}
              className="bg-white border-gray-300 [&[data-state=checked]]:bg-army [&[data-state=checked]]:border-army [&[data-state=checked]]:text-white"
            />
            <div className="flex-1">
              <Label htmlFor={perm.key} className="cursor-pointer font-medium text-sm">
                {perm.label}
              </Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="../access-levels" className="text-blue-600 hover:underline text-sm whitespace-nowrap">
            ← Back to Access Levels
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-blue-600 hover:text-blue-700 p-1 h-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <h2 className="text-base font-medium tracking-tight text-core">{capitalizeLevel(level)} Access Level</h2>
        </div>
        <p className="text-gray-600">Loading permissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="../access-levels" className="text-blue-600 hover:underline text-sm whitespace-nowrap">
            ← Back to Access Levels
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-blue-600 hover:text-blue-700 p-1 h-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <h2 className="text-base font-medium tracking-tight text-core">{capitalizeLevel(level)} Access Level</h2>
        </div>
        <p className="text-red-600">Error loading permissions: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col grow overflow-y-auto">
      <div className="flex items-center gap-4">
        <Link href="../access-levels" className="text-blue-600 hover:underline text-sm whitespace-nowrap">
          ← Back to Access Levels
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-blue-600 hover:text-blue-700 p-1 h-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <h2 className="text-base font-medium tracking-tight text-core">{capitalizeLevel(level)} Access Level</h2>
      </div>

      <Card className="p-6 space-y-6">
        {Object.keys(permissions).length === 0 ? (
          <p className="text-gray-600">No permissions available</p>
        ) : (
          Object.entries(permissions).map(([groupKey, perms], index) => (
            <div key={groupKey} className=''>
              {renderCategory(groupKey, perms)}
              {index < Object.keys(permissions).length - 1 && <div className="border-b py-2" />}
            </div>
          ))
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button variant={''} className={'bg-core text-white'} onClick={handleSave}>Save Permissions</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
