import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-surface border border-border rounded p-4 flex flex-col justify-center transition-all duration-300 hover:shadow-glow-primary hover:-translate-y-1 hover:border-primary/30">
      <span className="text-secondary text-sm font-medium mb-1">{title}</span>
      <span className="text-primary text-3xl font-semibold">{value}</span>
    </div>
  );
};

export default StatCard;
