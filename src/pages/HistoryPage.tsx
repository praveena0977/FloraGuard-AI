import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, Leaf, ShieldCheck, Trash2 } from 'lucide-react';
import { Prediction } from '../types';
import { cn } from '../lib/utils';

interface HistoryPageProps {
  predictions: Prediction[];
}

export function HistoryPage({ predictions }: HistoryPageProps) {
  return (
    <div className="min-h-screen pb-12 px-6 leaf-gradient">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-emerald-950 mb-2">Diagnosis History</h1>
            <p className="text-gray-600">Track your plant health journey over time.</p>
          </div>
          <div className="glass px-4 py-2 rounded-xl text-sm font-bold text-emerald-700">
            {predictions.length} Total Records
          </div>
        </header>

        {predictions.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-200 mx-auto mb-6">
              <Leaf size={40} />
            </div>
            <h3 className="text-2xl font-bold text-emerald-950 mb-2">No Records Found</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              You haven't performed any plant diagnoses yet. Start by uploading a leaf photo.
            </p>
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg">
              Start First Diagnosis
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {predictions.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.plantName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                  </div>
                  
                  <div className="flex-1 p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                          <Calendar size={12} />
                          {new Date(item.timestamp).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-950 mb-1">{item.diseaseName}</h3>
                        <p className="text-emerald-600 font-medium flex items-center gap-2">
                          <Leaf size={14} />
                          {item.plantName}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Confidence</div>
                          <div className="text-xl font-mono font-bold text-emerald-600">
                            {Math.round(item.confidence * 100)}%
                          </div>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <ShieldCheck size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
                        {item.description}
                      </p>
                      <button className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group/btn">
                        View Details
                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
