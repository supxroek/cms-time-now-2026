import { useState } from "react";
import { StatsCard } from "../components/molecules/StatsCard";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { UserCheckIcon, UserXIcon, ClockIcon } from "../components/atoms/Icons";

export function RequestPage() {
  // Mock Data
  const [requests, setRequests] = useState([
    {
      id: 1,
      employee: "Somchai Jai-dee",
      type: "ลาหยุด",
      date: "2025-12-15",
      time: "09:00 - 18:00",
      reason: "Personal Leave",
      status: "รอดำเนินการ",
    },
    {
      id: 2,
      employee: "Somsri Rak-ngan",
      type: "ล่วงเวลา",
      date: "2025-12-12",
      time: "18:00 - 20:00",
      reason: "Urgent Project",
      status: "อนุมัติ",
    },
    {
      id: 3,
      employee: "Mana Dee-mak",
      type: "เปลี่ยนกะ",
      date: "2025-12-20",
      time: "08:00 - 17:00",
      reason: "Doctor Appointment",
      status: "ปฏิเสธ",
    },
    {
      id: 4,
      employee: "Manee Me-chai",
      type: "ลาหยุด",
      date: "2025-12-30",
      time: "09:00 - 18:00",
      reason: "New Year Holiday",
      status: "รอดำเนินการ",
    },
  ]);

  const [filterType, setFilterType] = useState("ทุกประเภท");
  const [filterStatus, setFilterStatus] = useState("ทุกสถานะ");

  const filteredRequests = requests.filter((req) => {
    const matchType = filterType === "ทุกประเภท" || req.type === filterType;
    const matchStatus =
      filterStatus === "ทุกสถานะ" || req.status === filterStatus;
    return matchType && matchStatus;
  });

  const handleApprove = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );
  };

  const handleReject = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Rejected" } : req
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main">การจัดการคำขอ</h1>
          <p className="text-text-sub mt-1">จัดการคำขอของพนักงาน</p>
        </div>
        {/* <Button variant="primary" icon={<RequestsIcon className="w-5 h-5" />}>
          คำขอใหม่
        </Button> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="คำขอที่รอดำเนินการ"
          value={requests.filter((r) => r.status === "รอดำเนินการ").length}
          icon={<ClockIcon className="w-6 h-6" />}
          color="warning"
        />
        <StatsCard
          title="ที่อนุมัติ"
          value={requests.filter((r) => r.status === "อนุมัติ").length}
          icon={<UserCheckIcon className="w-6 h-6" />}
          color="success"
        />
        <StatsCard
          title="ที่ถูกปฏิเสธ"
          value={requests.filter((r) => r.status === "ปฏิเสธ").length}
          icon={<UserXIcon className="w-6 h-6" />}
          color="danger"
        />
      </div>

      {/* Request List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-text-main">คำขอล่าสุด</h2>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border-gray-200 rounded-md text-text-sub focus:ring-primary focus:border-primary"
            >
              <option>ทุกประเภท</option>
              <option>ลาหยุด</option>
              <option>ล่วงเวลา</option>
              <option>เปลี่ยนกะ</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border-gray-200 rounded-md text-text-sub focus:ring-primary focus:border-primary"
            >
              <option>ทุกสถานะ</option>
              <option>รอดำเนินการ</option>
              <option>อนุมัติ</option>
              <option>ปฏิเสธ</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-text-sub font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">พนักงาน</th>
                <th className="px-6 py-3">ประเภท</th>
                <th className="px-6 py-3">วันที่</th>
                <th className="px-6 py-3">เวลา</th>
                <th className="px-6 py-3">เหตุผล</th>
                <th className="px-6 py-3">สถานะ</th>
                <th className="px-6 py-3 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-main">
                    {req.employee}
                  </td>
                  <td className="px-6 py-4 text-text-sub">{req.type}</td>
                  <td className="px-6 py-4 text-text-sub">{req.date}</td>
                  <td className="px-6 py-4 text-text-sub">{req.time}</td>
                  <td className="px-6 py-4 text-text-sub">{req.reason}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === "รอดำเนินการ" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="p-1 text-success hover:bg-success/10 rounded transition-colors"
                          title="อนุมัติ"
                        >
                          <UserCheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
                          title="ปฏิเสธ"
                        >
                          <UserXIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="p-8 text-center text-text-muted">ไม่พบคำขอ</div>
        )}
      </div>
    </div>
  );
}
