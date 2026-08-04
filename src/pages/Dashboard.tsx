import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, X, Sparkles, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { predictPlantDisease } from '../services/predictionService';
import { Prediction } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  onAddPrediction: (prediction: Prediction) => void;
}

export function Dashboard({ onAddPrediction }: DashboardProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Partial<Prediction> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    try {
      const diagnosis = await predictPlantDisease(image);
      const fullPrediction: Prediction = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        imageUrl: image,
        plantName: diagnosis.plantName || 'Unknown Plant',
        diseaseName: diagnosis.diseaseName || 'Unknown Condition',
        confidence: diagnosis.confidence || 0.85,
        description: diagnosis.description || 'No description provided.',
        recommendations: diagnosis.recommendations || [],
      };
      
      setResult(fullPrediction);
      onAddPrediction(fullPrediction);
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen pb-12 px-6 leaf-gradient">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-emerald-950 mb-2">Plant Diagnosis</h1>
          <p className="text-gray-600">Upload a photo of your plant's leaf for an instant AI health check.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <section className="space-y-6">
            <div 
              className={cn(
                "relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center text-center p-8",
                image ? "border-emerald-500 bg-emerald-50/30" : "border-gray-300 bg-white/50 hover:border-emerald-400 hover:bg-emerald-50/20"
              )}
            >
              {image ? (
                <>
                  <img src={image} alt="Upload" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20" />
                  <button 
                    onClick={reset}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-gray-900 shadow-lg hover:bg-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">Upload Leaf Photo</h3>
                  <p className="text-sm text-gray-500 mb-8 max-w-[240px]">
                    Drag and drop your image here, or click to browse files.
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                  >
                    Select Image
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </>
              )}
            </div>

            <button 
              disabled={!image || isAnalyzing}
              onClick={handleAnalyze}
              className={cn(
                "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl",
                !image || isAnalyzing 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-[0.98]"
              )}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Plant...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Start Diagnosis
                </>
              )}
            </button>
          </section>

          {/* Results Section */}
          <section>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-8"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                        <ShieldCheck size={12} />
                        Diagnosis Complete
                      </div>
                      <h2 className="text-3xl font-bold text-emerald-950">{result.diseaseName}</h2>
                      <p className="text-emerald-600 font-medium">{result.plantName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Confidence</div>
                      <div className="text-2xl font-mono font-bold text-emerald-600">
                        {Math.round((result.confidence || 0) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                    <AlertCircle className="text-amber-600 shrink-0" size={24} />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 mb-1">Description</h4>
                      <p className="text-sm text-amber-800/80 leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-4 ml-1">Treatment Plan</h4>
                    <div className="space-y-3">
                      {result.recommendations?.map((rec, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-emerald-100 group hover:bg-white transition-colors">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full py-4 rounded-2xl border-2 border-emerald-600 text-emerald-600 font-bold hover:bg-emerald-50 transition-all active:scale-[0.98]"
                  >
                    New Analysis
                  </button>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-center h-full min-h-[500px]"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full animate-ping absolute inset-0 opacity-20" />
                    <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
                      <Sparkles size={40} className="animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-950 mb-3">Analyzing Your Plant</h3>
                  <p className="text-gray-500 max-w-[280px]">
                    Our AI is scanning the leaf for patterns, discoloration, and disease markers...
                  </p>
                  
                  <div className="mt-12 w-full max-w-[240px] space-y-4">
                    {[
                      "Scanning leaf surface",
                      "Identifying plant species",
                      "Detecting fungal patterns",
                      "Generating treatment plan"
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-xs text-gray-400 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="glass p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-center h-full min-h-[500px] border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No Analysis Yet</h3>
                  <p className="text-sm text-gray-400 max-w-[240px]">
                    Upload an image and click "Start Diagnosis" to see the results here.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
