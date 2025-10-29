'use client';

import React from 'react';
import Container from '@/app/components/Container';
import Badge from '@/components/ui/Badge';
import {useSettings} from '@/app/hooks/useSettings';

const CustomersWidget = () => {
  const settings = useSettings();
  const primaryColor = settings.primaryColor || '#10b981';

  // Simple sparkline using CSS and HTML
  const sparklineData = [0, 10, 5, 20, 10, 10, 0, 25, 25, 55, 35, 35, 40];
  const sparklineData2 = [15, 20, 20, 0, 15, 30, 30, 55, 45, 45, 35, 50, 45, 55];
  const max = Math.max(...sparklineData, ...sparklineData2);

  return (
    <Container className="w-full px-5">
      <div className="flex flex-row justify-between gap-6">
        <div className="min-w-[110px] space-y-1">
          <h1 className="font-bold text-gray-600">Customers</h1>
          <div className="flex flex-row items-center space-x-2">
            <div className="text-xl font-bold">424</div>
            <Badge className="h-6 rounded-md border-green-200 bg-green-100 px-1 py-0 text-green-800">
              +3.1%
            </Badge>
          </div>
        </div>
        <div className="relative w-full">
          <div className="absolute right-0 w-full max-w-[250px] h-[55px] flex items-end">
            <div className="flex items-end w-full h-full">
              {sparklineData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 mx-[1px]"
                  style={{
                    height: `${(value / max) * 100}%`,
                    backgroundColor: `${primaryColor}25`,
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
          </div>
          <div className="absolute right-0 w-full max-w-[250px] h-[55px] flex items-end">
            <div className="flex items-end w-full h-full">
              {sparklineData2.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 mx-[1px]"
                  style={{
                    height: `${(value / max) * 100}%`,
                    backgroundColor: '#6366f1',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CustomersWidget;