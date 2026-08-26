// Dashboard Page Component

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/dashboard.service";
import { DomainCard } from "../components/DomainCard";
import { Footer } from "../components/Footer";
import { Chatbot } from "../components/chatbot";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [domainCards, setDomainCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dashboardContent = dashboardService.getDashboardContent();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        setError(null);
        const cards = await dashboardService.getDomainCards();
        setDomainCards(cards);
      } catch (err) {
        console.error("Failed to fetch domain cards:", err);
        setError("Failed to load domains. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const handleDomainClick = (slug) => {
    navigate(`/domains/${slug}`);
  };

  return (
    <>
      <div className="dashboard fade-in">
        <div className="dashboard-header">
          {/* <div className="dashboard-badge">
            <span className="dashboard-badge-dot" />
            {dashboardContent.badge}
          </div> */}
          <h1 className="dashboard-title">{dashboardContent.title}</h1>
          <p className="dashboard-subtitle">{dashboardContent.subtitle}</p>
        </div>

        {loading && (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading domains...</p>
          </div>
        )}

        {error && (
          <div className="dashboard-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="dashboard-grid">
            {domainCards.map((domain) => (
              <DomainCard
                key={domain.slug}
                domain={domain}
                onClick={() => handleDomainClick(domain.slug)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
      <Chatbot />
    </>
  );
}
