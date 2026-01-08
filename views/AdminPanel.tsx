
import React, { useState } from 'react';

const AdminPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<'users' | 'finance' | 'games' | 'settings'>('users');
  const [autoConnect, setAutoConnect] = useState(true);

  const stats = [
    { label: 'Total Users', value: '1,284', trend: '+12%', color: 'text-blue-600' },
    { label: 'Active Games', value: '342', trend: '+5%', color: 'text-green-600' },
    { label: 'Total Deposits', value: '₦4.2M', trend: '+22%', color: 'text-naija-green' },
    { label: 'Pending Payouts', value: '₦840k', trend: '-2%', color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
          <span className="font-brand font-black text-2xl tracking-tighter text-naija-green">MONEY11</span>
          <span className="bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-400">blessedsuccess538@gmail.com</span>
          <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-all font-bold">Logout</button>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className={`text-3xl font-black ${s.color}`}>{s.value}</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{s.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-naija-green/10 border-2 border-naija-green p-6 rounded-3xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="font-black text-lg">Auto-Connect Simulation</h3>
              <p className="text-sm text-gray-600 font-medium">When ON, matches users to AI after 30 seconds of inactivity.</p>
            </div>
          </div>
          <button 
            onClick={() => setAutoConnect(!autoConnect)}
            className={`w-20 h-10 rounded-full transition-all relative p-1 ${autoConnect ? 'bg-naija-green' : 'bg-gray-300'}`}
          >
            <div className={`w-8 h-8 bg-white rounded-full shadow-md transition-all ${autoConnect ? 'translate-x-10' : 'translate-x-0'}`}></div>
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {['users', 'finance', 'games', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveView(tab as any)}
              className={`px-6 py-3 rounded-xl font-bold transition-all capitalize whitespace-nowrap ${
                activeView === tab ? 'bg-naija-green text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab} Management
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold capitalize">{activeView} Overview</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Search..." className="border rounded-lg px-4 py-2 text-sm focus:ring-naija-green" />
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Export CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">ID / User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Stake History</th>
                  <th className="px-6 py-4">Activity Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700">#USER-293{i}<br/><span className="text-xs text-gray-400 font-normal">081234567{i}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {i % 2 === 0 ? 'In Game' : 'Waiting'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black">₦{ (i * 2500).toLocaleString() }</td>
                    <td className="px-6 py-4 text-gray-500">2024-10-1{i} 14:23</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-bold hover:underline mr-4">Edit</button>
                      <button className="text-red-600 font-bold hover:underline">Block</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
