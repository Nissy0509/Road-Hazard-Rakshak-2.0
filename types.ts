export interface Hazard {
  type: 'Pothole' | 'Streetlight' | 'Waterlogging' | 'Traffic Sign' | 'Other';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  recommendation: string;
  suggestedSolution: string;
  estimatedCost: string;
  estimatedDuration: string;
  weatherImpact: string;
}

export interface AccidentStat {
  location: string;
  count: number;
  [key: string]: any;
}

export interface CauseStat {
  cause: string;
  count: number;
  [key: string]: any;
}

export interface TimeStat {
  period: 'Day' | 'Night';
  count: number;
  [key: string]: any;
}

export interface DataAnalysisResult {
  hotspots: AccidentStat[];
  commonCauses: CauseStat[];
  timeAnalysis: TimeStat[];
  summary: string;
}

export interface ComplaintData {
  hazard: Hazard;
  location: string;
  analysis: DataAnalysisResult;
}

export interface AnalysisState {
  isAnalyzingImage: boolean;
  isAnalyzingData: boolean;
  isDrafting: boolean;
  imageResult: Hazard | null;
  dataResult: DataAnalysisResult | null;
  complaintLetter: string | null;
  error: string | null;
}