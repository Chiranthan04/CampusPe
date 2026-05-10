export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent
                        border-t-primary animate-spin" />
        <div className="absolute inset-3 rounded-full gradient-bg opacity-20
                        animate-pulse-slow" />
      </div>
      <p className="text-gray-500 font-medium text-sm">{message}</p>
      <p className="text-gray-300 text-xs mt-1">Please wait...</p>
    </div>
  )
}
