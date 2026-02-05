/**
 * AI Status Indicator Component
 * 
 * Shows the current AI backend status:
 * - Connected/Disconnected indicator
 * - Available models
 * - Latency information
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity, Cpu, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAIHealth } from '../../hooks/useAI';
import { useSettingsStore } from '../../stores/settingsStore';
import { useShallow } from 'zustand/react/shallow';

interface AIStatusIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function AIStatusIndicator({
  showDetails = false,
  compact = false,
  className = '',
}: AIStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { health, isHealthy, isChecking, backendConnected, modelsAvailable, latency, errors, refresh } = useAIHealth();
  const reduceAnimations = useSettingsStore(useShallow((s) => s.settings.accessibility.reduceAnimations));

  if (compact) {
    // Compact version - just a status dot
    return (
      <div
        className={`flex items-center gap-1.5 ${className}`}
        title={isHealthy ? 'AI Connected' : 'AI Disconnected'}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isHealthy
              ? 'bg-emerald-400 animate-pulse'
              : backendConnected
              ? 'bg-amber-400'
              : 'bg-red-400'
          }`}
        />
        {!compact && (
          <span className="text-xs text-gray-500 dark:text-slate-300">
            {isHealthy ? 'AI Ready' : 'AI Offline'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Status Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          transition-all duration-200
          ${isHealthy
            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            : backendConnected
            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
          }
        `}
      >
        {isChecking ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : isHealthy ? (
          <Wifi className="w-4 h-4" />
        ) : backendConnected ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        
        <span className="text-sm font-medium">
          {isChecking ? 'Checking...' : isHealthy ? 'AI Ready' : 'AI Issue'}
        </span>
        
        {showDetails && (
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Expanded Details Panel */}
      <AnimatePresence>
        {showDetails && isExpanded && (
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceAnimations ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduceAnimations ? 0 : 0.2 }}
            className="absolute top-full mt-2 right-0 w-72 bg-gray-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 dark:border-slate-700/50 shadow-xl z-50"
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white dark:text-slate-100">AI Status</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refresh();
                  }}
                  className="p-1 text-gray-400 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors"
                  disabled={isChecking}
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  {backendConnected ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300 dark:text-slate-300">Backend</span>
                </div>
                <span className={`text-sm font-medium ${backendConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                  {backendConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Models Available */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 dark:text-slate-400 uppercase tracking-wide">Available Models</div>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      modelsAvailable.llama ? 'bg-blue-500/10' : 'bg-white/5'
                    }`}
                  >
                    <Cpu className={`w-4 h-4 ${modelsAvailable.llama ? 'text-blue-400' : 'text-gray-500 dark:text-slate-400'}`} />
                    <div>
                      <div className={`text-sm ${modelsAvailable.llama ? 'text-white dark:text-slate-100' : 'text-gray-400 dark:text-slate-400'}`}>
                        LLaMA
                      </div>
                      <div className={`text-xs ${modelsAvailable.llama ? 'text-blue-400 dark:text-blue-300' : 'text-gray-500 dark:text-slate-500'}`}>
                        {modelsAvailable.llama ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      modelsAvailable.mistral ? 'bg-purple-500/10' : 'bg-white/5'
                    }`}
                  >
                    <Cpu className={`w-4 h-4 ${modelsAvailable.mistral ? 'text-purple-400' : 'text-gray-500 dark:text-slate-400'}`} />
                    <div>
                      <div className={`text-sm ${modelsAvailable.mistral ? 'text-white dark:text-slate-100' : 'text-gray-400 dark:text-slate-400'}`}>
                        Mistral
                      </div>
                      <div className={`text-xs ${modelsAvailable.mistral ? 'text-purple-400 dark:text-purple-300' : 'text-gray-500 dark:text-slate-500'}`}>
                        {modelsAvailable.mistral ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latency */}
              {latency > 0 && (
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                    <span className="text-sm text-gray-300 dark:text-slate-300">Latency</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    latency < 500 ? 'text-emerald-400' :
                    latency < 1500 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {latency}ms
                  </span>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-xs text-red-400 font-medium mb-1">Errors</div>
                  {errors.slice(0, 2).map((error, index) => (
                    <div key={index} className="text-xs text-red-300 dark:text-red-400 truncate">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Last Checked */}
              {health?.lastChecked && (
                <div className="text-xs text-gray-400 dark:text-slate-500 text-center">
                  Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Inline AI Status for headers/toolbars
 */
export function AIStatusBadge({ className = '' }: { className?: string }) {
  const { isHealthy, backendConnected, isChecking } = useAIHealth();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        isChecking
          ? 'bg-gray-500/20 text-gray-400 dark:text-slate-300'
          : isHealthy
          ? 'bg-emerald-500/20 text-emerald-400'
          : backendConnected
          ? 'bg-amber-500/20 text-amber-400'
          : 'bg-red-500/20 text-red-400'
      } ${className}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isChecking
            ? 'bg-gray-400 animate-pulse'
            : isHealthy
            ? 'bg-emerald-400'
            : backendConnected
            ? 'bg-amber-400'
            : 'bg-red-400'
        }`}
      />
      {isChecking ? 'Checking' : isHealthy ? 'AI' : 'Offline'}
    </div>
  );
}
