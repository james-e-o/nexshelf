'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompanyInfoContext } from '../../../layout';

export default function AccessLevelsPage() {
  const { accessLevels, suspended } = useContext(CompanyInfoContext);

  if (!accessLevels || accessLevels.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-medium tracking-tight text-core">Access Levels</h2>
          <p className="text-gray-600 text-sm mt-2">
            Define authority hierarchy (Owner is excluded)
          </p>
        </div>
        <p className="text-gray-600">No access levels available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 grow flex flex-col overflow-y-auto">
      <div>
        <h2 className="text-base font-medium tracking-tight text-core">Access Levels</h2>
        <p className="text-gray-600 text-sm mt-2">
          Define authority hierarchy (Owner is excluded)
        </p>
      </div>

      <div className="space-y-3 flex flex-col">
        {accessLevels.map((level) => (
          <Link className='' key={level.key} href={`access-levels/${level.key}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-core">{level.name}</h3>
                    <Badge className={'text-army'} variant="outline">{`Level ${level.level_number}`}</Badge>
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
