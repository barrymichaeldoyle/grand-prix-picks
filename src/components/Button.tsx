import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors cursor-pointer';

const variants = {
  primary:
    'bg-button-accent hover:bg-button-accent-hover text-white disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed',
  saved:
    'bg-success-muted text-success border border-success/30 cursor-default',
  loading: 'bg-button-accent text-white opacity-90 cursor-wait',
} as const;

const sizes = {
  sm: 'px-6 py-2 text-base',
  md: 'px-6 py-3 text-base',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** When true, renders saved (success) state and disables the button. */
  saved?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      saved = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const effectiveVariant = saved ? 'saved' : loading ? 'loading' : variant;
    const isDisabled = disabled || loading || saved;

    const resolvedClassName = [
      base,
      sizes[size],
      variants[effectiveVariant],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={resolvedClassName}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin shrink-0" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;

/** Class names for styling a link as a primary button (e.g. Link from react-router). */
export function primaryButtonStyles(size: ButtonSize = 'md'): string {
  return [
    base,
    sizes[size],
    'bg-button-accent hover:bg-button-accent-hover text-white',
  ].join(' ');
}
