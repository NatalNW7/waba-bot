"use client";

interface OnboardingProgressProps {
  steps: readonly string[];
  currentStepIndex: number;
}

export function OnboardingProgress({
  steps,
  currentStepIndex,
}: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStepIndex >= i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ml-2 transition-colors ${
                  currentStepIndex > i ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
