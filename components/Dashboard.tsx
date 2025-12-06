import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DataAnalysisResult, Hazard } from '../types';
import { AlertTriangle, MapPin, Clock, FileText, Wrench, DollarSign, CloudRain, ShieldAlert, CheckCircle } from 'lucide-react';

interface DashboardProps {
  imageResult: Hazard | null;
  dataResult: DataAnalysisResult | null;
  complaintLetter: string | null;
}

const COLORS = ['#0ea5e9', '#ef4444', '#eab308', '#22c55e', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ imageResult, dataResult, complaintLetter }) => {
  if (!imageResult && !dataResult && !complaintLetter) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Module 1: Image Analysis Results */}
      {imageResult && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${
                imageResult.severity === 'High' ? 'text-red-600' : 
                imageResult.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'
              }`} />
              <h2 className="text-lg font-bold text-slate-800">Visual Inspection Report</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                imageResult.severity === 'High' ? 'bg-red-100 text-red-700' : 
                imageResult.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {imageResult.severity} Severity
            </span>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Hazard Detected</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{imageResult.type}</p>
              </div>
              
              <div>
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Description</span>
                  <p className="mt-2 text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {imageResult.description}
                  </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Immediate Action</span>
                <div className="mt-2 flex items-start gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{imageResult.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               {/* Efficient Recovery Plan */}
               <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold mb-4 border-b border-indigo-200/50 pb-2">
                     <Wrench className="w-5 h-5 text-indigo-600" />
                     <h3>Efficient Recovery Plan</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase">Technical Solution</span>
                      <p className="text-sm text-indigo-900 font-medium mt-1">{imageResult.suggestedSolution}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                          <span className="text-xs font-semibold text-indigo-400 uppercase flex items-center gap-1 mb-1">
                             <DollarSign className="w-3 h-3" /> Low Budget Est.
                          </span>
                          <p className="text-base font-bold text-indigo-900">{imageResult.estimatedCost}</p>
                       </div>
                       <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                          <span className="text-xs font-semibold text-indigo-400 uppercase flex items-center gap-1 mb-1">
                             <Clock className="w-3 h-3" /> Time Limit
                          </span>
                          <p className="text-base font-bold text-indigo-900">{imageResult.estimatedDuration}</p>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Weather Impact Prediction */}
               <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                   <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                      <CloudRain className="w-5 h-5 text-amber-600" />
                      <h3>Adverse Weather Prediction</h3>
                   </div>
                   <p className="text-sm text-amber-900 leading-relaxed">{imageResult.weatherImpact}</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: Data Analysis Results */}
      {dataResult && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Safety Data Correlation</h2>
          </div>

          <div className="p-6">
            <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-lg">
               <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 block">AI Data Summary</span>
               <p className="text-slate-700 text-sm leading-relaxed">{dataResult.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Hotspots Chart */}
              <div className="h-64 flex flex-col">
                <h3 className="text-xs font-bold uppercase text-center text-slate-500 mb-4">Accident Hotspots</h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataResult.hotspots} layout="vertical" margin={{ left: 40, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="location" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Causes Chart */}
              <div className="h-64 flex flex-col">
                <h3 className="text-xs font-bold uppercase text-center text-slate-500 mb-4">Primary Causes</h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataResult.commonCauses}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="cause"
                      >
                        {dataResult.commonCauses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Analysis */}
              <div className="h-64 flex flex-col">
                <h3 className="text-xs font-bold uppercase text-center text-slate-500 mb-4">Time of Day Risk</h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataResult.timeAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="period" tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 3: Generated Letter */}
      {complaintLetter && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-800">Generated Action Letter</h2>
            </div>
            <button 
              onClick={() => {
                const blob = new Blob([complaintLetter], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'municipal_complaint.txt';
                a.click();
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition-colors shadow-sm flex items-center gap-2"
            >
              Download Draft
            </button>
          </div>
          <div className="p-8 bg-white">
            <div className="prose prose-sm max-w-none font-mono text-slate-700 whitespace-pre-wrap leading-relaxed p-6 border border-slate-100 rounded-lg bg-slate-50/50">
              {complaintLetter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};