import React, { useState, useEffect, useCallback } from 'react';
import { customersApi, CustomerRequest } from '../api/customers';
import { Customer } from '../types';
import StatusBadge from '../components/StatusBadge';
import CustomerDrawer from '../components/CustomerDrawer';
import { MessageCircle } from 'lucide-react';

const Customers: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPlan, setNewPlan] = useState<'Lunch'|'Dinner'|'Both'>('Both');
  const [newPhone, setNewPhone] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customersApi.getAll(0, 100);
      setCustomers(res.data.content);
    } catch {
      // error handled silently, table will be empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const request: CustomerRequest = {
        name: newName,
        plan: newPlan,
        status: 'Active',
        totalMeals: 60,
        amountDue: 0,
        joinDate: new Date().toISOString().split('T')[0],
        phone: newPhone || undefined,
      };
      await customersApi.create(request);
      setNewName('');
      setNewPlan('Both');
      setNewPhone('');
      setShowAddForm(false);
      fetchCustomers();
    } catch {
      // handle error
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 p-8 overflow-y-auto flex flex-col">
        <header className="mb-8 flex justify-between items-end border-b border-border pb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-primary mb-1">Customers</h1>
            <p className="text-secondary">Manage mess members and plans</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary text-background text-sm font-medium rounded transition-all duration-300 hover:shadow-glow-primary hover:bg-primary/90 active:scale-95"
          >
            {showAddForm ? 'Cancel' : '+ Add Customer'}
          </button>
        </header>

        {showAddForm && (
          <form onSubmit={handleAddCustomer} className="mb-8 bg-surface border border-border p-4 rounded flex items-end gap-4 shrink-0">
            <div className="flex-1">
              <label className="block text-xs text-secondary mb-1">Name</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
                placeholder="Full Name"
                autoFocus
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-xs text-secondary mb-1">Plan</label>
              <select 
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as any)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
              >
                <option value="Lunch">Lunch Only</option>
                <option value="Dinner">Dinner Only</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs text-secondary mb-1">Phone</label>
              <input 
                type="tel" 
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
                placeholder="+91XXXXXXXXXX"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2 bg-accent text-background text-sm font-medium rounded transition-all duration-300 hover:shadow-glow-accent hover:bg-accent/90 active:scale-95 h-[38px]"
            >
              Save
            </button>
          </form>
        )}

        <div className="flex-1 min-h-0 bg-surface border border-border rounded overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background text-secondary sticky top-0 z-10 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Meals Used</th>
                  <th className="px-6 py-4 font-medium text-right">Amount Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-secondary">Loading...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-secondary italic">No customers found</td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => setSelectedCustomer(customer)}
                      className={`cursor-pointer transition-colors hover:bg-background/50 ${selectedCustomer?.id === customer.id ? 'bg-background' : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-primary">{customer.name}</td>
                      <td className="px-6 py-4 text-secondary">{customer.plan}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        <div className="flex items-center gap-2">
                          <span>{customer.phone || '—'}</span>
                          {customer.telegramChatId && (
                            <span title="Telegram linked">
                              <MessageCircle size={14} className="text-accent" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary">{customer.mealsUsed} <span className="text-border mx-1">/</span> {customer.totalMeals}</td>
                      <td className={`px-6 py-4 text-right font-medium ${customer.amountDue > 0 ? 'text-primary' : 'text-secondary'}`}>
                        ₹{customer.amountDue}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerDrawer 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
          onRefresh={fetchCustomers}
        />
      )}
    </div>
  );
};

export default Customers;
