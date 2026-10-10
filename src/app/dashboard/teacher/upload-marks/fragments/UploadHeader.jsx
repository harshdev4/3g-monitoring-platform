"use client";

export default function UploadHeader({ currentPhase, onViewHistory }) {
  const steps = [
    '1 Select assessment', 
    '2 Upload file', 
    '3 Validate & preview', 
    '4 Confirm submission'
  ];

  return (
    <div className="space-y-6  ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 ">
        <div>
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Teacher workspace</p>
          <h1 className="text-2xl font-bold text-[#0f172a] mt-1">Upload Marks</h1>
          <p className="text-[13px] font-normal text-slate-500 mt-1">
            Import assessment marks, validate student records and publish a checkpoint.
          </p>
        </div>
        <button 
          onClick={onViewHistory} // <-- Attach to button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-[13px] transition shadow-sm"
        >View Upload History</button>
      </div>

      {/* Stepper */}
      <div className="flex flex-col sm:flex-row gap-3">
        {steps.map((step, idx) => {
          // Determine active state mapping based on currentPhase
          let isActive = false;
          if (currentPhase === 1 && idx === 1) isActive = true; // Phase 1 highlights Step 2
          if (currentPhase === 2 && idx === 2) isActive = true; // Phase 2 highlights Step 3
          if (currentPhase === 3 && idx === 3) isActive = true; // Phase 3 highlights Step 4

          return (
            <div 
              key={idx} 
              className={`flex-1 border rounded-lg p-3 text-[13px] transition-colors ${
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