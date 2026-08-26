// Access Requests Page - Admin interface for managing user access requests

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import accessRequestService from "../services/access-request.service";
import { useToast } from "../components/Toast";
import { Modal } from "../components/Modal";
import { Icon } from "../components/Icon";

export default function AccessRequestsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeTab === "pending") {
        const data = await accessRequestService.getPendingRequests();
        setRequests(data);
      } else {
        const data = await accessRequestService.getDeclinedRequests();
        setRequests(data);
      }
    } catch (error) {
      showToast(error.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      await accessRequestService.approveRequest(request.id, user.id);
      showToast(`✓ Approved access for ${request.full_name}`);
      fetchRequests();
    } catch (error) {
      showToast(error.message || "Failed to approve request");
    }
  };

  const handleDeclineClick = (request) => {
    setSelectedRequest(request);
    setDeclineReason("");
    setDeclineModalOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedRequest) return;

    try {
      await accessRequestService.declineRequest(
        selectedRequest.id,
        user.id,
        declineReason,
      );
      showToast(`✓ Declined access for ${selectedRequest.full_name}`);
      setDeclineModalOpen(false);
      setSelectedRequest(null);
      setDeclineReason("");
      fetchRequests();
    } catch (error) {
      showToast(error.message || "Failed to decline request");
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.full_name.toLowerCase().includes(query) ||
      req.email.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Access Requests</h1>
          <p className="settings-subtitle">
            Manage user access to the platform
          </p>
        </div>
        <button className="settings-close-btn" onClick={() => navigate(-1)}>
          <Icon name="close" size={16} />
          Close
        </button>
      </div>

      <div className="settings-tabs-container">
        <div className="settings-sub-header">
          <div className="settings-sub-tabs">
            <button
              className={`settings-sub-tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
              {activeTab === "pending" && requests.length > 0 && (
                <span className="settings-tab-count">{requests.length}</span>
              )}
            </button>
            <button
              className={`settings-sub-tab ${activeTab === "declined" ? "active" : ""}`}
              onClick={() => setActiveTab("declined")}
            >
              Declined
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="settings-search-wrap">
          <Icon name="search" size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="settings-search"
          />
          {searchQuery && (
            <button
              className="settings-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        <div className="settings-list">
          {loading ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="settings-empty">
              <div className="settings-empty-icon">
                {searchQuery ? "🔍" : activeTab === "pending" ? "⏳" : "📋"}
              </div>
              <h3>
                {searchQuery
                  ? "No Results Found"
                  : activeTab === "pending"
                    ? "No Pending Requests"
                    : "No Declined Requests"}
              </h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : activeTab === "pending"
                    ? "All access requests have been reviewed"
                    : "No users have been declined access"}
              </p>
            </div>
          ) : (
            <>
              {filteredRequests.map((request) => (
                <div key={request.id} className="access-request-item">
                  <div className="access-request-avatar">
                    {request.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="access-request-info">
                    <div className="access-request-name">
                      {request.full_name}
                    </div>
                    <div className="access-request-email">{request.email}</div>
                    <div className="access-request-date">
                      {activeTab === "pending"
                        ? `Requested ${formatDate(request.created_at)}`
                        : `Declined ${formatDate(request.reviewed_at)}`}
                    </div>
                    {activeTab === "declined" && request.decline_reason && (
                      <div className="access-request-reason">
                        Reason: {request.decline_reason}
                      </div>
                    )}
                  </div>
                  <div className="access-request-actions">
                    {activeTab === "pending" ? (
                      <>
                        <button
                          className="access-request-btn approve"
                          onClick={() => handleApprove(request)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="access-request-btn decline"
                          onClick={() => handleDeclineClick(request)}
                        >
                          ✕ Decline
                        </button>
                      </>
                    ) : (
                      <button
                        className="access-request-btn approve"
                        onClick={() => handleApprove(request)}
                      >
                        ✓ Approve Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="settings-list-footer">
                Showing {filteredRequests.length}{" "}
                {activeTab === "pending" ? "pending" : "declined"}{" "}
                {filteredRequests.length === 1 ? "request" : "requests"}
              </div>
            </>
          )}
        </div>
      </div>

      {declineModalOpen && (
        <Modal onClose={() => setDeclineModalOpen(false)}>
          <div style={{ padding: "20px", maxWidth: "500px" }}>
            <h3 style={{ marginBottom: "16px", color: "var(--white)" }}>
              Decline Access Request
            </h3>
            <p
              style={{
                marginBottom: "20px",
                color: "var(--muted)",
                fontSize: "14px",
              }}
            >
              Are you sure you want to decline access for{" "}
              <strong>{selectedRequest?.full_name}</strong>?
            </p>
            <label className="form-label">Reason (optional)</label>
            <textarea
              className="form-input"
              placeholder="Provide a reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                className="login-btn"
                onClick={handleDeclineConfirm}
                style={{ flex: 1, background: "#ff4444" }}
              >
                Decline Request
              </button>
              <button
                className="login-btn"
                onClick={() => setDeclineModalOpen(false)}
                style={{ flex: 1, background: "var(--muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
