import React, { useState, useEffect, useMemo } from 'react';
import { attendanceApi } from '../api/attendance';
import { ActionType, MealPlan, AttendanceLog } from '../types';

const Attendance: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMeal, setFilterMeal] = useState<MealPlan | 'All'>('All');
  const [filterAction, setFilterAction] = useState<ActionType | 'All'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await attendanceApi.getAll(0, 100);
        setLogs(res.data.content);
      } catch {
        // error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterMeal !== 'All' && log.meal !== filterMeal && log.meal !== 'Both') return false;
      if (filterAction !== 'All' && log.action !== filterAction) return false;
      if (dateFrom && log.date < dateFrom) return false;
      if (dateTo && log.date > dateTo) return false;
      return true;
    });
  }, [logs, filterMeal, filterAction, dateFrom, dateTo]);

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'Skipped': return 'text-error';
      case 'Paused': return 'text-warning';
      case 'Resumed': return 'text-accent';
      case 'Present': return 'text-green-400';
      default: return 'text-secondary';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <header className="mb-8 flex justify-between items-end border-b border-border pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-primary mb-1">Attendance Log</h1>
          <p className="text-secondary">Track all skips, pauses, and resumptions</p>
        </div>
      </header>

      {/* Filters */}
      <div className="mb-6 flex gap-4 shrink-0 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary">From Date</label>
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary">To Date</label>
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary">Meal</label>
          <select 
            value={filterMeal}
            onChange={(e) => setFilterMeal(e.target.value as any)}
            className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors min-w-[120px]"
          >
            <option value="All">All</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary">Action</label>
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as any)}
            className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors min-w-[120px]"
          >
            <option value="All">All</option>
            <option value="Skipped">Skipped</option>
            <option value="Paused">Paused</option>
            <option value="Resumed">Resumed</option>
            <option value="Present">Present</option>
          </select>
        </div>
        <div className="flex items-end pb-[2px]">
          <button 
            onClick={() => { setDateFrom(''); setDateTo(''); setFilterMeal('All'); setFilterAction('All'); }}
            className="text-sm text-secondary transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.8)] active:scale-95 px-2 py-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-surface border border-border rounded overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background text-secondary sticky top-0 z-10 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Meal</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-secondary">Loading...</td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-background/50">
                    <td className="px-6 py-4 text-primary">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-primary">{log.customerName}</td>
                    <td className="px-6 py-4 text-secondary">{log.meal}</td>
                    <td className={`px-6 py-4 font-medium ${getActionColor(log.action)}`}>{log.action}</td>
                    <td className="px-6 py-4">
                      <span className="bg-background border border-border px-2 py-1 rounded text-xs text-secondary">
                        {log.source}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-secondary italic">
                    No logs found matching criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
