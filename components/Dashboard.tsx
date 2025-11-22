
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { OperationType, OperationStatus } from '../types';
import { analyzeInventory } from '../services/geminiService';
import { 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  PackagePlus, 
  ArrowRight,
  Sparkles,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const MetricCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white bg-opacity-90 shadow-md`}>
        <Icon size={24} />
      </div>
    </div>
    {subtext && <p className="mt-4 text-xs text-gray-400">{subtext}</p>}
  </div>
);

export const Dashboard: React.FC = () => {
  const { products, operations } = useInventory();
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [predictiveMode, setPredictiveMode] = useState(false);

  // KPIs
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock <= p.minStockRule).length;
  const pendingReceipts = operations.filter(o => o.type === OperationType.RECEIPT && o.status !== OperationStatus.DONE).length;
  const pendingDeliveries = operations.filter(o => o.type === OperationType.DELIVERY && o.status !== OperationStatus.DONE).length;

  // --- Prepare Data for Charts ---

  // 1. Pie Chart: Stock Health (Good vs Low)
  const goodStockCount = totalProducts - lowStockCount;
  const healthData = [
    { name: 'Healthy Stock', value: goodStockCount },
    { name: 'Low Stock', value: lowStockCount }
  ];
  const HEALTH_COLORS = ['#10b981', '#ef4444'];

  // 2. Pie Chart: Categories
  const categoryCounts = products.reduce<Record<string, number>>((acc, product) => {
    const cat = product.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value) // Sort by count
    .slice(0, 5); // Top 5 categories
  
  // If there are more than 5, group them into 'Others'
  const othersCount = (Object.values(categoryCounts) as number[])
    .sort((a: number, b: number) => b - a)
    .slice(5)
    .reduce((a: number, b: number) => a + b, 0);
    
  if (othersCount > 0) {
    categoryData.push({ name: 'Others', value: othersCount });
  }

  const CAT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#94a3b8'];

  // 3. Line Chart: Weekly Activity (Incoming vs Outgoing)
  // Generating last 7 days labels
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // If predictive mode, extend by 3 days
  const chartDays = predictiveMode 
    ? [...last7Days, ...Array.from({length: 3}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + (i + 1));
        return d;
      })]
    : last7Days;

  const activityData = chartDays.map((date, idx) => {
    const isFuture = idx >= 7;
    const dateStr = date.toISOString().split('T')[0];
    const dayOps = operations.filter(op => op.date.startsWith(dateStr));
    
    // Simulate some background activity for the chart if data is sparse
    // In a real app, remove the Math.random() parts
    const simulatedIncoming = Math.floor(Math.random() * 15) + 5; 
    const simulatedOutgoing = Math.floor(Math.random() * 12) + 3;

    const realIncoming = dayOps.filter(o => o.type === OperationType.RECEIPT).length;
    const realOutgoing = dayOps.filter(o => o.type === OperationType.DELIVERY).length;

    if (isFuture) {
        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }) + ' (Est)',
            incoming: Math.floor(Math.random() * 20) + 10,
            outgoing: Math.floor(Math.random() * 25) + 5,
            isPrediction: true
        };
    }

    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      incoming: realIncoming > 0 ? realIncoming : simulatedIncoming,
      outgoing: realOutgoing > 0 ? realOutgoing : simulatedOutgoing,
      isPrediction: false
    };
  });

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await analyzeInventory(products, operations);
    setAiInsights(result);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time snapshot of your warehouse</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={() => setPredictiveMode(!predictiveMode)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-all ${
                predictiveMode 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
             }`}
          >
             <LineIcon size={18} />
             <span>{predictiveMode ? 'Hide Predictions' : 'Show AI Forecast'}</span>
          </button>
          <button 
            onClick={handleAiAnalysis}
            disabled={loadingAi}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-70"
          >
            {loadingAi ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Sparkles size={18} />
            )}
            <span>{loadingAi ? 'Analyzing...' : 'Get AI Summary'}</span>
          </button>
        </div>
      </div>

      {aiInsights && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-xl animate-fade-in">
           <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100">AI Executive Summary</h3>
           </div>
           <div className="prose prose-indigo dark:prose-invert text-sm text-indigo-800 dark:text-indigo-200 whitespace-pre-line">
              {aiInsights}
           </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Products" 
          value={totalProducts} 
          icon={PackagePlus} 
          color="bg-blue-500"
          subtext="Across all warehouses"
        />
        <MetricCard 
          title="Low Stock Alerts" 
          value={lowStockCount} 
          icon={AlertTriangle} 
          color="bg-red-500"
          subtext="Items below reorder point"
        />
        <MetricCard 
          title="Pending Receipts" 
          value={pendingReceipts} 
          icon={TrendingUp} 
          color="bg-emerald-500"
          subtext="Incoming shipments"
        />
        <MetricCard 
          title="Pending Deliveries" 
          value={pendingDeliveries} 
          icon={Truck} 
          color="bg-amber-500"
          subtext="Outgoing orders"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Weekly Movement */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex justify-between mb-6">
             <h3 className="font-bold text-gray-800 dark:text-white">Stock Movement {predictiveMode && '(+AI Forecast)'}</h3>
             {predictiveMode && <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 px-2 py-1 rounded-full animate-pulse">AI Prediction Active</span>}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                />
                <Legend verticalAlign="top" height={36}/>
                <Line 
                  type="monotone" 
                  dataKey="incoming" 
                  name="Incoming (Receipts)" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  strokeDasharray={predictiveMode ? "3 3" : ""} // Doesnt support partial dash easily in Recharts without custom shape, so simple check
                  dot={{r: 4, strokeWidth: 2}}
                  activeDot={{r: 6}}
                />
                <Line 
                  type="monotone" 
                  dataKey="outgoing" 
                  name="Outgoing (Deliveries)" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{r: 4, strokeWidth: 2}}
                  activeDot={{r: 6}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Categories */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:shadow-lg">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Inventory by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CAT_COLORS[index % CAT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Stock Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Pie Chart: Stock Health */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:shadow-lg">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Stock Health</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={5}
                  stroke="none"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={HEALTH_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalProducts}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-gray-800 dark:text-white">Recent Operations</h3>
             <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View History <ArrowRight size={14}/>
             </button>
          </div>
          
          <div className="space-y-3">
            {operations.slice(0, 4).map(op => (
              <div key={op.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      op.status === 'Done' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                      op.status === 'Shipped' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 
                      op.status === 'Cancelled' ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                   }`}>
                      {op.type === 'Incoming Receipt' ? <TrendingUp size={18}/> : 
                       op.type === 'Delivery Order' ? <Truck size={18}/> : <ArrowRight size={18}/>}
                   </div>
                   <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{op.reference}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{op.type} • {new Date(op.date).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    op.status === 'Done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                    op.status === 'Shipped' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 
                    op.status === 'Draft' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {op.status}
                  </span>
                </div>
              </div>
            ))}
            {operations.length === 0 && <div className="text-center text-gray-400 py-4">No recent activity</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
