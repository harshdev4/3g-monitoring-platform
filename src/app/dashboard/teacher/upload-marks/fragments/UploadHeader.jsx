"use client";

export default function UploadHeader({ currentPhase, onViewHistory }) {
  const steps = [
    '1 Select assessment', 
    '2 Upload file', 
    '3 Validate & preview', 
    '4 Confirm submission'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">Teacher workspace</p>
          <h1 className="text-2xl font-semibold text-[#0f172a] mt-1">Upload Marks</h1>
          <p className="text-xs font-normal text-slate-500 mt-1">
            Import assessment marks, validate student records and publish a checkpoint.
          </p>
        </div>
        <button 
          onClick={onViewHistory}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition shadow-sm"
        >
          View Upload History
        </button>
      </div>

      {/* Stepper */}
      <div className="flex flex-col sm:flex-row gap-3">
        {steps.map((step, idx) => {
          // Highlight active step based on currentPhase (1-indexed)
          const isActive = currentPhase === idx + 1;

          return (
            <div 
              key={idx} 
              className={`flex-1 border rounded-lg p-3 text-xs transition-colors ${
                isActive 
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 font-semibold' 
                  : 'bg-white border-slate-200 text-slate-500 font-medium'
              }`}
            >
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}