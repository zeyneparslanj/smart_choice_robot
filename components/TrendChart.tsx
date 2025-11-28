
import React, { useState } from 'react';
import { JobTrend } from '../types';

interface TrendChartProps {
  trend: JobTrend;
}

const TrendChart: React.FC<TrendChartProps> = ({ trend }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const data = trend.data;
  const height = 300;
  const width = 600;
  const padding = 40;

  // Scales
  const minScore = Math.min(...data.map(d => d.score)) - 1;
  const maxScore = Math.max(...data.map(d => d.score)) + 1;
  
  const getX = (index: number) => padding + (index * (width - 2 * padding) / (data.length - 1));
  const getY = (score: number) => height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);

  // Path Generation
  const pathData = data.map((point, i) => 
    `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.score)}`
  ).join(' ');

  // Gradient Area Path
  const areaPathData = `
    ${pathData}
    L ${getX(data.length - 1)} ${height - padding}
    L ${getX(0)} ${height - padding}
    Z
  `;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center">
                {trend.title}
                <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Son 4 Dönem</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">Atama taban puanlarının yıllara göre değişimi.</p>
        </div>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${
            data[data.length-1].score < data[0].score ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
            {data[data.length-1].score < data[0].score ? '▼ Puan Düşüyor' : '▲ Puan Artıyor'}
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines Y */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
             const yVal = height - padding - (ratio * (height - 2 * padding));
             const scoreLabel = minScore + ratio * (maxScore - minScore);
             return (
               <g key={i}>
                 <line x1={padding} y1={yVal} x2={width - padding} y2={yVal} stroke="#e5e7eb" strokeDasharray="4" />
                 <text x={padding - 10} y={yVal + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-mono">
                   {scoreLabel.toFixed(1)}
                 </text>
               </g>
             )
          })}

          {/* Area Fill */}
          <path d={areaPathData} fill="url(#chartGradient)" />

          {/* Line */}
          <path d={pathData} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Tooltips */}
          {data.map((point, i) => {
            const x = getX(i);
            const y = getY(point.score);
            const isHovered = hoveredPoint === i;

            return (
              <g key={i} 
                 onMouseEnter={() => setHoveredPoint(i)}
                 onMouseLeave={() => setHoveredPoint(null)}
                 className="cursor-pointer"
              >
                <circle 
                    cx={x} cy={y} r={6} 
                    fill="#fff" stroke="#4f46e5" strokeWidth="3" 
                    className="transition-all duration-300 hover:r-8"
                />
                
                {/* Period Label X-Axis */}
                <text x={x} y={height - padding + 20} textAnchor="middle" className="text-[10px] fill-gray-500 font-bold">
                    {point.period}
                </text>

                {/* Tooltip */}
                <g className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
                    <rect x={x - 30} y={y - 45} width="60" height="35" rx="6" fill="#1f2937" />
                    <text x={x} y={y - 23} textAnchor="middle" fill="#fff" className="text-xs font-bold">
                        {point.score}
                    </text>
                    {/* Triangle */}
                    <path d={`M ${x} ${y - 10} L ${x - 5} ${y - 10} L ${x} ${y - 5} L ${x + 5} ${y - 10} Z`} fill="#1f2937" />
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default TrendChart;
