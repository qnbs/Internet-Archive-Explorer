import React from 'react';

interface ChartData {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: ChartData[];
    size?: number;
    strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 150, strokeWidth = 15 }) => {
    if (data.length === 0) {
        return <div className="text-center text-sm text-gray-500 py-10">No data available</div>;
    }
    
    const halfsize = size / 2;
    const radius = halfsize - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((acc, item) => acc + item.value, 0);
    
    let filled = 0;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={halfsize}
                        cy={halfsize}
                        r={radius}
                        fill="none"
                        stroke="#374151" // gray-700
                        strokeWidth={strokeWidth}
                    />
                    {data.map((item, index) => {
                        const dashoffset = circumference * (1 - filled);
                        const dasharray = (circumference * item.value) / total;
                        filled += item.value / total;
                        
                        return (
                            <circle
                                key={index}
                                cx={halfsize}
                                cy={halfsize}
                                r={radius}
                                fill="none"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dasharray} ${circumference - dasharray}`}
                                strokeDashoffset={-dashoffset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${halfsize} ${halfsize})`}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="flex flex-wrap sm:flex-col gap-2 justify-center">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center text-xs">
                        <span style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-sm mr-2"></span>
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-semibold text-white ml-2">
                            {((item.value / total) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};