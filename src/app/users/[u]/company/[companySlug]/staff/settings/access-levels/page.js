'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '../../../../../../../../../config/supabaseClient';
export default function AccessLevelsPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessLevels = async () => {
      try {
        const { data, error } = await supabase
          .from('access_level')
          .select()
          .order('level_number', { ascending: true });

        if (error) throw error;
        setLevels(data || []);
      } catch (error) {
        console.error('Error fetching access levels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessLevels();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-medium tracking-tight">Access Levels</h2>
          <p className="text-gray-600 text-sm mt-2">
            Define authority hierarchy (Owner is excluded)
          </p>
        </div>
        <p className="text-gray-600">Loading access levels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 grow flex flex-col overflow-y-auto ">
      <div>
        <h2 className="text-base font-medium tracking-tight">Access Levels</h2>
        <p className="text-gray-600 text-sm mt-2">
          Define authority hierarchy (Owner is excluded)
        </p>
      </div>

      <div className="space-y-3 flex flex-col">
        {levels.map((level) => (
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
