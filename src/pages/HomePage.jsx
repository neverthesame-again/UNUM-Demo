// Home Page Component

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { homeService } from "../services/home.service";
import { Icon } from "../components/Icon";
import { Footer } from "../components/Footer";

export default function HomePage() {
  const navigate = useNavigate();
  const [pillarCards, setPillarCards] = useState([]);
  const heroContent = homeService.getHeroContent();
  const stats = homeService.getStats();
  const missionContent = homeService.getMissionContent();
  const pillarsSection = homeService.getPillarsSection();

  useEffect(() => {
    const fetchPillarCards = async () => {
      const cards = await homeService.getPillarCards();
      setPillarCards(cards);
    };
    fetchPillarCards();
  }, []);

  return (
    <>
      {/* Hero Split Section */}
      <section className="hero-split-section" id="home-section">
        <div className="hero-split-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="grid-bg" />
        </div>
        <div className="hero-split">
          <div className="hero-left">
            <div className="eyebrow">
              <span className="pulse" />
              {heroContent.eyebrow}
            </div>
            <h1 className="hero-title">
              {heroContent.title}
              <br />
              <span className="gradient-text">{heroContent.highlight}</span>
            </h1>
            <p className="hero-subtitle">{heroContent.subtitle}</p>
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat">
                  <div className="stat-num">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-right">
            <div className="browser-frame">
              <div className="frame-glow" />
              <div className="browser-chrome">
                <div className="browser-dots">
                  <div className="bdot bdot-red" />
                  <div className="bdot bdot-yellow" />
                  <div className="bdot bdot-green" />
                </div>
                <div className="browser-url">
                  <span className="url-lock">🔒</span>
                  <span>unum/dashboard</span>
                </div>
              </div>
              <div className="browser-content">
                <div className="mini-nav">
                  <div className="mini-logo">
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        background:
                          "linear-gradient(135deg, var(--blue2), var(--cyan))",
                        borderRadius: "4px",
                      }}
                    />
                    <span style={{ fontSize: "10px", fontWeight: "700" }}>
                      UNUM AI HUB
                    </span>
                  </div>
                </div>
                <div className="mini-hero-strip" />
                <div className="mini-cards-grid">
                  <div className="mini-card mc1">
                    <div className="mc-icon">💻</div>
                    <div className="mc-body">
                      <div className="mc-title">Software Engineering</div>
                      <div className="mc-desc">
                        AI-powered development tools
                      </div>
                    </div>
                    <div className="mc-tag">Live</div>
                  </div>
                  <div className="mini-card mc2">
                    <div className="mc-icon">🛠️</div>
                    <div className="mc-body">
                      <div className="mc-title">IT Operations</div>
                      <div className="mc-desc">Intelligent monitoring</div>
                    </div>
                    <div className="mc-tag">Live</div>
                  </div>
                  <div className="mini-card mc3">
                    <div className="mc-icon">☁️</div>
                    <div className="mc-body">
                      <div className="mc-title">Modernization</div>
                      <div className="mc-desc">Legacy transformation</div>
                    </div>
                    <div className="mc-tag beta">Beta</div>
                  </div>
                  <div className="mini-card mc4">
                    <div className="mc-icon">📊</div>
                    <div className="mc-body">
                      <div className="mc-title">Business Intelligence</div>
                      <div className="mc-desc">Strategic insights</div>
                    </div>
                    <div className="mc-tag">Live</div>
                  </div>
                  <div className="mini-card mc5">
                    <div className="mc-icon">🛒</div>
                    <div className="mc-body">
                      <div className="mc-title">AI Marketplace</div>
                      <div className="mc-desc">Ready-to-deploy agents</div>
                    </div>
                    <div className="mc-tag">Live</div>
                  </div>
                  <div className="mini-card mc6">
                    <div className="mc-icon">🧠</div>
                    <div className="mc-body">
                      <div className="mc-title">Enterprise Intelligence</div>
                      <div className="mc-desc">Data synthesis</div>
                    </div>
                    <div className="mc-tag beta">Beta</div>
                  </div>
                  <div className="mini-card mc7">
                    <div className="mc-icon">🛡️</div>
                    <div className="mc-body">
                      <div className="mc-title">AI Governance</div>
                      <div className="mc-desc">Compliance & security</div>
                    </div>
                    <div className="mc-tag">Live</div>
                  </div>
                  <div className="mini-card mc8">
                    <div className="mc-icon">🔧</div>
                    <div className="mc-body">
                      <div className="mc-title">AI Catalog</div>
                      <div className="mc-desc">Build & orchestrate</div>
                    </div>
                    <div className="mc-tag soon">Soon</div>
                  </div>
                </div>
                <div className="mini-statusbar">
                  <div className="mini-status-item">
                    <div className="mini-dot green" />
                    <span>47 Models</span>
                  </div>
                  <div className="mini-status-item">
                    <div className="mini-dot cyan" />
                    <span>23 Systems</span>
                  </div>
                  <div className="mini-status-item">
                    <div className="mini-dot yellow" />
                    <span>500+ Tasks</span>
                  </div>
                </div>
              </div>
              <div className="float-badge fb1">
                <span style={{ fontSize: "18px" }}>⚡</span>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700" }}>
                    40% Faster
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--muted)" }}>
                    Development Speed
                  </div>
                </div>
              </div>
              <div className="float-badge fb2">
                <span style={{ fontSize: "18px" }}>🎯</span>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700" }}>
                    94% Accuracy
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--muted)" }}>
                    AI Predictions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Original sections below */}
      <section className="hero" style={{ display: "none" }}>
        <div className="hero-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="grid-bg" />
        </div>
        <div className="eyebrow">
          <span className="pulse" />
          {heroContent.eyebrow}
        </div>
        <h1 className="hero-title">
          {heroContent.title}
          <br />
          <span className="gradient-text">{heroContent.highlight}</span>
        </h1>
        <p className="hero-subtitle">{heroContent.subtitle}</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Access Platform →
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              document
                .getElementById("mission-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Initiative
          </button>
        </div>
        <div className="stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat">
              <div className="stat-number">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mission" id="mission-section">
        <div className="mission-inner">
          <div>
            <div className="section-label">{missionContent.sectionLabel}</div>
            <h2 className="section-title">{missionContent.title}</h2>
            {missionContent.paragraphs.map((para, idx) => (
              <p key={idx} className="section-text">
                {para}
              </p>
            ))}
            <button
              className="btn-primary"
              style={{ fontSize: "14px", padding: "12px 28px" }}
              onClick={() => navigate("/login")}
            >
              Sign In to Explore →
            </button>
          </div>
          <div>
            {missionContent.pills.map((pill, idx) => (
              <div key={idx} className="mission-pill">
                <span
                  className="mission-dot"
                  style={{ background: pill.color }}
                />
                {pill.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pillars" id="platform-section">
        <div className="section-label">{pillarsSection.sectionLabel}</div>
        <h2 className="section-title" style={{ marginBottom: "36px" }}>
          {pillarsSection.title}
        </h2>
        <div className="pillars-grid">
          {pillarCards.map((pillar) => (
            <div
              key={pillar.slug}
              className="pillar-card"
              style={{ "--accent-color": pillar.accentColor }}
              onClick={() => navigate("/login")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
            >
              <div
                className="pillar-icon"
                style={{ background: pillar.iconBg, color: pillar.accentColor }}
              >
                <Icon name={pillar.iconKey} color={pillar.accentColor} />
              </div>
              <div className="pillar-title">{pillar.title}</div>
              <div className="pillar-description">{pillar.description}</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
