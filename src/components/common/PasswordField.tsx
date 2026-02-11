import { useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getPasswordStrengthChecklist } from '../../utils/validation';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Show strength bar/checklist (e.g. on signup). */
  showStrength?: boolean;
  minLength?: number;
  className?: string;
  inputClassName?: string;
}

export default function PasswordField({
  value,
  onChange,
  placeholder = 'Password',
  disabled,
  id,
  showStrength = false,
  minLength = 8,
  className = '',
  inputClassName = '',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = useMemo(
    () => (showStrength ? getPasswordStrengthChecklist(value, minLength) : null),
    [showStrength, value, minLength]
  );

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg dark:text-slate-100 ${inputClassName}`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && strength && value.length > 0 && (
        <div className="mt-2 space-y-1.5">
          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
            <div
              className="bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${strength.score}%` }}
            />
          </div>
          <ul className="text-xs text-gray-600 dark:text-slate-400 space-y-0.5">
            {strength.checks.map((c, i) => (
              <li
                key={i}
                className={`flex items-center gap-1.5 ${c.met ? 'text-green-600 dark:text-green-400' : ''}`}
              >
                <span className={c.met ? 'opacity-100' : 'opacity-50'}>
                  {c.met ? '✓' : '○'}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
