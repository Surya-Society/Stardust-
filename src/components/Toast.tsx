// Toast.tsx
import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiXCircle,
  FiX,
  FiBell,
  FiCheck,
  FiClock,
  FiStar
} from 'react-icons/fi';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineXCircle
} from 'react-icons/hi';
import { MdOutlineWarning, MdOutlineError, MdCheckCircleOutline } from 'react-icons/md';
import { BsCheckCircle, BsExclamationCircle, BsInfoCircle, BsXCircle } from 'react-icons/bs';

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
      requestAnimationFrame(updateProgress);
    };

    if (progress) {
      const animationFrame = requestAnimationFrame(updateProgress);
      return () => cancelAnimationFrame(animationFrame);
    }
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
    const iconProps = { size: 20, className: 'toast-icon' };
    
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
          icon: 'var(--accent-teal)',
          progress: 'var(--accent-teal)',
          glow: '0 0 20px rgba(57, 211, 83, 0.2)'
        };
      case 'red':
        return {
          bg: 'linear-gradient(135deg, rgba(248, 81, 73, 0.1) 0%, rgba(248, 81, 73, 0.05) 100%)',
          border: 'rgba(248, 81, 73, 0.3)',
          icon: 'var(--accent-red)',
          progress: 'var(--accent-red)',
          glow: '0 0 20px rgba(248, 81, 73, 0.2)'
        };
      case 'amber':
        return {
          bg: 'linear-gradient(135deg, rgba(227, 179, 65, 0.1) 0%, rgba(227, 179, 65, 0.05) 100%)',
          border: 'rgba(227, 179, 65, 0.3)',
          icon: 'var(--accent-amber)',
          progress: 'var(--accent-amber)',
          glow: '0 0 20px rgba(227, 179, 65, 0.2)'
        };
      case 'blue':
        return {
          bg: 'linear-gradient(135deg, rgba(56, 139, 253, 0.1) 0%, rgba(56, 139, 253, 0.05) 100%)',
          border: 'rgba(56, 139, 253, 0.3)',
          icon: 'var(--accent-blue)',
          progress: 'var(--accent-blue)',
          glow: '0 0 20px rgba(56, 139, 253, 0.2)'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(139, 148, 158, 0.1) 0%, rgba(139, 148, 158, 0.05) 100%)',
          border: 'rgba(139, 148, 158, 0.3)',
          icon: 'var(--text-secondary)',
          progress: 'var(--text-secondary)',
          glow: '0 0 20px rgba(139, 148, 158, 0.2)'
        };
    }
  };

  const colors = getGradientColors();

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: '24px', left: '24px' };
      case 'top-right':
        return { top: '24px', right: '24px' };
      case 'top-center':
        return { top: '24px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-left':
        return { bottom: '24px', left: '24px' };
      case 'bottom-center':
        return { bottom: '24px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
      default:
        return { bottom: '24px', right: '24px' };
    }
  };

  const getAnimationStyles = () => {
    const baseAnimation = isExiting ? 'exit' : 'enter';
    
    switch (position) {
      case 'top-left':
        return {
          enter: 'slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        };
      case 'top-right':
        return {
          enter: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        };
      case 'top-center':
        return {
          enter: 'slideInDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'slideOutUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        };
      case 'bottom-left':
        return {
          enter: 'slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        };
      case 'bottom-center':
        return {
          enter: 'slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'slideOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        };
      case 'bottom-right':
      default:
        return {
          enter: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        };
    }
  };

  const animations = getAnimationStyles();

  return (
    <div 
      className={`toast toast-${type}`}
      style={{
        ...getPositionStyles(),
        '--toast-bg': colors.bg,
        '--toast-border': colors.border,
        '--toast-icon': colors.icon,
        '--toast-progress': colors.progress,
        '--toast-glow': colors.glow,
        animation: isExiting ? animations.exit : animations.enter
      } as React.CSSProperties}
    >
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
          background: var(--bg-elevated);
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

        .toast-icon {
          animation: iconSpin 0.3s ease;
        }

        .toast-message-wrapper {
          flex: 1;
        }

        .toast-message {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 2px;
        }

        .toast-time {
          font-size: 10px;
          color: var(--text-muted);
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
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          transform: rotate(90deg);
        }

        .toast-progress {
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
        }

        .toast-progress-bar {
          height: 100%;
          transition: width 0.1s linear;
          animation: progressGlow 2s ease-in-out infinite;
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

        @keyframes iconSpin {
          0% {
            transform: rotate(-180deg);
          }
          100% {
            transform: rotate(0);
          }
        }

        @keyframes progressGlow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }

        /* Types de toast avec variations de couleurs */
        .toast-green .toast-icon-wrapper {
          background: rgba(57, 211, 83, 0.15);
        }

        .toast-red .toast-icon-wrapper {
          background: rgba(248, 81, 73, 0.15);
        }

        .toast-amber .toast-icon-wrapper {
          background: rgba(227, 179, 65, 0.15);
        }

        .toast-blue .toast-icon-wrapper {
          background: rgba(56, 139, 253, 0.15);
        }

        /* Responsive */
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

    // Auto-suppression après la durée
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
