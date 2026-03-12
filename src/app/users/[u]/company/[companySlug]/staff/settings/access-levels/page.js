'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AccessLevelsPage() {
  const levels = [
    { key: 'admin_manager', label: 'Admin Manager', hierarchy: 1, description: 'Highest administrative authority' },
    { key: 'admin_finance', label: 'Admin Finance', hierarchy: 2, description: 'Financial administration authority' },
    { key: 'supervisor', label: 'Supervisor', hierarchy: 3, description: 'Supervisory authority' },
    { key: 'finance', label: 'Finance', hierarchy: 4, description: 'Financial operations' },
    { key: 'operator', label: 'Operator', hierarchy: 5, description: 'Operational authority' },
    { key: 'basic', label: 'Basic', hierarchy: 6, description: 'Basic user access' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium tracking-tight">Access Levels</h2>
        <p className="text-gray-600 text-sm mt-2">
          Define authority hierarchy (Owner is excluded)
        </p>
      </div>

      <div className="space-y-3">
        {levels.map((level, index) => (
          <Link key={level.key} href={`access-levels/${level.key}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-core">{level.label}</h3>
                    <Badge variant="outline">{`Level ${level.hierarchy}`}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{level.description}</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
