import React, { useState, useCallback, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { AnalysisState } from './types';
import { Upload, FileSpreadsheet, Send, Loader2, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';

const App: React.FC = () => {
  const [geminiService] = useState(() => new GeminiService());
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  
  const [state, setState] = useState<AnalysisState>({
    isAnalyzingImage: false,
    isAnalyzingData: false,
    isDrafting: false,
    imageResult: null,
    dataResult: null,
    complaintLetter: null,
    error: null
  });

  // Step 2: Image Upload & Analysis
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      setState(prev => ({ ...prev, isAnalyzingImage: true, error: null }));
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        setUploadedImage(base64String);

        try {
          const result = await geminiService.analyzeImage(base64Data);
          setState(prev => ({ ...prev, imageResult: result, isAnalyzingImage: false }));
          setActiveStep(2); // Move to next step
        } catch (err) {
          setState(prev => ({ ...prev, isAnalyzingImage: false, error: "Failed to analyze image. Check API key configuration." }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 3: CSV Upload & Analysis
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setState(prev => ({ ...prev, isAnalyzingData: true, error: null }));

      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          // Convert first 50 rows back to CSV string for the AI context
          const dataSubset = Papa.unparse(results.data.slice(0, 50));
          
          try {
            const result = await geminiService.analyzeCSV(dataSubset);
            setState(prev => ({ ...prev, dataResult: result, isAnalyzingData: false }));
          } catch (err) {
            setState(prev => ({ ...prev, isAnalyzingData: false, error: "Failed to analyze CSV data." }));
          }
        },
        error: () => {
          setState(prev => ({ ...prev, isAnalyzingData: false, error: "Failed to parse CSV file." }));
        }
      });
    }
  };

  // Step 4: Generate Letter
  const generateLetter = async () => {
    if (state.imageResult && state.dataResult) {
      setState(prev => ({ ...prev, isDrafting: true, error: null }));
      try {
        const letter = await geminiService.generateComplaint(
          state.imageResult, 
          state.dataResult, 
          locationName || "the specified location"
        );
        setState(prev => ({ ...prev, complaintLetter: letter, isDrafting: false }));
      } catch (err) {
        setState(prev => ({ ...prev, isDrafting: false, error: "Failed to generate letter." }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              IG
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              InfraGuard AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
               <CheckCircle2 className="w-3 h-3" /> System Ready
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <span className="font-bold">Error:</span> {state.error}
          </div>
        )}

        {/* Main Interface */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Module 1: Image Input */}
            <div className={`p-6 bg-white rounded-xl shadow-sm border transition-all ${activeStep === 1 ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">1. Visual Inspection</h3>
                {state.imageResult && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              
              {uploadedImage ? (
                <div className="relative rounded-lg overflow-hidden h-48 mb-4 border border-slate-200">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => { setUploadedImage(null); setState(prev => ({...prev, imageResult: null})); }}
                    className="absolute top-2 right-2 bg-white/90 p-1 rounded-full text-slate-600 hover:text-red-600"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Upload Street View (JPG/PNG)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}

              {state.isAnalyzingImage && (
                <div className="flex items-center justify-center gap-2 text-indigo-600 mt-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Detecting hazards...</span>
                </div>
              )}
            </div>

            {/* Module 2: Data Input */}
            <div className={`p-6 bg-white rounded-xl shadow-sm border transition-all ${activeStep === 2 ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">2. Safety Data Correlation</h3>
                {state.dataResult && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Location Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MG Road, Indiranagar"
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Accident Dataset (CSV)</label>
                  <label className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md border border-slate-300 cursor-pointer hover:bg-slate-50">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 truncate">Upload CSV File...</span>
                    <input type="file" className="hidden" accept=".csv" onChange={handleCsvUpload} />
                  </label>
                </div>
              </div>

              {state.isAnalyzingData && (
                <div className="flex items-center justify-center gap-2 text-indigo-600 mt-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Analyzing patterns...</span>
                </div>
              )}
            </div>

            {/* Module 3: Action */}
            <button
              onClick={generateLetter}
              disabled={!state.imageResult || !state.dataResult || state.isDrafting}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {state.isDrafting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Drafting Complaint...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate Complaint Letter
                </>
              )}
            </button>

            <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 leading-relaxed">
              <strong>Tip:</strong> Ensure your CSV has headers like <code>Location</code>, <code>Time</code>, <code>Severity</code>, <code>Cause</code> for best results.
            </div>

          </div>

          {/* Right Panel: Dashboard Results */}
          <div className="lg:col-span-8">
            {!state.imageResult && !state.dataResult ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-medium">Analysis results will appear here</p>
              </div>
            ) : (
              <Dashboard 
                imageResult={state.imageResult}
                dataResult={state.dataResult}
                complaintLetter={state.complaintLetter}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;