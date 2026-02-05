import { useNavigate } from 'react-router-dom';
import { Settings, User } from 'lucide-react';
import { useProfilePanelStore } from '../../stores/profilePanelStore';
import SkipToMainInHeader from '../common/SkipToMainInHeader';

/**
 * Minimal global header: AIra branding (left), Settings + Profile (right).
 * No title, notebook, analytics, share, PRO badge, or overflow menu.
 * Height 56–64px; horizontal padding aligned to AppShell; icon spacing 12–16px.
 */
export default function GlobalHeader() {
    const navigate = useNavigate();
    
    return (
        <header
            className="shrink-0 safe-top z-20 flex items-center w-full bg-transparent"
            style={{
                height: 'var(--layout-header-height)',
                paddingLeft: 'var(--layout-page-px)',
                paddingRight: 'var(--layout-page-px)',
            }}
        >
            <SkipToMainInHeader />
            <div className="flex items-center justify-between w-full h-full min-w-0 flex-1" style={{ minHeight: 'var(--layout-header-height)' }}>
                <div className="flex items-center min-w-0 gap-3.5">
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        AIra
                    </span>
                </div>
                <div className="flex items-center min-w-0 shrink-0 gap-3.5">
                    <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-slate-300 touch-manipulation"
                        title="Settings"
                        aria-label="Settings"
                    >
                        <Settings className="w-5 h-5 shrink-0" aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={() => useProfilePanelStore.getState().open()}
                        className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors w-9 h-9 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
                        title="Profile"
                        aria-label="Open Profile Settings"
                    >
                        <User className="w-5 h-5 flex-shrink-0" aria-hidden />
                    </button>
                </div>
            </div>
        </header>
    );
}
