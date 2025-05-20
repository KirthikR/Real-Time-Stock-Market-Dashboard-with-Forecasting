import React from 'react';
import { Briefcase } from 'lucide-react';

const Portfolio: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Briefcase className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold">Your Portfolio</h2>
      </div>
      
      <div className="text-center py-8 text-slate-400">
        <p>Portfolio component is working correctly.</p>
      </div>
    </div>
  );
};

export default Portfolio;
