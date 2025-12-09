import React from 'react';

interface SkeletonProps {
    variant?: 'text' | 'rect' | 'circle' | 'card' | 'chart' | 'table';
    width?: string | number;
    height?: string | number;
    className?: string;
    count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ variant = 'text', width, height, className = '', count = 1 }) => {
    const baseClasses = "animate-pulse bg-slate-700/50 rounded";
    
    const getVariantClasses = () => {
        switch (variant) {
            case 'circle': return "rounded-full";
            case 'text': return "h-4 w-full mb-2 last:mb-0";
            case 'rect': return "w-full h-full";
            case 'card': return "w-full p-6 border border-slate-700/50 rounded-xl bg-slate-800/30";
            case 'chart': return "w-full h-64 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-end justify-between p-4 gap-2";
            case 'table': return "w-full";
            default: return "";
        }
    };

    const renderSingle = (key: number) => {
        if (variant === 'card') {
            return (
                <div key={key} className={`${getVariantClasses()} ${className}`} style={{ width, height }}>
                    <div className="h-6 w-1/3 bg-slate-700/50 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-slate-700/50 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-700/50 rounded"></div>
                        <div className="h-4 w-4/6 bg-slate-700/50 rounded"></div>
                    </div>
                </div>
            );
        }
        
        if (variant === 'chart') {
             return (
                <div key={key} className={`${getVariantClasses()} ${className}`} style={{ width, height }}>
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-full bg-slate-700/50 rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                    ))}
                </div>
            )
        }

        if (variant === 'table') {
            return (
                <div key={key} className={`w-full border border-slate-700/50 rounded-lg overflow-hidden ${className}`}>
                    <div className="bg-slate-800/50 h-10 w-full mb-1"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 border-b border-slate-700/30 last:border-0 bg-slate-900/20">
                            <div className="h-4 w-1/4 bg-slate-700/50 rounded"></div>
                            <div className="h-4 w-1/4 bg-slate-700/50 rounded"></div>
                            <div className="h-4 w-1/4 bg-slate-700/50 rounded"></div>
                            <div className="h-4 w-1/4 bg-slate-700/50 rounded"></div>
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <div 
                key={key} 
                className={`${baseClasses} ${getVariantClasses()} ${className}`}
                style={{ width, height }}
            ></div>
        );
    };

    if (count === 1) return renderSingle(0);

    return (
        <>
            {[...Array(count)].map((_, i) => renderSingle(i))}
        </>
    );
};