import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
    </div>
  );
}
