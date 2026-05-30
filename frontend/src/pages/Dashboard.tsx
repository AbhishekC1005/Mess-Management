import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import MealColumn from '../components/MealColumn';
import { dashboardApi } from '../api/dashboard';
import { customersApi } from '../api/customers';
import { Customer, DashboardStats, AttendanceLog } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, customersRes, recentRes] = await Promise.all([
          dashboardApi.getStats(),
          customersApi.getAll(0, 100),
          dashboardApi.getRecentActivity(50),
        ]);
        setStats(statsRes.data);
        setCustomers(customersRes.data.content);
        setLogs(recentRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeCustomers = customers.filter(s => s.status === 'Active');
  const expectedLunch = activeCustomers.filter(s => s.plan === 'Lunch' || s.plan === 'Both').length;
  const expectedDinner = activeCustomers.filter(s => s.plan === 'Dinner' || s.plan === 'Both').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(log => log.date === todayStr && log.action === 'Skipped');

  const skippedLunchIds = todayLogs.filter(log => log.meal === 'Lunch' || log.meal === 'Both').map(l => l.customerId);
  const skippedDinnerIds = todayLogs.filter(log => log.meal === 'Dinner' || log.meal === 'Both').map(l => l.customerId);

  const skippedLunchCustomers = customers.filter(s => skippedLunchIds.includes(s.id));
  const skippedDinnerCustomers = customers.filter(s => skippedDinnerIds.includes(s.id));

  const confirmedLunch = expectedLunch - skippedLunchCustomers.length;
  const confirmedDinner = expectedDinner - skippedDinnerCustomers.length;
  const totalMeals = confirmedLunch + confirmedDinner;
  const totalSkipped = skippedLunchCustomers.length + skippedDinnerCustomers.length;

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center h-full">
        <p className="text-secondary">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center h-full">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <header className="mb-8 flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary mb-1">Dashboard</h1>
          <p className="text-secondary">{today}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} />
        <StatCard title="Meals Today" value={totalMeals} />
        <StatCard title="Skipped Today" value={stats?.skippedToday ?? 0} />
        <StatCard title="Paused Customers" value={stats?.pausedCustomers ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <MealColumn 
          meal="Lunch" 
          expectedCount={expectedLunch} 
          skippedCustomers={skippedLunchCustomers} 
        />
        <MealColumn 
          meal="Dinner" 
          expectedCount={expectedDinner} 
          skippedCustomers={skippedDinnerCustomers} 
        />
      </div>

      <div className="mt-8 pt-4 border-t border-border">
        <p className="text-secondary text-sm">
          Today: <span className="text-primary font-medium">{totalMeals} meals</span>, <span className="text-primary font-medium">{totalSkipped} skipped</span>, <span className="text-primary font-medium">{stats?.pausedCustomers ?? 0} paused</span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
