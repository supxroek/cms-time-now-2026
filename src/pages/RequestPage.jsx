import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StatsCard } from "../components/molecules/StatsCard";
import { StatusBadge } from "../components/atoms/StatusBadge";
import {
  UserCheckIcon,
  UserXIcon,
  ClockIcon,
  FileTextIcon,
  RequestsIcon,
  ResendIcon,
} from "../components/atoms/Icons";
import {
  fetchPendingRequests,
  fetchRequestHistory,
  fetchRequestStats,
} from "../store/slices/requestSlice";
import { apiPost } from "../services/api";
import { Modal } from "../components/molecules/Modal";
import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { useNotification } from "../hooks/useNotification";

const REQUEST_TYPES = {
  work_in: "เข้างาน",
  break_in: "เริ่มพัก",
  break_out: "พักเสร็จ",
  work_out: "เลิกงาน",
  ot_in: "เข้างานล่วงเวลา",
  ot_out: "ออกงานล่วงเวลา",
};

const initialHistoryFilters = {
  page: 1,
  limit: 10,
  search: "",
  type: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

export function RequestPage() {
  const dispatch = useDispatch();
  const {
    items: requests,
    history,
    stats,
    loading,
    historyLoading,
  } = useSelector((state) => state.requests);
  const { success, error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'history'
  const [filterType, setFilterType] = useState("ทุกประเภท");
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // Resend rate-limit state (map: request_id -> timestamp ms)
  const [lastResend, setLastResend] = useState({});
  const [resendingId, setResendingId] = useState(null);

  // History Filters
  const [historyFilters, setHistoryFilters] = useState(initialHistoryFilters);

  const resetFilters = () => {
    setHistoryFilters(initialHistoryFilters);
    setFilterType("ทุกประเภท");
  };

  useEffect(() => {
    dispatch(fetchRequestStats());
    if (activeTab === "pending") {
      dispatch(fetchPendingRequests());
    } else {
      dispatch(fetchRequestHistory(historyFilters));
    }
  }, [dispatch, activeTab, historyFilters]);

  const filteredRequests = requests.filter((req) => {
    const typeLabel = REQUEST_TYPES[req.timestamp_type] || req.timestamp_type;
    const matchType = filterType === "ทุกประเภท" || typeLabel === filterType;
    return matchType;
  });

  // Replace approve/reject with resend notification
  const handleResend = async (req) => {
    const id = req.request_id || req.id;
    const now = Date.now();
    const last = lastResend[id];

    // Limit to 1 resend per hour
    if (last && now - last < 3600000) {
      const minsLeft = Math.ceil((3600000 - (now - last)) / 60000);
      showError("จำกัดการส่งซ้ำ", `คุณสามารถส่งได้อีกครั้งใน ${minsLeft} นาที`);
      return;
    }

    try {
      setResendingId(id);
      // backend endpoint assumed: POST /requests/:id/resend
      await apiPost(`/requests/${id}/resend`);
      setLastResend((prev) => ({ ...prev, [id]: Date.now() }));
      success("ส่งแจ้งเตือนแล้ว", "ระบบได้ส่งอีเมลแจ้งเตือนซ้ำแล้ว");
      dispatch(fetchPendingRequests());
      dispatch(fetchRequestStats());
    } catch (err) {
      console.error("Resend failed:", err);
      showError(
        "ส่งแจ้งเตือนไม่สำเร็จ",
        err?.message || "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่"
      );
    } finally {
      setResendingId(null);
    }
  };

  const handleHistoryFilterChange = (key, value) => {
    setHistoryFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const getNextRecipient = (req) => {
    // Best-effort resolution of the next recipient name/role for tooltip
    if (req.next_approver_name) return req.next_approver_name;
    if (req.next_approver_role) return req.next_approver_role;
    if (req.headDep_name) return req.headDep_name;
    if (req.hr_name) return `HR: ${req.hr_name}`;
    if (req.departmentName) return req.departmentName;
    return "ผู้รับผิดชอบถัดไป";
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" className="px-6 py-4 text-center text-text-sub">
            กำลังโหลดข้อมูล...
          </td>
        </tr>
      );
    }

    if (filteredRequests.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="px-6 py-4 text-center text-text-sub">
            ไม่พบคำขอ
          </td>
        </tr>
      );
    }

    return filteredRequests.map((req, index) => (
      <tr key={req.id || index} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 font-medium text-text-main">
          {req.employee_name ||
            req.employee?.first_name + " " + req.employee?.last_name ||
            "Unknown"}
        </td>
        <td className="px-6 py-4 text-text-sub">
          {REQUEST_TYPES[req.timestamp_type] || req.timestamp_type}
        </td>
        <td className="px-6 py-4 text-text-sub">
          {new Date(req.forget_date).toLocaleDateString("th-TH")}
        </td>
        <td className="px-6 py-4 text-text-sub">
          {req.forget_time?.slice(0, 5)}
        </td>
        <td
          className="px-6 py-4 text-text-sub max-w-2xs truncate"
          title={req.reason}
        >
          {req.reason}
        </td>
        <td className="px-6 py-4">
          {req.evidence ? (
            <button
              onClick={() => setSelectedEvidence(req.evidence)}
              className="text-primary hover:underline hover:cursor-pointer flex items-center gap-1"
            >
              <FileTextIcon className="w-4 h-4" /> ดูหลักฐาน
            </button>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={req.status} />
        </td>
        <td className="px-6 py-4 text-right">
          {req.status === "pending" && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleResend(req)}
                disabled={resendingId === (req.request_id || req.id)}
                className="p-1 text-primary hover:bg-primary/10 hover:cursor-pointer rounded transition-colors disabled:opacity-50"
                title={getNextRecipient(req)}
                aria-label="ส่งแจ้งเตือนซ้ำ"
              >
                <ResendIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </td>
      </tr>
    ));
  };

  const renderHistoryTableBody = () => {
    if (historyLoading) {
      return (
        <tr>
          <td colSpan="9" className="px-6 py-4 text-center text-text-sub">
            กำลังโหลดข้อมูล...
          </td>
        </tr>
      );
    }

    if (history.items.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="px-6 py-4 text-center text-text-sub">
            ไม่พบประวัติคำขอ
          </td>
        </tr>
      );
    }

    return history.items.map((req, index) => (
      <tr key={req.id || index} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 font-medium text-text-main">
          {req.employee_name || "Unknown"}
        </td>
        <td className="px-6 py-4 text-text-sub">
          {REQUEST_TYPES[req.timestamp_type] || req.timestamp_type}
        </td>
        <td className="px-6 py-4 text-text-sub">
          {new Date(req.forget_date).toLocaleDateString("th-TH")}
        </td>
        <td className="px-6 py-4 text-text-sub">
          {req.forget_time?.slice(0, 5)}
        </td>
        <td
          className="px-6 py-4 text-text-sub max-w-xs truncate"
          title={req.reason}
        >
          {req.reason}
        </td>
        <td className="px-6 py-4">
          {req.evidence ? (
            <button
              onClick={() => setSelectedEvidence(req.evidence)}
              className="text-primary hover:underline flex items-center gap-1"
            >
              <FileTextIcon className="w-4 h-4" /> ดูหลักฐาน
            </button>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={req.status} />
        </td>
        <td className="px-6 py-4 text-text-sub">
          {req.approved_at
            ? new Date(req.approved_at).toLocaleDateString("th-TH")
            : "-"}
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <RequestsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-main">การจัดการคำขอ</h1>
          <p className="text-text-sub mt-1">จัดการคำขอของพนักงาน</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="คำขอทั้งหมด"
          value={stats.total}
          icon={<FileTextIcon className="w-6 h-6" />}
          color="primary"
        />
        <StatsCard
          title="รอดำเนินการ"
          value={stats.pending}
          icon={<ClockIcon className="w-6 h-6" />}
          color="warning"
        />
        <StatsCard
          title="อนุมัติแล้ว"
          value={stats.approved}
          icon={<UserCheckIcon className="w-6 h-6" />}
          color="success"
        />
        <StatsCard
          title="ปฏิเสธแล้ว"
          value={stats.rejected}
          icon={<UserXIcon className="w-6 h-6" />}
          color="danger"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab("pending");
              resetFilters();
            }}
            className={`${
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-text-sub hover:text-text-main hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            คำขอที่รอดำเนินการ
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              resetFilters();
            }}
            className={`${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-text-sub hover:text-text-main hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            ประวัติคำขอ
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === "pending" ? (
          <>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-text-main">คำขอล่าสุด</h2>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm border-gray-200 rounded-md text-text-sub focus:ring-primary focus:border-primary"
                >
                  <option>ทุกประเภท</option>
                  {Object.values(REQUEST_TYPES).map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-text-sub font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">พนักงาน</th>
                    <th className="px-6 py-3">ประเภท</th>
                    <th className="px-6 py-3">วันที่ขอแก้ไข</th>
                    <th className="px-6 py-3">เวลาขอแก้ไข</th>
                    <th className="px-6 py-3">เหตุผล</th>
                    <th className="px-6 py-3">หลักฐาน</th>
                    <th className="px-6 py-3">สถานะ</th>
                    <th className="px-6 py-3 text-right">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {renderTableBody()}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 space-y-4">
              <div className="flex flex-wrap gap-4">
                <Input
                  placeholder="ค้นหาชื่อ หรือ รหัสคำขอ..."
                  value={historyFilters.search}
                  onChange={(e) =>
                    handleHistoryFilterChange("search", e.target.value)
                  }
                  className="w-64"
                />
                <select
                  value={historyFilters.type}
                  onChange={(e) =>
                    handleHistoryFilterChange("type", e.target.value)
                  }
                  className="text-sm border-gray-200 rounded-md text-text-sub focus:ring-primary focus:border-primary"
                >
                  <option value="all">ทุกประเภท</option>
                  {Object.entries(REQUEST_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
                <select
                  value={historyFilters.status}
                  onChange={(e) =>
                    handleHistoryFilterChange("status", e.target.value)
                  }
                  className="text-sm border-gray-200 rounded-md text-text-sub focus:ring-primary focus:border-primary"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="approved">อนุมัติ</option>
                  <option value="rejected">ปฏิเสธ</option>
                </select>
                <input
                  type="date"
                  value={historyFilters.startDate}
                  onChange={(e) =>
                    handleHistoryFilterChange("startDate", e.target.value)
                  }
                  className="text-sm border-gray-200 rounded-md text-text-sub focus:ring-primary focus:border-primary"
                />
                <span className="self-center text-gray-400">-</span>
                <input
                  type="date"
                  value={historyFilters.endDate}
                  onChange={(e) =>
                    handleHistoryFilterChange("endDate", e.target.value)
                  }
                  className="text-sm border-gray-200 rounded-md text-text-sub focus:ring-primary focus:border-primary"
                />
                <Button variant="ghost" onClick={resetFilters}>
                  รีเซ็ตตัวกรอง
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-text-sub font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">พนักงาน</th>
                    <th className="px-6 py-3">ประเภท</th>
                    <th className="px-6 py-3">วันที่ขอแก้ไข</th>
                    <th className="px-6 py-3">เวลาขอแก้ไข</th>
                    <th className="px-6 py-3">เหตุผล</th>
                    <th className="px-6 py-3">หลักฐาน</th>
                    <th className="px-6 py-3">สถานะ</th>
                    <th className="px-6 py-3">วันที่ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {renderHistoryTableBody()}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-text-sub">
                แสดง {history.items.length} จาก {history.total} รายการ
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={history.page === 1}
                  onClick={() =>
                    setHistoryFilters((prev) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                >
                  ก่อนหน้า
                </Button>
                <Button
                  variant="secondary"
                  disabled={history.page >= history.totalPages}
                  onClick={() =>
                    setHistoryFilters((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal removed: approve/reject replaced by resend action */}

      {/* Evidence Modal */}
      <Modal
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        title="หลักฐานประกอบคำขอ"
      >
        <div className="pb-6 flex justify-center items-center">
          {selectedEvidence &&
          (selectedEvidence.startsWith("data:image") ||
            selectedEvidence.match(/\.(jpeg|jpg|gif|png)$/)) ? (
            <img
              src={selectedEvidence}
              alt="Evidence"
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="mb-2">ไม่สามารถแสดงตัวอย่างไฟล์ได้</p>
              <a
                href={selectedEvidence}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                เปิดไฟล์ในแท็บใหม่
              </a>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
