import { Loader2 } from 'lucide-react';

/** Centered spinner for inline/section loading states (e.g. while a query is loading). */
export default function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
    </div>
  );
}
