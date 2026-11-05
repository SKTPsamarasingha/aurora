import React from 'react';

interface LoadingSpinnerProps {
    /** Size of the spinner ("sm", "md", "lg") or a custom pixel string/number */
    size?: 'sm' | 'md' | 'lg' | number;
    /** Custom color for the spinner track fill (Hex, RGB, or Tailwind class color) */
    color?: string;
    /** Optional text message to display under or beside the spinner */
    label?: string;
    /** Full-screen overlay mode */
    fullscreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                                  size = 'md',
                                                                  color = '#3b82f6', // Default Tailwind blue-500
                                                                  label,
                                                                  fullscreen = false,
                                                              }) => {
    // Map size presets to pixel values
    const getSizeDimensions = () => {
        switch (size) {
            case 'sm': return 24;
            case 'lg': return 64;
            case 'md':
            default:
                return typeof size === 'number' ? size : 40;
        }
    };

    const dimensions = getSizeDimensions();

    // Base spinner component
    const SpinnerSVG = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <svg
                width={dimensions}
                height={dimensions}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://w3.org"
                style={{
                    animation: 'spin 1s linear infinite',
                }}
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                    style={{ opacity: 0.25 }}
                />
                <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    style={{ color: color }}
                />
            </svg>

            {label && (
                <span style={{ fontSize: '14px', color: '#4b5563', fontFamily: 'sans-serif' }}>
          {label}
        </span>
            )}

            {/* Embedded keyframe animation fallback if not using Tailwind */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );

    // Render full screen wrapper if toggle is on
    if (fullscreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                {SpinnerSVG}
            </div>
        );
    }

    return SpinnerSVG;
};
