import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal } from "./Modal";
import { Button } from "../atoms/Button";
import { ConfirmContext } from "../../contexts/ConfirmContext";

/**
 * ConfirmProvider Component
 * Provider สำหรับ confirmation dialog
 */
export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [resolveRef, setResolveRef] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || "ยืนยัน",
        message: options.message || "คุณต้องการดำเนินการต่อหรือไม่?",
        confirmText: options.confirmText || "ยืนยัน",
        cancelText: options.cancelText || "ยกเลิก",
        variant: options.variant || "primary", // primary, danger, warning
        icon: options.icon,
      });
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolveRef?.(true);
    setResolveRef(null);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolveRef?.(false);
    setResolveRef(null);
  }, [resolveRef]);

  // Icon ตาม variant
  const getIcon = () => {
    if (config?.icon) return config.icon;

    switch (config?.variant) {
      case "danger":
        return (
          <div className="mx-auto w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-info"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  // Button variant
  const getButtonVariant = () => {
    switch (config?.variant) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Modal isOpen={isOpen} onClose={handleCancel} size="sm">
        <div className="text-center py-2">
          {/* Icon */}
          <div className="mb-4">{getIcon()}</div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-text-main mb-2">
            {config?.title}
          </h3>

          {/* Message */}
          <p className="text-sm text-text-sub mb-6">{config?.message}</p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={handleCancel}>
              {config?.cancelText}
            </Button>
            <Button variant={getButtonVariant()} onClick={handleConfirm}>
              {config?.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

ConfirmProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ConfirmProvider;
