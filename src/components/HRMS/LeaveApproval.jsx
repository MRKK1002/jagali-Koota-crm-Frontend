import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Loader,
  AlertCircle,
} from "lucide-react";
import apiService from "../../services/api";

export default function LeaveApproval() {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingLeaves();
      if (response.success) {
        setPen
dingLeaves(response.leaves || []);
      }
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    if (!window.confirm("Are you sure you want to approve this leave?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.approveLeave(leaveId);
      if (response.success) {
        alert("Leave approved successfully!");
        fetchPendingLeaves();
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      alert(error.message || "Failed to approve leave");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.rejectLeave(selectedLeave._id, rejectionReason);
      if (response.success) {
        alert("Leave rejected successfully!");
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedLeave(null);
        fetchPendingLeaves();
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert(error.message || "Failed to reject leave");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case "Sick Leave":
        return "bg-red-100 text-red-800";
      case "Casual Leave":
        return "bg-blue-100 text-blue-800";
      case "Annual Leave":
        return "bg-green-100 text-green-800";
      case "Emergency Leave":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#69231B] rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Approval</h1>
          </div>
          <p className="text-gray-600">Review and approve employee leave requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-orange-600">{pendingLeaves.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Leaves List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Pending Leave Requests</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending leave requests</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingLeaves.map((leave) => (
                <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {leave.employeeName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{leave.employeeName}</h4>
                          <p className="text-sm text-gray-600">{leave.empId}</p>
                        </div>
                      </div>

                      <div className="ml-13 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                            {leave.leaveType}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            ({leave.totalDays} {leave.totalDays === 1 ? "day" : "days"})
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-700">{leave.reason}</p>
                        </div>

                        <p className="text-xs text-gray-500">
                          Applied on: {formatDate(leave.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(leave._id)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setShowRejectModal(true);
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Leave Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this leave request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Reject Leave"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedLeave(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
