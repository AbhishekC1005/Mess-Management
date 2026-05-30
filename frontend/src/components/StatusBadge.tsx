import React from 'react';
import { CustomerStatus } from '../types';

interface StatusBadgeProps {
  status: CustomerStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyles = () => {
    switch (status) {
      case 'Active':
        return 'text-accent border-accent/20 bg-accent/10';
      case 'Paused':
        return 'text-warning border-warning/20 bg-warning/10';
      case 'Inactive':
        return 'text-error border-error/20 bg-error/10';
      default:
        return 'text-secondary border-secondary/20 bg-secondary/10';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Active': return 'bg-accent';
      case 'Paused': return 'bg-warning';
      case 'Inactive': return 'bg-error';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded border text-xs font-medium ${getBadgeStyles()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {status}
    </div>
  );
};

export default StatusBadge;
