import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, X, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  active: boolean;
}

const AlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const savedAlerts = localStorage.getItem('priceAlerts');
    return savedAlerts ? JSON.parse(savedAlerts) : [];
  });
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState<{
    symbol: string;
    condition: 'above' | 'below';
    price: number;
  }>({
    symbol: '',
    condition: 'above',
    price: 0,
  });

  const addAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const alert: Alert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      condition: newAlert.condition,
      price: newAlert.price,
      active: true,
    };
    const updatedAlerts = [...alerts, alert];
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    setIsAddingAlert(false);
    setNewAlert({ symbol: '', condition: 'above', price: 0 });
  };

  const toggleAlert = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  };

  const removeAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Bell className="h-6 w-6 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold">Price Alerts</h2>
        </div>
        <button 
          onClick={() => setIsAddingAlert(!isAddingAlert)}
          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="h-5 w-5 text-blue-500" />
        </button>
      </div>

      {isAddingAlert && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 rounded-xl bg-slate-800/50"
        >
          <form onSubmit={addAlert}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Symbol</label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                  placeholder="AAPL"
                  className="w-full p-2 rounded border bg-slate-700 border-slate-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Condition</label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                  className="w-full p-2 rounded border bg-slate-700 border-slate-600"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Price ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newAlert.price || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, price: Number(e.target.value) })}
                  className="w-full p-2 rounded border bg-slate-700 border-slate-600"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingAlert(false)}
                className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
              >
                Create Alert
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between p-4 rounded-xl ${
                alert.active ? 'bg-slate-800/50' : 'bg-slate-800/20 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`h-5 w-5 ${alert.active ? 'text-yellow-500' : 'text-slate-500'}`} />
                <div>
                  <div className="font-medium">{alert.symbol}</div>
                  <div className="text-xs">
                    {alert.condition === 'above' ? 'Above' : 'Below'} ${alert.price.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`text-xs px-3 py-1 rounded ${
                    alert.active
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {alert.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-xs p-1 rounded hover:bg-red-500/10"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400">
          <p>You haven't set up any price alerts yet.</p>
          <button
            onClick={() => setIsAddingAlert(true)}
            className="mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
          >
            Create Your First Alert
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;
