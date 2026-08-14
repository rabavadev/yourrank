import React from 'react';
import { PricingComparisonTable } from './pricing-comparison-table';

export default function PricingComparisonTableDemo() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-4 text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Flexible Plans Built for Streamers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-base max-w-2xl mx-auto">
          Start free, upgrade as your audience and tournaments grow. All plans include automated leaderboard updates and viewer sync.
        </p>
      </div>
      <PricingComparisonTable />
    </div>
  );
}
