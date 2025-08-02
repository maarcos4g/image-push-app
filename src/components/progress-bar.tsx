import { CloudUpload } from "lucide-react"

export interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div
    className="w-full space-y-2"
    >
      <div
        role="progressbar"
        aria-valuemax={100}
        aria-valuenow={progress}
        className="w-full h-2 rounded-sm bg-white/10"
      >
        <div
          className="h-2 rounded-sm bg-violet-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <CloudUpload className="text-white size-4" />
        <span>{progress}%</span>
      </div>
    </div>
  )
}