import React from 'react';
import { Customer } from '../types';

interface MealColumnProps {
  meal: 'Lunch' | 'Dinner';
  expectedCount: number;
  skippedCustomers: Customer[];
}

const MealColumn: React.FC<MealColumnProps> = ({ meal, expectedCount, skippedCustomers }) => {
  const confirmedCount = expectedCount - skippedCustomers.length;

  return (
    <div className="bg-surface border border-border rounded p-6 flex flex-col h-full transition-all duration-300 hover:shadow-glow-primary hover:border-primary/30">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
        <h3 className="text-xl font-semibold text-primary">{meal}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-secondary">Expected</span>
            <span className="font-medium text-primary">{expectedCount}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-secondary">Confirmed</span>
            <span className="font-medium text-accent">{confirmedCount}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-medium text-secondary mb-3">Skipped ({skippedCustomers.length})</h4>
        {skippedCustomers.length > 0 ? (
          <ul className="space-y-2">
            {skippedCustomers.map(customer => (
              <li key={customer.id} className="text-sm text-primary bg-background px-3 py-2 rounded border border-border">
                {customer.name}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-secondary italic">No skips today</div>
        )}
      </div>
    </div>
  );
};

export default MealColumn;
