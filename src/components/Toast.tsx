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

  const getColors = () => {
    switch (type) {
      case 'green':
        return {
          border: 'rgba(57, 211, 83, 0.3)',
          icon: '#39d353',
          progress: '#39d353',
          bgGradient: 'bg-gradient-to-br from-[rgba(57,211,83,0.1)] to-[rgba(57,211,83,0.05)]'
        };
      case 'red':
        return {
          border: 'rgba(248, 81, 73, 0.3)',
          icon: '#f85149',
          progress: '#f85149',
          bgGradient: 'bg-gradient-to-br from-[rgba(248,81,73,0.1)] to-[rgba(248,81,73,0.05)]'
        };
      case 'amber':
        return {
          border: 'rgba(227, 179, 65, 0.3)',
          icon: '#e3b341',
          progress: '#e3b341',
          bgGradient: 'bg-gradient-to-br from-[rgba(227,179,65,0.1)] to-[rgba(227,179,65,0.05)]'
        };
      case 'blue':
        return {
          border: 'rgba(56, 139, 253, 0.3)',
          icon: '#388bfd',
          progress: '#388bfd',
          bgGradient: 'bg-gradient-to-br from-[rgba(56,139,253,0.1)] to-[rgba(56,139,253,0.05)]'
        };
      default:
        return {
          border: 'rgba(139, 148, 158, 0.3)',
          icon: '#8b949e',
          progress: '#8b949e',
          bgGradient: 'bg-gradient-to-br from-[rgba(139,148,158,0.1)] to-[rgba(139,148,158,0.05)]'
        };
    }
  };

  const colors = getColors();

  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-left':
        return 'top-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-center':
        return 'top-6 left-1/2 -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-center':
        return 'bottom-6 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const getAnimationClasses = (): string => {
    if (isExiting) {
      switch (position) {
        case 'top-left':
        case 'bottom-left':
          return 'animate-[slideOutLeft_0.3s_cubic-bezier(0.4,0,0.2,1)_forwards]';
        case 'top-center':
          return 'animate-[slideOutUp_0.3s_cubic-bezier(0.4,0,0.2,1)_forwards]';
        case 'bottom-center':
          return 'animate-[slideOutDown_0.3s_cubic-bezier(0.4,0,0.2,1)_forwards]';
        case 'top-right':
        case 'bottom-right':
        default:
          return 'animate-[slideOutRight_0.3s_cubic-bezier(0.4,0,0.2,1)_forwards]';
      }
    } else {
      switch (position) {
        case 'top-left':
        case 'bottom-left':
          return 'animate-[slideInLeft_0.3s_cubic-bezier(0.4,0,0.2,1)]';
        case 'top-center':
          return 'animate-[slideInDown_0.3s_cubic-bezier(0.4,0,0.2,1)]';
        case 'bottom-center':
          return 'animate-[slideInUp_0.3s_cubic-bezier(0.4,0,0.2,1)]';
        case 'top-right':
        case 'bottom-right':
        default:
          return 'animate-[slideInRight_0.3s_cubic-bezier(0.4,0,0.2,1)]';
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-100%); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOutDown {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(100%); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOutUp {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-100%); }
        }
        @keyframes iconPop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div 
        className={`fixed z-[9999] min-w-[320px] max-w-[400px] bg-[#1c2330] border backdrop-blur-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden max-[480px]:min-w-auto max-[480px]:max-w-[calc(100vw-32px)] max-[480px]:left-4 max-[480px]:right-4 max-[480px]:transform-none ${getPositionClasses()} ${getAnimationClasses()}`}
        style={{ borderColor: colors.border }}
      >
        <div className={`flex items-start gap-3 p-4 ${colors.bgGradient}`}>
          {showIcon && (
            <div 
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white/5 animate-[iconPop_0.3s_cubic-bezier(0.4,0,0.2,1)]"
              style={{ color: colors.icon }}
            >
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1">
            <div className="text-[13px] font-medium text-[#e6edf3] leading-relaxed mb-0.5">{message}</div>
            <div className="text-[10px] text-[#484f58]">À l'instant</div>
          </div>

          {showCloseButton && (
            <button 
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-transparent border-none text-[#484f58] cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-[#e6edf3] hover:rotate-90"
              onClick={handleClose}
              aria-label="Fermer"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {progress && (
          <div className="h-0.5 bg-white/5">
            <div 
              className="h-full transition-[width] duration-100 linear"
              style={{ 
                width: `${progressValue}%`,
                background: `linear-gradient(90deg, ${colors.progress}, ${colors.progress}88)`
              }}
            />
          </div>
        )}
      </div>
    </>
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