import { LucideIcon } from 'lucide-react';
import React, { useCallback } from 'react';

interface ButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  title: string;
  disabled?: boolean;
  className?: string;
}

export const EditorButton: React.FC<ButtonProps> = ({
  icon: Icon,
  onClick,
  isActive,
  title,
  disabled = false,
  className = '',
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={title}
      disabled={disabled}
      aria-label={title}
      aria-pressed={isActive}
      className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        isActive
          ? 'bg-indigo-600 text-white'
          : disabled
          ? 'text-gray-600 cursor-not-allowed'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      } ${className}`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </button>
  );
};
