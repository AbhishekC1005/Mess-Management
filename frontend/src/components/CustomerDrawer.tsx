import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Customer } from '../types';
import StatusBadge from './StatusBadge';
import { customersApi } from '../api/customers';
import { attendanceApi } from '../api/attendance';

interface CustomerDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

const CustomerDrawer: React.FC<CustomerDrawerProps> = ({ customer, onClose, onRefresh }) => {
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [pauseDays, setPauseDays] = useState('1');

  const showConfirm = (msg: string = '✓ Done') => {
    setConfirmMsg(msg);
    setTimeout(() => setConfirmMsg(null), 2000);
  };

  const handleSkipMeal = async (meal: 'Lunch' | 'Dinner' | 'Both') => {
    if (!customer) return;
    try {
      await attendanceApi.logAttendance({
        date: new Date().toISOString().split('T')[0],
        customerId: customer.id,
        meal,
        action: 'Skipped',
        source: 'Manual',
      });
      showConfirm('✓ Skipped');
      await onRefresh();
    } catch {
      showConfirm('✗ Failed');
    }
  };

  const handlePause = async () => {
    if (!customer) return;
    try {
      const days = parseInt(pauseDays);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      await customersApi.pause(customer.id, endDate.toISOString().split('T')[0]);
      showConfirm('✓ Paused');
      await onRefresh();
      onClose();
    } catch {
      showConfirm('✗ Failed');
    }
  };

  const handleResume = async () => {
    if (!customer) return;
    try {
      await customersApi.resume(customer.id);
      showConfirm('✓ Resumed');
      await onRefresh();
      onClose();
    } catch {
      showConfirm('✗ Failed');
    }
  };

  const handleMarkPaid = async () => {
    if (!customer) return;
    try {
      await customersApi.update(customer.id, {
        name: customer.name,
        plan: customer.plan,
        status: customer.status,
        totalMeals: customer.totalMeals,
        amountDue: 0,
        joinDate: customer.joinDate,
        phone: customer.phone,
      });
      showConfirm('✓ Marked Paid');
      await onRefresh();
    } catch {
      showConfirm('✗ Failed');
    }
  };

  if (!customer) return null;

  return (
    <div className="w-[400px] border-l border-border bg-surface h-full flex flex-col shadow-none relative transition-transform duration-150 ease-in-out">
      <div className="p-6 border-b border-border flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-primary mb-1">{customer.name}</h2>
          <div className="flex items-center gap-3 text-sm text-secondary">
            <span>{customer.plan} Plan</span>
            <span>•</span>
            <span>Joined {new Date(customer.joinDate).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-secondary transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.8)] active:scale-90">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        
        {/* Status Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-secondary">Current Status</h3>
            <StatusBadge status={customer.status} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border border-border rounded p-3">
              <div className="text-xs text-secondary mb-1">Meals Used (Month)</div>
              <div className="text-lg font-medium text-primary">{customer.mealsUsed} / {customer.totalMeals}</div>
            </div>
            <div className="bg-background border border-border rounded p-3">
              <div className="text-xs text-secondary mb-1">Skipped (Month)</div>
              <div className="text-lg font-medium text-primary">{customer.skippedCount}</div>
            </div>
          </div>
        </section>

        {/* Financials Section */}
        <section>
          <h3 className="text-sm font-medium text-secondary mb-4">Financials</h3>
          <div className="bg-background border border-border rounded p-4 flex justify-between items-center">
            <div>
              <div className="text-xs text-secondary mb-1">Amount Due</div>
              <div className="text-xl font-semibold text-primary">₹{customer.amountDue}</div>
            </div>
            <div className="relative">
              <button 
                onClick={handleMarkPaid}
                disabled={customer.amountDue === 0}
                className="px-4 py-2 bg-primary text-background text-sm font-medium rounded transition-all duration-300 hover:shadow-glow-primary hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
              >
                Mark Paid
              </button>
              {confirmMsg && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-accent text-xs font-medium whitespace-nowrap animate-fade-in-out">
                  {confirmMsg}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Manual Overrides */}
        <section>
          <h3 className="text-sm font-medium text-secondary mb-4">Manual Overrides</h3>
          <div className="space-y-3">
            {customer.status === 'Paused' ? (
              <button 
                onClick={handleResume}
                className="w-full py-2 border border-accent rounded text-sm text-accent transition-all duration-300 hover:bg-accent/10 hover:border-accent/50 active:scale-95"
              >
                Resume Meals
              </button>
            ) : (
              <>
                <div className="flex gap-3 relative">
                  <button 
                    onClick={() => handleSkipMeal('Lunch')}
                    className="flex-1 py-2 border border-border rounded text-sm text-primary transition-all duration-300 hover:bg-background hover:border-primary/50 hover:shadow-glow-primary active:scale-95"
                  >
                    Skip Lunch
                  </button>
                  <button 
                    onClick={() => handleSkipMeal('Dinner')}
                    className="flex-1 py-2 border border-border rounded text-sm text-primary transition-all duration-300 hover:bg-background hover:border-primary/50 hover:shadow-glow-primary active:scale-95"
                  >
                    Skip Dinner
                  </button>
                  {confirmMsg && (
                    <span className="absolute top-1/2 -translate-y-1/2 right-4 text-accent text-xs font-medium whitespace-nowrap animate-fade-in-out">
                      {confirmMsg}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 relative">
                  <select 
                    value={pauseDays}
                    onChange={(e) => setPauseDays(e.target.value)}
                    className="flex-1 py-2 px-3 border border-border rounded bg-surface text-primary text-sm outline-none focus:border-secondary transition-colors"
                  >
                    <option value="1">Pause 1 Day</option>
                    <option value="3">Pause 3 Days</option>
                    <option value="7">Pause 1 Week</option>
                  </select>
                  <button 
                    onClick={handlePause}
                    className="flex-1 py-2 border border-border rounded text-sm text-warning transition-all duration-300 hover:bg-warning/10 hover:border-warning/50 hover:shadow-glow-warning active:scale-95"
                  >
                    Apply Pause
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Pause History */}
        <section>
          <h3 className="text-sm font-medium text-secondary mb-4">Pause History</h3>
          {customer.pauseHistory.length > 0 ? (
            <ul className="space-y-2">
              {customer.pauseHistory.map((history) => (
                <li key={history.id} className="text-sm text-primary bg-background px-3 py-2 rounded border border-border flex justify-between">
                  <span>{new Date(history.startDate).toLocaleDateString()}</span>
                  <span className="text-secondary">to</span>
                  <span>{history.endDate ? new Date(history.endDate).toLocaleDateString() : 'Ongoing'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-secondary italic">No pause history</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerDrawer;
