export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 