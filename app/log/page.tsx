'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';

const EMISSION_FACTORS: Record<string, Record<string, number>> = {
  Transport: { car: 0.21, bus: 0.08, train: 0.04, bike: 0, walk: 0 },
  Food: { beef: 7.0, chicken: 2.5, fish: 2.0, vegetarian: 1.2, vegan: 0.8 },
  Energy: { electricity: 0.4, heating: 0.2 },
  Waste: { recycled: -0.5, landfill: 0.6 },
};

// const API_URL = 'http://localhost:8000/api/activities/';
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/activities/`;

export default function LogActivity() {
  const router = useRouter();

  const [category, setCategory] = useState<'Transport' | 'Food' | 'Energy' | 'Waste' | ''>('');
  const [activityType, setActivityType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [co2Preview, setCo2Preview] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const calculateCO2 = () => {
    if (!category || !activityType || !quantity) {
      setCo2Preview(null);
      return;
    }
    const factor = EMISSION_FACTORS[category]?.[activityType.toLowerCase() as keyof typeof EMISSION_FACTORS['Transport']];
    if (factor === undefined) {
      setCo2Preview(null);
      return;
    }
    const co2 = factor * Number(quantity);
    setCo2Preview(Number(co2.toFixed(2)));
  };

  useState(() => calculateCO2());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !activityType || !quantity || co2Preview === null) return;

    setLoading(true);
    try {
      const details = `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} (${quantity} ${getUnit()})`;

      await axios.post(API_URL, {
        category,
        details,
        co2_estimate: co2Preview,
        date,
      });

      setShowSuccessModal(true);  // Show beautiful modal instead of alert
    } catch (error) {
      console.error(error);
      alert('Error saving activity. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  const getUnit = () => {
    if (category === 'Transport') return 'km';
    if (category === 'Energy') return 'hours/kWh';
    return 'servings/items';
  };

  const getOptions = () => {
    if (!category) return [];
    return Object.keys(EMISSION_FACTORS[category] || {});
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD5D5] to-[#ffffff] py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h1 className="text-4xl font-bold text-center text-[#3A6F43] mb-8">
            Log New Activity
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* All your existing form fields — unchanged */}
            <div>
              <label className="block text-lg font-medium text-[#3A6F43] mb-3">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value as any); setActivityType(''); setQuantity(''); setCo2Preview(null); }} className="w-full px-5 py-4 border border-[#FDAAAA] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FDAAAA] bg-white text-[#3A6F43] cursor-pointer text-lg" required>
                <option value="">Select category</option>
                <option>Transport</option>
                <option>Food</option>
                <option>Energy</option>
                <option>Waste</option>
              </select>
            </div>

            {category && (
              <div>
                <label className="block text-lg font-medium text-[#3A6F43] mb-3">Activity</label>
                <select value={activityType} onChange={(e) => { setActivityType(e.target.value); calculateCO2(); }} className="w-full px-5 py-4 border border-[#FDAAAA] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FDAAAA] bg-white text-[#3A6F43] cursor-pointer text-lg" required>
                  <option value="">Choose...</option>
                  {getOptions().map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                </select>
              </div>
            )}

            {activityType && (
              <div>
                <label className="block text-lg font-medium text-[#3A6F43] mb-3">Quantity ({getUnit()})</label>
                <input type="number" min="0" step="0.1" value={quantity} onChange={(e) => { setQuantity(e.target.value); calculateCO2(); }} className="w-full px-5 py-4 border border-[#FDAAAA] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FDAAAA] bg-white text-[#3A6F43] placeholder-[#3A6F43]/60 text-lg" required />
              </div>
            )}

            <div>
              <label className="block text-lg font-medium text-[#3A6F43] mb-3">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-4 border border-[#FDAAAA] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FDAAAA] bg-white text-[#3A6F43] text-lg" required />
            </div>

            {co2Preview !== null && (
              <div className="bg-gradient-to-r from-[#FFD5D5] to-[#FDAAAA]/30 rounded-2xl p-6 text-center">
                <p className="text-lg text-[#3A6F43]">Estimated impact</p>
                <p className={`text-5xl font-bold mt-2 ${co2Preview > 0 ? 'text-red-600' : 'text-[#59AC77]'}`}>
                  {co2Preview > 0 ? '+' : ''}{co2Preview} kg CO₂
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button type="submit" disabled={loading} className="flex-1 bg-[#3A6F43] hover:bg-[#59AC77] disabled:opacity-70 text-white font-bold py-5 rounded-xl shadow-lg transition transform hover:scale-105 text-xl cursor-pointer">
                {loading ? 'Saving...' : 'Log Activity'}
              </button>
              <button type="button" onClick={() => router.push('/')} className="px-8 py-5 border border-[#FDAAAA] rounded-xl font-medium hover:bg-[#FDAAAA]/20 transition cursor-pointer text-[#3A6F43]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Beautiful Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={closeModal}>
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              {/* Checkmark SVG */}
              <svg className="w-24 h-24 mx-auto mb-6 text-[#59AC77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              
              <h2 className="text-3xl font-bold text-[#3A6F43] mb-4">Activity Logged Successfully!</h2>
              <p className="text-lg text-[#3A6F43]/80 mb-8">
                {co2Preview !== null && `${co2Preview > 0 ? '+' : ''}${co2Preview} kg CO₂`} recorded
              </p>
              
              <button
                onClick={closeModal}
                className="bg-[#3A6F43] hover:bg-[#59AC77] text-white font-bold px-10 py-4 rounded-xl shadow-lg transition transform hover:scale-105 cursor-pointer"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple CSS animations (add to your globals.css or here) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}