import { LucideIcon } from 'lucide-react';
import React from 'react';

interface ButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  title: string;
}

export const EditorButton: React.FC<ButtonProps> = ({ icon: Icon, onClick, isActive, title }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};
