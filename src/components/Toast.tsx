import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiXCircle,
  FiX,
  FiBell
} from 'react-icons/fi';

export interface ToastProps {
  message: string;
  type: 'green' | 'red' | 'amber' | 'blue';
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showIcon?: boolean;
  showCloseButton?: boolean;
  progress?: boolean;
}

interface ToastStyle extends React.CSSProperties {
  '--toast-bg'?: string;
  '--toast-border'?: string;
  '--toast-icon'?: string;
  '--toast-progress'?: string;
  '--toast-glow'?: string;
}

export default function Toast({ 
  message, 
  type, 
  duration = 3000, 
  onClose,
  position = 'bottom-right',
  showIcon = true,
  showCloseButton = true,
  progress = true
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progressValue, setProgressValue] = useState(100);

  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;
      
      if (newProgress <= 0) {
        setProgressValue(0);
        return;
      }
      
      setProgressValue(newProgress);
      animationFrame = requestAnimationFrame(updateProgress);
    };

    if (progress) {
      animationFrame = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration, progress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'green':
        return <FiCheckCircle {...iconProps} />;
      case 'red':
        return <FiXCircle {...iconProps} />;
      case 'amber':
        return <FiAlertCircle {...iconProps} />;
      case 'blue':
        return <FiInfo {...iconProps} />;
      default:
        return <FiBell {...iconProps} />;
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case 'green':
        return {
          bg: 'linear-gradient(135deg, rgba(57, 211, 83, 0.1) 0%, rgba(57, 211, 83, 0.05) 100%)',
          border: 'rgba(57, 211, 83, 0.3)',
          icon: '#39d353',
          progress: '#39d353',
          glow: '0 0 20px rgba(57, 211, 83, 0.2)'
        };
      case 'red':
        return {
          bg: 'linear-gradient(135deg, rgba(248, 81, 73, 0.1) 0%, rgba(248, 81, 73, 0.05) 100%)',
          border: 'rgba(248, 81, 73, 0.3)',
          icon: '#f85149',
          progress: '#f85149',
          glow: '0 0 20px rgba(248, 81, 73, 0.2)'
        };
      case 'amber':
        return {
          bg: 'linear-gradient(135deg, rgba(227, 179, 65, 0.1) 0%, rgba(227, 179, 65, 0.05) 100%)',
          border: 'rgba(227, 179, 65, 0.3)',
          icon: '#e3b341',
          progress: '#e3b341',
          glow: '0 0 20px rgba(227, 179, 65, 0.2)'
        };
      case 'blue':
        return {
          bg: 'linear-gradient(135deg, rgba(56, 139, 253, 0.1) 0%, rgba(56, 139, 253, 0.05) 100%)',
          border: 'rgba(56, 139, 253, 0.3)',
          icon: '#388bfd',
          progress: '#388bfd',
          glow: '0 0 20px rgba(56, 139, 253, 0.2)'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(139, 148, 158, 0.1) 0%, rgba(139, 148, 158, 0.05) 100%)',
          border: 'rgba(139, 148, 158, 0.3)',
          icon: '#8b949e',
          progress: '#8b949e',
          glow: '0 0 20px rgba(139, 148, 158, 0.2)'
        };
    }
  };

  const colors = getGradientColors();

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top-left':
        return { top: 24, left: 24 };
      case 'top-right':
        return { top: 24, right: 24 };
      case 'top-center':
        return { top: 24, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-left':
        return { bottom: 24, left: 24 };
      case 'bottom-center':
        return { bottom: 24, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
      default:
        return { bottom: 24, right: 24 };
    }
  };

  const getAnimationStyles = () => {
    if (isExiting) {
      switch (position) {
        case 'top-left':
        case 'bottom-left':
          return { animation: 'slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' };
        case 'top-center':
          return { animation: 'slideOutUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' };
        case 'bottom-center':
          return { animation: 'slideOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' };
        case 'top-right':
        case 'bottom-right':
        default:
          return { animation: 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' };
      }
    } else {
      switch (position) {
        case 'top-left':
        case 'bottom-left':
          return { animation: 'slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
        case 'top-center':
          return { animation: 'slideInDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
        case 'bottom-center':
          return { animation: 'slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
        case 'top-right':
        case 'bottom-right':
        default:
          return { animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
      }
    }
  };

  const toastStyle: ToastStyle = {
    ...getPositionStyles(),
    ...getAnimationStyles(),
    '--toast-bg': colors.bg,
    '--toast-border': colors.border,
    '--toast-icon': colors.icon,
    '--toast-progress': colors.progress,
    '--toast-glow': colors.glow
  };

  return (
    <div className="toast" style={toastStyle}>
      <div className="toast-content">
        {showIcon && (
          <div className="toast-icon-wrapper" style={{ color: colors.icon }}>
            {getIcon()}
          </div>
        )}
        
        <div className="toast-message-wrapper">
          <div className="toast-message">{message}</div>
          <div className="toast-time">À l'instant</div>
        </div>

        {showCloseButton && (
          <button 
            className="toast-close"
            onClick={handleClose}
            aria-label="Fermer"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {progress && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar"
            style={{ 
              width: `${progressValue}%`,
              background: `linear-gradient(90deg, ${colors.progress}, ${colors.progress}88)`
            }}
          />
        </div>
      )}

      <style>{`
        .toast {
          position: fixed;
          z-index: 9999;
          min-width: 320px;
          max-width: 400px;
          background: #1c2330;
          border: 1px solid var(--toast-border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), var(--toast-glow);
          backdrop-filter: blur(10px);
        }

        .toast-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--toast-bg);
        }

        .toast-icon-wrapper {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          animation: iconPop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toast-message-wrapper {
          flex: 1;
        }

        .toast-message {
          font-size: 13px;
          font-weight: 500;
          color: #e6edf3;
          line-height: 1.5;
          margin-bottom: 2px;
        }

        .toast-time {
          font-size: 10px;
          color: #484f58;
        }

        .toast-close {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #484f58;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #e6edf3;
          transform: rotate(90deg);
        }

        .toast-progress {
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
        }

        .toast-progress-bar {
          height: 100%;
          transition: width 0.1s linear;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100%);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(100%);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-100%);
          }
        }

        @keyframes iconPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .toast {
            min-width: auto;
            max-width: calc(100vw - 32px);
            left: 16px !important;
            right: 16px !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Composant Toast Container pour gérer plusieurs toasts
export function ToastContainer({ toasts, onClose }: { 
  toasts: Array<{ id: string } & ToastProps>;
  onClose: (id: string) => void;
}) {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </>
  );
}

// Hook personnalisé pour gérer les toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string } & ToastProps>>([]);

  const showToast = (
    message: string,
    type: ToastProps['type'] = 'blue',
    options?: Partial<Omit<ToastProps, 'message' | 'type'>>
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = {
      id,
      message,
      type,
      ...options
    };
    
    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, options?.duration || 3000);

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message: string, options?: Partial<ToastProps>) => 
    showToast(message, 'green', options);

  const error = (message: string, options?: Partial<ToastProps>) => 
    showToast(message, 'red', options);

  const warning = (message: string, options?: Partial<ToastProps>) => 
    showToast(message, 'amber', options);

  const info = (message: string, options?: Partial<ToastProps>) => 
    showToast(message, 'blue', options);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => (
      <ToastContainer toasts={toasts} onClose={removeToast} />
    )
  };
}