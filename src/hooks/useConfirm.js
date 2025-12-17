import { useContext } from "react";
import { ConfirmContext } from "../contexts/ConfirmContext";

/**
 * useConfirm Hook
 * ใช้แสดง confirmation dialog
 *
 * @example
 * const confirm = useConfirm();
 * const handleDelete = async () => {
 *   const result = await confirm({
 *     title: 'ยืนยันการลบ',
 *     message: 'คุณต้องการลบข้อมูลนี้หรือไม่?',
 *     confirmText: 'ลบ',
 *     variant: 'danger'
 *   });
 *   if (result) {
 *     // ทำการลบ
 *   }
 * };
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export default useConfirm;
