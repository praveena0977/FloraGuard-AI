import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Sprout, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen pb-12 overflow-hidden leaf-gradient">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Sprout size={14} />
            AI-Powered Plant Care
          </div>
          <h1 className="font-serif text-7xl lg:text-8xl font-bold leading-[0.9] mb-8 text-emerald-950">
            Protect Your <br />
            <span className="italic text-emerald-600">Green Sanctuary</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
            FloraGuard uses a deep learning model to diagnose plant diseases in seconds.
            Upload a photo of a leaf and get instant expert advice to save your plants.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              to="/auth" 
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl hover:shadow-emerald-200 active:scale-95"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
            <button className="px-8 py-4 rounded-2xl font-bold text-emerald-900 hover:bg-emerald-50 transition-all">
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=1000&auto=format&fit=crop" 
              alt="Healthy Plant" 
              className="w-full h-[600px] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent" />
          </div>
          
          {/* Floating Stats Card */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 z-20 glass p-6 rounded-3xl shadow-2xl max-w-[240px]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Accuracy</div>
                <div className="text-xl font-bold text-emerald-900">99.8%</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-tight">
              Trained on millions of plant images for precise disease identification.
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-50 -z-10" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-50 -z-10" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl font-bold text-emerald-950 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Three simple steps to professional-grade plant health monitoring.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="text-amber-500" />,
              title: "Snap a Photo",
              desc: "Take a clear picture of the affected leaf using your phone or camera."
            },
            {
              icon: <ShieldCheck className="text-emerald-500" />,
              title: "AI Analysis",
              desc: "Our AI model identifies the disease and its severity instantly."
            },
            {
              icon: <Sprout className="text-blue-500" />,
              title: "Get Cure",
              desc: "Receive detailed organic and chemical treatment recommendations."
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-[2rem] hover:shadow-2xl transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Leaf Info Section */}
      <section className="max-w-7xl mx-auto px-6 mt-32 bg-emerald-950 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-5xl font-bold mb-8 leading-tight">
              Why Leaf Health <br />
              <span className="italic text-emerald-400">Matters Most</span>
            </h2>
            <div className="space-y-6">
              {[
                "Early detection prevents entire crop failure",
                "Healthy leaves mean better photosynthesis",
                "Reduces the need for heavy chemical pesticides",
                "Sustainable gardening starts with monitoring"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                    <ChevronRight size={16} />
                  </div>
                  <span className="text-emerald-100/80">{text}</span>
                </div>
              ))}
            </div>
            <button className="mt-10 bg-white text-emerald-950 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all">
              Read Our Guide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=500&auto=format&fit=crop" className="rounded-3xl h-64 w-full object-cover" alt="Plant Leaf" referrerPolicy="no-referrer" />
            <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=500&auto=format&fit=crop" className="rounded-3xl h-64 w-full object-cover mt-8" alt="Greenhouse" referrerPolicy="no-referrer" />
          </div>
        </div>
        
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>
      </section>
    </div>
  );
}
