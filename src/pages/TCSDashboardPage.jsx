// TCS Governance Analytics Dashboard Page
// Fully converted to Apache ECharts (echarts v6 + echarts-for-react v3)

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { tcsDashboardService } from "../services/tcs-dashboard.service";
import { useTheme } from "../context/ThemeContext";
import { Icon } from "../components/Icon";
import { Footer } from "../components/Footer";

export default function TCSDashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [innerTab, setInnerTab] = useState("sla");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedTower, setSelectedTower] = useState("all");
  const [datePeriod, setDatePeriod] = useState("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await tcsDashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to load TCS Dashboard datasets:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading TCS Governance Dashboard...</p>
      </div>
    );
  }

  const {
    businessGroups,
    towers,
    overview,
    aiops,
    demand_reduction,
    aoc_shift_left,
  } = dashboardData;

  return (
    <>
      <div
        className="app-page-container"
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "90px 50px 80px",
          color: "var(--cen-text-primary, #ffffff)",
        }}
      >
        {/* Page Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={() => navigate("/domain/operations")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: "1px solid var(--cen-border, rgba(0, 0, 0, 0.12))",
                background: "var(--cen-bg-card, rgba(255, 255, 255, 0.9))",
                color: "var(--cen-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "18px",
                flexShrink: 0,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
              title="Back"
              aria-label="Go back"
            >
              <Icon name="arrowLeft" size={18} strokeWidth={2.5} />
            </button>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--cen-text-primary)",
                margin: 0,
              }}
            >
              TCS Dashboard
            </h1>
          </div>
        </div>

        {/* ===== MAIN TAB NAVIGATION ===== */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            marginBottom: "24px",
          }}
        >
          <MainTabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            label="Executive summary"
          />
          <MainTabButton
            active={activeTab === "business"}
            onClick={() => setActiveTab("business")}
            label="AIOps Dashboard"
          />
          <MainTabButton
            active={activeTab === "toil"}
            onClick={() => setActiveTab("toil")}
            label="Demand Reduction"
          />
          <MainTabButton
            active={activeTab === "aoc"}
            onClick={() => setActiveTab("aoc")}
            label="AOC Shift Left"
          />
        </div>

        {/* ===== SHARED FILTER HEADER (Present across ALL TABS) ===== */}
        <TCSFilterHeader
          businessGroups={businessGroups || []}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          datePeriod={datePeriod}
          setDatePeriod={setDatePeriod}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />

        {/* ===== TAB CONTENT VIEWS ===== */}
        {activeTab === "overview" && (
          <ExecutiveSummaryView
            data={overview}
            innerTab={innerTab}
            setInnerTab={setInnerTab}
            selectedGroup={selectedGroup}
            datePeriod={datePeriod}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}
        {activeTab === "business" && (
          <AIOpsView
            data={aiops}
            selectedGroup={selectedGroup}
            datePeriod={datePeriod}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}
        {activeTab === "toil" && (
          <DemandReductionView
            data={demand_reduction}
            selectedGroup={selectedGroup}
            datePeriod={datePeriod}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}
        {activeTab === "aoc" && (
          <AOCShiftLeftView
            data={aoc_shift_left}
            selectedGroup={selectedGroup}
            datePeriod={datePeriod}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

// Helper function to calculate dynamic multipliers based on filters
function getFilterMultipliers(selectedGroup, datePeriod, fromDate, toDate) {
  let groupMultiplier = 1.0;
  if (selectedGroup === "Shared Services") groupMultiplier = 0.35;
  else if (selectedGroup === "Clinical Systems") groupMultiplier = 0.25;
  else if (selectedGroup === "Membership & Enrollment") groupMultiplier = 0.20;
  else if (selectedGroup === "Claims, Provider & EDI") groupMultiplier = 0.12;
  else if (selectedGroup === "Digital, Call Center & Specialty") groupMultiplier = 0.08;

  let dateMultiplier = 1.0;
  if (datePeriod === "today") {
    dateMultiplier = 0.05;
  } else if (datePeriod === "1m") {
    dateMultiplier = 1.0;
  } else if (datePeriod === "1y") {
    dateMultiplier = 12.0;
  } else if (datePeriod === "custom" && fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    dateMultiplier = Math.max(0.1, Number((diffDays / 30).toFixed(2)));
  }

  return { groupMultiplier, dateMultiplier };
}

// Shared Filter Header Component (Date Picker & All Business Groups Dropdown Filter)
function TCSFilterHeader({
  businessGroups = [],
  selectedGroup,
  setSelectedGroup,
  datePeriod,
  setDatePeriod,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".cen-mega-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const currentGroupObj = businessGroups.find((g) => g.value === selectedGroup) || {
    value: "all",
    label: "All Business Groups",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px",
        padding: "0",
        background: "transparent",
        border: "none",
      }}
    >
      {/* Date Controls: Pills + Date Range Picker Inputs */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        {/* Date Pills */}
        <div
          className="cen-date-pills-wrap"
          style={{
            display: "flex",
            gap: "4px",
            padding: "3px",
            borderRadius: "6px",
          }}
        >
          {[
            { id: "today", label: "Today" },
            { id: "1m", label: "1 Month" },
            { id: "1y", label: "1 Year" },
          ].map((pill) => {
            const isActive = datePeriod === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  setDatePeriod(pill.id);
                  setFromDate("");
                  setToDate("");
                }}
                style={{
                  padding: "5px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: isActive ? "var(--blue2, #00a0ae)" : "transparent",
                  color: isActive ? "#ffffff" : "var(--cen-text-secondary, #94a3b8)",
                  fontSize: "12px",
                  fontWeight: isActive ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Date Range Picker (From and To) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="date"
            className="cen-date-input"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setDatePeriod("custom");
            }}
            placeholder="From"
          />
          <span style={{ color: "var(--cen-text-secondary, #94a3b8)", fontSize: "12px" }}>to</span>
          <input
            type="date"
            className="cen-date-input"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setDatePeriod("custom");
            }}
            placeholder="To"
          />
        </div>
      </div>

      {/* Business Group Dropdown Filter */}
      <div className="cen-mega-dropdown" style={{ position: "relative" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen((prev) => !prev);
          }}
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.08))",
            border: dropdownOpen
              ? "1px solid var(--blue2, #00a0ae)"
              : "1px solid var(--cen-border, rgba(255, 255, 255, 0.15))",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            color: "var(--cen-text-primary, #ffffff)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: "240px",
            justifyContent: "space-between",
            boxShadow: dropdownOpen ? "0 0 0 3px rgba(0, 160, 174, 0.15)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>{currentGroupObj.label}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              color: "var(--cen-text-secondary, #94a3b8)",
            }}
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "var(--cen-bg-card, #0d1e3a)",
              border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.15))",
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
              minWidth: "260px",
              zIndex: 1000,
              overflow: "hidden",
            }}
          >
            {businessGroups.map((bg) => {
              const isSelected = selectedGroup === bg.value;
              return (
                <div
                  key={bg.value}
                  onClick={() => {
                    setSelectedGroup(bg.value);
                    setDropdownOpen(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    fontSize: "13px",
                    color: isSelected ? "var(--blue2, #00a0ae)" : "var(--cen-text-secondary, #cbd5e1)",
                    fontWeight: isSelected ? "600" : "400",
                    background: isSelected ? "rgba(0, 160, 174, 0.12)" : "transparent",
                    cursor: "pointer",
                    borderLeft: isSelected ? "3px solid var(--blue2, #00a0ae)" : "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "var(--blue2, #00a0ae)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--cen-text-secondary, #cbd5e1)";
                    }
                  }}
                >
                  {bg.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component: Main Tab Button
function MainTabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: active ? "rgba(var(--blue2-rgb, 0, 159, 173), 0.15)" : "transparent",
        border: "none",
        borderBottom: active ? "3px solid var(--blue2)" : "3px solid transparent",
        borderRadius: "6px 6px 0px 0px",
        color: active ? "var(--blue2)" : "var(--cen-text-secondary)",
        fontWeight: active ? "600" : "500",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// Component Title Header with Vertical Teal Accent Bar
function ChartTitle({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
      <div style={{ width: "3.5px", height: "16px", background: "var(--blue2)", borderRadius: "2px" }} />
      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--cen-text-primary)" }}>
        {title}
      </span>
    </div>
  );
}

// Helper: ECharts Line / Area Config Generator
const createEChartsLineOption = ({
  color = "#009FDA",
  categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  data = [],
  seriesName = "Value",
  unit = "h",
  showSymbol = true,
  showLegend = true,
  min = 0,
  max = 20,
  interval = 2,
}) => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    backgroundColor: "#1e293b",
    borderColor: "rgba(255,255,255,0.1)",
    textStyle: { color: "#ffffff", fontSize: 12 },
    formatter: (params) => {
      const p = params[0];
      return `${p.name}<br/>${p.seriesName}: <b>${p.value}${unit}</b>`;
    },
  },
  grid: {
    top: "15%",
    left: "4%",
    right: "4%",
    bottom: showLegend ? "15%" : "8%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: categories,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "#94a3b8", fontSize: 12, fontWeight: 500 },
  },
  yAxis: {
    type: "value",
    min: min,
    max: max,
    interval: interval,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.08)", type: "solid" } },
    axisLabel: {
      color: "#94a3b8",
      fontSize: 11.5,
      formatter: `{value}${unit}`,
    },
  },
  legend: showLegend
    ? {
      bottom: "0%",
      textStyle: { color: "#94a3b8", fontSize: 12 },
      icon: "roundRect",
    }
    : undefined,
  series: [
    {
      name: seriesName,
      type: "line",
      smooth: true,
      showSymbol: showSymbol,
      symbol: "circle",
      symbolSize: 8,
      itemStyle: {
        color: color,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      lineStyle: {
        width: 2.5,
        color: color,
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(0, 159, 218, 0.35)" },
          { offset: 1, color: "rgba(0, 159, 218, 0.02)" },
        ]),
      },
      data: data,
    },
  ],
});

// ECharts Custom Donut Gauge
function SlaDoughnutEChart({ percentage, color, achievedLabel = "Achieved", gapLabel = "Gap" }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const labelColor = isLight ? "#005058" : "#ffffff";
  const gapTrackColor = isLight ? "rgba(0, 159, 173, 0.15)" : "rgba(208, 223, 240, 0.2)";

  // If percentage < 100%, automatically use exact orange (#F7941D) from guidewell-html, else green (#97D700)
  const chartColor = percentage < 100 ? "#F7941D" : (color || "#97D700");
  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: isLight ? "#ffffff" : "#1e293b",
      borderColor: isLight ? "rgba(0, 159, 173, 0.25)" : "rgba(255,255,255,0.1)",
      textStyle: { color: isLight ? "#005058" : "#ffffff", fontSize: 11 },
      formatter: (params) => {
        if (params.dataIndex === 0) return `${achievedLabel}: ${percentage}%`;
        return `${gapLabel}: ${100 - percentage}%`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["65%", "85%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "center",
          formatter: `${percentage}%`,
          fontSize: 22,
          fontWeight: "bold",
          color: labelColor,
          align: "center",
          verticalAlign: "middle",
        },
        emphasis: { scale: false },
        data: [
          { value: percentage, itemStyle: { color: chartColor } },
          { value: 100 - percentage, itemStyle: { color: gapTrackColor } },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ width: "160px", height: "160px", margin: "0 auto" }} />;
}

// ECharts Availability Ring Gauge
function AvailRingEChart({ percentage, color }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const labelColor = isLight ? "#005058" : "#ffffff";
  const gapTrackColor = isLight ? "rgba(0, 159, 173, 0.15)" : "rgba(255, 255, 255, 0.1)";

  // If percentage < 100%, automatically use exact orange (#F7941D) from guidewell-html, else green (#97D700)
  const chartColor = percentage < 100 ? "#F7941D" : (color || "#97D700");
  const option = {
    series: [
      {
        type: "pie",
        radius: ["65%", "85%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "center",
          formatter: `${percentage}%`,
          fontSize: 22,
          fontWeight: "bold",
          color: labelColor,
          align: "center",
          verticalAlign: "middle",
        },
        emphasis: { scale: false },
        data: [
          { value: percentage, itemStyle: { color: chartColor } },
          { value: 100 - percentage, itemStyle: { color: gapTrackColor } },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ width: "160px", height: "160px", margin: "0 auto" }} />;
}

// Map of exact icons & styles for Executive Summary KPI Cards (Matching guidewell-html)
const kpiIcons = {
  logged: { bg: "rgba(0, 159, 218, 0.15)", iconColor: "#009fda", name: "database" },
  resolved: { bg: "rgba(151, 215, 0, 0.18)", iconColor: "#97d700", name: "check-circle" },
  open: { bg: "rgba(247, 148, 29, 0.15)", iconColor: "#f7941d", name: "file-text" },
  major: { bg: "rgba(247, 148, 29, 0.15)", iconColor: "#f7941d", name: "shield-check" },
  auto: { bg: "rgba(0, 210, 211, 0.15)", iconColor: "#00d2d3", name: "zap" },
  mttr: { bg: "rgba(123, 94, 167, 0.15)", iconColor: "#7b5ea7", name: "clock" },
};

// Executive Summary View
function ExecutiveSummaryView({
  data,
  innerTab,
  setInnerTab,
  selectedGroup,
  datePeriod,
  fromDate,
  toDate,
}) {
  const { groupMultiplier, dateMultiplier } = getFilterMultipliers(
    selectedGroup,
    datePeriod,
    fromDate,
    toDate
  );

  const dynamicKpis = useMemo(() => {
    // 1 Month ("1m") defaults matching exact screenshot:
    let loggedVal = 520;
    let loggedBadge = "-8%";
    let loggedClass = "positive";

    let resolvedVal = 498;
    let resolvedBadge = "+6%";
    let resolvedClass = "positive";

    let openVal = 2650;
    let openBadge = "+3%";
    let openClass = "negative";

    let majorVal = 1;
    let majorBadge = "+100%";
    let majorClass = "warning";

    let autoVal = "35%";
    let autoBadge = "+4%";
    let autoClass = "positive";

    let mttrVal = "68 Hrs";
    let mttrBadge = "-10%";
    let mttrClass = "positive";

    if (datePeriod === "today") {
      loggedVal = 24;
      loggedBadge = "-12%";
      resolvedVal = 22;
      resolvedBadge = "+8%";
      openVal = 2500;
      openBadge = "+5%";
      majorVal = 0;
      majorBadge = "-";
      autoVal = "35%";
      autoBadge = "+3%";
      mttrVal = "72 Hrs";
      mttrBadge = "-5%";
    } else if (datePeriod === "1y") {
      loggedVal = 6240;
      loggedBadge = "-15%";
      resolvedVal = 5976;
      resolvedBadge = "+10%";
      openVal = 2650;
      openBadge = "-2%";
      majorVal = 8;
      majorBadge = "-20%";
      autoVal = "38%";
      autoBadge = "+5%";
      mttrVal = "64 Hrs";
      mttrBadge = "-12%";
    } else if (datePeriod === "custom") {
      loggedVal = Math.round(520 * dateMultiplier);
      resolvedVal = Math.round(498 * dateMultiplier);
      openVal = Math.round(2650 * (groupMultiplier > 0.5 ? 1 : groupMultiplier));
    }

    if (selectedGroup !== "all") {
      loggedVal = Math.round(loggedVal * groupMultiplier);
      resolvedVal = Math.round(resolvedVal * groupMultiplier);
      openVal = Math.round(openVal * groupMultiplier);
      if (selectedGroup !== "Clinical Systems") {
        majorVal = 0;
        majorBadge = "-";
      }
      if (selectedGroup === "Shared Services") autoVal = "42%";
      else if (selectedGroup === "Digital, Call Center & Specialty") autoVal = "48%";
    }

    return [
      {
        id: "logged",
        label: "Logged Incidents",
        value: loggedVal.toLocaleString(),
        trendBadge: loggedBadge,
        color: "#009FDA",
        badgeClass: loggedClass,
      },
      {
        id: "resolved",
        label: "Resolved Incidents",
        value: resolvedVal.toLocaleString(),
        trendBadge: resolvedBadge,
        color: "#97D700",
        badgeClass: resolvedClass,
      },
      {
        id: "open",
        label: "Open Inventory",
        value: openVal.toLocaleString(),
        trendBadge: openBadge,
        color: "#F7941D",
        badgeClass: openClass,
      },
      {
        id: "major",
        label: "Major Incidents",
        value: String(majorVal),
        trendBadge: majorBadge,
        color: "#F7941D",
        badgeClass: majorClass,
      },
      {
        id: "auto",
        label: "Auto Resolved",
        value: autoVal,
        trendBadge: autoBadge,
        color: "#00d2d3",
        badgeClass: autoClass,
      },
      {
        id: "mttr",
        label: "MTTR",
        value: mttrVal,
        trendBadge: mttrBadge,
        color: "#7b5ea7",
        badgeClass: mttrClass,
      },
    ];
  }, [groupMultiplier, dateMultiplier, selectedGroup, datePeriod]);

  const dynamicSlaList = useMemo(() => {
    return (data.slaGovernance || []).map((sla) => {
      let percentage = sla.percentage;
      if (selectedGroup !== "all") {
        if (sla.label.includes("Resolution")) {
          percentage = Math.min(100, Math.max(90, Math.round(sla.percentage * (0.95 + groupMultiplier * 0.1))));
        }
      }
      return { ...sla, percentage };
    });
  }, [data.slaGovernance, selectedGroup, groupMultiplier]);

  return (
    <div>
      {/* 6 KPI Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {dynamicKpis.map((kpi) => {
          const iconConfig = kpiIcons[kpi.id];
          const badgeBg =
            kpi.badgeClass === "negative"
              ? "rgba(239, 68, 68, 0.15)"
              : kpi.badgeClass === "warning"
              ? "rgba(247, 148, 29, 0.15)"
              : "rgba(151, 215, 0, 0.2)";
          const badgeColor =
            kpi.badgeClass === "negative"
              ? "#c62828"
              : kpi.badgeClass === "warning"
              ? "#d97706"
              : "#2e7d32";

          const trendDisplay =
            kpi.trendBadge && kpi.trendBadge.startsWith("+")
              ? `↑ ${kpi.trendBadge}`
              : kpi.trendBadge && kpi.trendBadge.startsWith("-") && kpi.trendBadge !== "-"
              ? `↓ ${kpi.trendBadge}`
              : kpi.trendBadge;

          return (
            <div
              key={kpi.id}
              style={{
                background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
                border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
                borderRadius: "12px",
                padding: "16px 18px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, ${kpi.color}, #8b5cf6)`,
                }}
              />
              
              {/* Header: Label + Top-Right Icon Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    color: "var(--cen-text-secondary, #94a3b8)",
                    textTransform: "uppercase",
                    lineHeight: "1.3",
                    paddingRight: "4px",
                  }}
                >
                  {kpi.label}
                </div>
                {iconConfig && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: iconConfig.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={iconConfig.name} size={15} color={iconConfig.iconColor} />
                  </div>
                )}
              </div>

              {/* Value & Badge */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: "700",
                    color: kpi.color || "var(--cen-text-primary, #ffffff)",
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </div>
                {kpi.trendBadge && (
                  <span
                    style={{
                      background: badgeBg,
                      color: badgeColor,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {trendDisplay}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inner Sub-Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "0",
          borderBottom: "1px solid var(--cen-border, rgba(255,255,255,0.12))",
          marginBottom: "20px",
          overflowX: "auto",
        }}
      >
        {data.innerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setInnerTab(tab.id)}
            style={{
              padding: "10px 18px",
              background: innerTab === tab.id ? "rgba(0, 159, 218, 0.08)" : "transparent",
              border: "none",
              borderBottom: innerTab === tab.id ? "2px solid #009fda" : "2px solid transparent",
              borderRadius: "6px 6px 0px 0px",
              color: innerTab === tab.id ? "#009fda" : "var(--cen-text-secondary, #94a3b8)",
              fontSize: "13px",
              fontWeight: innerTab === tab.id ? "600" : "500",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inner Sub-Tab Views */}
      {innerTab === "sla" && <SLAGovernanceView slaList={dynamicSlaList} />}
      {innerTab === "stability" && <ServiceStabilityView stability={data.serviceStability} />}
      {innerTab === "quality" && <IncidentQualityView quality={data.qualityMetrics} />}
      {innerTab === "trends" && <TicketTrendsView trends={data.ticketTrends} />}
      {innerTab === "major" && <MajorIncidentTrendsView major={data.majorTrends} />}
    </div>
  );
}

// Sub-Tab 1: SLA Governance (ECharts Donut Gauges)
function SLAGovernanceView({ slaList }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
      }}
    >
      {slaList.map((sla, i) => (
        <div
          key={i}
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "24px 16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", textAlign: "left", marginBottom: "14px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              {sla.label}
            </span>
          </div>

          <SlaDoughnutEChart
            percentage={sla.percentage}
            color={sla.color}
            achievedLabel="Achieved"
            gapLabel="Gap"
          />

          <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--cen-text-secondary, #94a3b8)", marginTop: "12px" }}>
            {sla.label ? sla.label.replace(/\s*SLA$/i, "") : ""}
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: "6px",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "700",
              background: "rgba(151, 215, 0, 0.15)",
              color: "#86c100",
            }}
          >
            {sla.status}
          </span>
        </div>
      ))}
    </div>
  );
}

// Sub-Tab 2: Service Stability (Lines and Dots together ONLY for Tech Debt)
function ServiceStabilityView({ stability }) {
  const techDebtOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e293b",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#ffffff", fontSize: 12 },
    },
    grid: { top: "12%", left: "6%", right: "6%", bottom: "18%", containLabel: true },
    legend: { bottom: "0%", textStyle: { color: "#94a3b8", fontSize: 11 } },
    xAxis: {
      type: "category",
      data: stability.techDebt.categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 11, fontWeight: 500 },
    },
    yAxis: [
      {
        type: "value",
        name: "Open as of Jan-2025",
        nameLocation: "middle",
        nameGap: 38,
        nameRotate: 90,
        nameTextStyle: { color: "#94a3b8", fontSize: 11, fontWeight: 500 },
        min: 0,
        max: 300,
        interval: 50,
        splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.08)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      {
        type: "value",
        name: "Opened / Closed",
        nameLocation: "middle",
        nameGap: 38,
        nameRotate: 270,
        nameTextStyle: { color: "#94a3b8", fontSize: 11, fontWeight: 500 },
        min: 0,
        max: 250,
        interval: 50,
        splitLine: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
    ],
    series: [
      {
        name: "Opened",
        type: "bar",
        yAxisIndex: 1,
        barWidth: "40%",
        itemStyle: { color: "#97D700", borderRadius: [2, 2, 0, 0] },
        data: [8, 45, 82, 28, 5, 65, 38, 12, 70, 22, 15, 50],
      },
      {
        name: "Open as of Jan-2025",
        type: "line",
        yAxisIndex: 0,
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#009FDA", borderColor: "#ffffff", borderWidth: 2 },
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0, 159, 218, 0.25)" },
            { offset: 1, color: "rgba(0, 159, 218, 0.01)" },
          ]),
        },
        data: stability.techDebt.openData,
      },
      {
        name: "Closed",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#f8961e", borderColor: "#ffffff", borderWidth: 2 },
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(248, 150, 30, 0.25)" },
            { offset: 1, color: "rgba(248, 150, 30, 0.01)" },
          ]),
        },
        data: stability.techDebt.closedData,
      },
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Row 1: 3 Cards Grid (Tier 1, Tier 2, Tech Debt) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "18px" }}>
        {/* Tier 1 Availability */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              Application Availability - Tier 1
            </span>
          </div>
          <AvailRingEChart percentage={stability.tier1Availability} color="#97D700" />
          <span
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "700",
              background: "rgba(151, 215, 0, 0.15)",
              color: "#86c100",
            }}
          >
            High Availability
          </span>
        </div>

        {/* Tier 2 Availability */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              Application Availability - Tier 2
            </span>
          </div>
          <AvailRingEChart percentage={stability.tier2Availability} color="#F7941D" />
          <span
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "700",
              background: "rgba(151, 215, 0, 0.15)",
              color: "#86c100",
            }}
          >
            High Availability
          </span>
        </div>

        {/* Tech Debt Management Mixed Chart */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <ChartTitle title="Total Open Tech Debts/Total Closed Tech Debts" />
          <ReactECharts option={techDebtOption} style={{ height: "190px" }} />
        </div>
      </div>

      {/* Row 2: Change Success Rate */}
      <div style={{ width: "320px", minWidth: "260px" }}>
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              Success Rate
            </span>
          </div>
          <SlaDoughnutEChart
            percentage={stability.changeSuccessRate}
            color="#97D700"
            achievedLabel="Success"
            gapLabel="Failed"
          />
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginTop: "8px" }}>
            Change Success Rate
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: "4px",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "700",
              background: "rgba(151, 215, 0, 0.15)",
              color: "#86c100",
            }}
          >
            Exceeds Target
          </span>
        </div>
      </div>
    </div>
  );
}

// Sub-Tab 3: Incident Resolution Quality
function IncidentQualityView({ quality }) {
  const agingOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { bottom: "0%", textStyle: { color: "#94a3b8", fontSize: 11 } },
    grid: { top: "10%", left: "3%", right: "3%", bottom: "18%", containLabel: true },
    xAxis: {
      type: "category",
      data: quality.aging.categories,
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } } },
    series: quality.aging.series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: "aging",
      barWidth: "32%",
      itemStyle: { color: s.color },
      data: s.data,
    })),
  };

  const mttrTrendOption = createEChartsLineOption({
    color: "#009FDA",
    categories: quality.mttrTrend.categories,
    data: quality.mttrTrend.series[0]?.data || [],
    seriesName: "MTTR",
    unit: "h",
    showSymbol: true,
    showLegend: false,
    min: 0,
    max: 8,
    interval: 2,
  });

  return (
    <div>
      {/* Row 1: 3 Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px 1.6fr",
          gap: "18px",
          alignItems: "stretch",
          marginBottom: "18px",
        }}
      >
        {/* Card 1: FTR Rate Doughnut 96% */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              First Time Resolution Rate
            </span>
          </div>
          <SlaDoughnutEChart
            percentage={quality.ftrPercentage}
            color="#F7941D"
            achievedLabel="Resolved First Time"
            gapLabel="Re-touched"
          />
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "700",
                background: "rgba(151, 215, 0, 0.15)",
                color: "#86c100",
              }}
            >
              +2% vs Target
            </span>
          </div>
        </div>

        {/* Card 2: Incidents Re-Opened KPI */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "24px 16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", textAlign: "left", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              Incidents Re-Opened
            </span>
          </div>
          <div style={{ fontSize: "52px", fontWeight: "700", color: "#97D700", lineHeight: 1, margin: "12px 0" }}>
            {quality.reopenedCount}
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>{quality.reopenLabel}</div>
          <span
            style={{
              background: "rgba(151, 215, 0, 0.15)",
              color: "#5a8200",
              fontSize: "11px",
              fontWeight: "600",
              padding: "4px 12px",
              borderRadius: "20px",
              marginTop: "8px",
            }}
          >
            ✓ Low Reopen Rate
          </span>
          <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "14px", lineHeight: "1.5" }}>
            Indicates strong first-contact resolution quality and effective root-cause analysis
          </p>
        </div>

        {/* Card 3: Incident Aging Open Tickets Stacked Bar */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              Incidents Aging - Open Tickets
            </span>
          </div>
          <ReactECharts option={agingOption} style={{ height: "220px" }} />
        </div>
      </div>

      {/* Row 2: MTTR Trend EChart (50% Width) */}
      <div style={{ width: "50%", minWidth: "320px" }}>
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <ChartTitle title="MTTR Trend (Hours)" />
          <ReactECharts option={mttrTrendOption} style={{ height: "240px" }} />
        </div>
      </div>
    </div>
  );
}

// Sub-Tab 4: Ticket Trends (4 Stacked Bar Charts: Inflow, Incident Volume, Problem Tickets, RITM)
function TicketTrendsView({ trends }) {
  const inflowOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { bottom: "0%", textStyle: { color: "#94a3b8", fontSize: 11 } },
    grid: { top: "10%", left: "3%", right: "3%", bottom: "18%", containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      max: 120,
      interval: 20,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: trends.towerInflow.categories,
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: trends.towerInflow.series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: "inflow",
      itemStyle: { color: s.color },
      data: s.data,
    })),
  };

  const volumeOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { top: "0%", textStyle: { color: "#94a3b8", fontSize: 11 } },
    grid: { top: "15%", left: "3%", right: "3%", bottom: "10%", containLabel: true },
    xAxis: { type: "category", data: trends.volumeTrends.categories, axisLabel: { color: "#94a3b8", fontSize: 11 } },
    yAxis: {
      type: "value",
      min: 0,
      max: 18000,
      interval: 2000,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: trends.volumeTrends.series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: "volume",
      itemStyle: { color: s.color },
      data: s.data,
    })),
  };

  const problemOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { bottom: "0%", textStyle: { color: "#94a3b8", fontSize: 11 } },
    grid: { top: "10%", left: "3%", right: "3%", bottom: "18%", containLabel: true },
    xAxis: { type: "category", data: trends.problemTickets?.categories || trends.volumeTrends.categories, axisLabel: { color: "#94a3b8", fontSize: 11 } },
    yAxis: {
      type: "value",
      min: 0,
      max: 60,
      interval: 20,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: (trends.problemTickets?.series || []).map((s) => ({
      name: s.name,
      type: "bar",
      stack: "prob",
      itemStyle: { color: s.color },
      data: s.data,
    })),
  };

  const ritmOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { bottom: "0%", textStyle: { color: "#94a3b8", fontSize: 11 } },
    grid: { top: "10%", left: "3%", right: "3%", bottom: "18%", containLabel: true },
    xAxis: { type: "category", data: trends.ritmTrends?.categories || trends.volumeTrends.categories, axisLabel: { color: "#94a3b8", fontSize: 11 } },
    yAxis: {
      type: "value",
      min: 0,
      max: 3500,
      interval: 500,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: (trends.ritmTrends?.series || []).map((s) => ({
      name: s.name,
      type: "bar",
      stack: "ritm",
      itemStyle: { color: s.color },
      data: s.data,
    })),
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
      {/* Chart 1: Top 5 Towers - Ticket Inflow */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <ChartTitle title="Top 5 Towers - Ticket Inflow" />
        <ReactECharts option={inflowOption} style={{ height: "280px" }} />
      </div>

      {/* Chart 2: Incident Volume Trends */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <ChartTitle title="Incident Volume Trends" />
        <ReactECharts option={volumeOption} style={{ height: "280px" }} />
      </div>

      {/* Chart 3: Problem Tickets Trend */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <ChartTitle title="Problem Tickets Trend" />
        <ReactECharts option={problemOption} style={{ height: "280px" }} />
      </div>

      {/* Chart 4: RITM Trend */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <ChartTitle title="RITM Trend" />
        <ReactECharts option={ritmOption} style={{ height: "280px" }} />
      </div>
    </div>
  );
}

// Sub-Tab 5: Major Incident Trends (ECharts Lines and Stacked Bar)
function MajorIncidentTrendsView({ major }) {
  const mttdOption = createEChartsLineOption({
    color: "#009FDA",
    categories: major.mttd.categories,
    data: major.mttd.series[0]?.data || [],
    seriesName: "MTTD",
    unit: " mins",
    showSymbol: true,
    showLegend: true,
    min: 0,
    max: 30,
    interval: 5,
  });

  const majorOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { bottom: "0%", textStyle: { color: "#94a3b8", fontSize: 11 } },
    grid: { top: "10%", left: "3%", right: "3%", bottom: "18%", containLabel: true },
    xAxis: { type: "category", data: major.majorIncidents.categories, axisLabel: { color: "#94a3b8", fontSize: 11 } },
    yAxis: {
      type: "value",
      min: 0,
      max: 30,
      interval: 2,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: major.majorIncidents.series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: "major",
      itemStyle: { color: s.color },
      data: s.data,
    })),
  };

  const mttrOption = createEChartsLineOption({
    color: "#009FDA",
    categories: major.mttr.categories,
    data: major.mttr.series[0]?.data || [],
    seriesName: "MTTR (hours)",
    unit: "h",
    showSymbol: true,
    showLegend: true,
    min: 0,
    max: 20,
    interval: 2,
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
      {/* MTTD Trend EChart */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "16px",
          padding: "20px 24px",
        }}
      >
        <ChartTitle title="MTTD Trend — Major Incidents (Mins)" />
        <ReactECharts option={mttdOption} style={{ height: "260px" }} />
      </div>

      {/* Major Incident Trends Stacked Bar */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "16px",
          padding: "20px 24px",
        }}
      >
        <ChartTitle title="Major Incident Trends" />
        <ReactECharts option={majorOption} style={{ height: "260px" }} />
      </div>

      {/* MTTR Trend (Hours) EChart */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "16px",
          padding: "20px 24px",
        }}
      >
        <ChartTitle title="MTTR Trend (Hours)" />
        <ReactECharts option={mttrOption} style={{ height: "260px" }} />
      </div>
    </div>
  );
}

// Main Tab 2: AIOps View (Matches guidewell-html AIOps Dashboard)
function AIOpsView({ data, selectedGroup, datePeriod, fromDate, toDate }) {
  const { groupMultiplier, dateMultiplier } = getFilterMultipliers(
    selectedGroup,
    datePeriod,
    fromDate,
    toDate
  );

  const dynamicSummary = useMemo(() => {
    const effortsSaved = Math.round(14200 * groupMultiplier * (datePeriod === "today" ? 0.08 : dateMultiplier));
    const costAvoided = Math.round(500 * groupMultiplier * (datePeriod === "today" ? 0.08 : dateMultiplier));
    const autoResolved = selectedGroup === "Shared Services" ? "42%" : selectedGroup === "Digital, Call Center & Specialty" ? "48%" : "35%";
    const aiVsHuman = selectedGroup === "Shared Services" ? "3:1" : selectedGroup === "Clinical Systems" ? "2.5:1" : "2:1";

    return [
      { label: "Efforts Saved (Hrs)", value: effortsSaved.toLocaleString(), color: "#00d2d3" },
      { label: "Cost Avoided", value: `${costAvoided}k $`, color: "#a78bfa" },
      { label: "Tickets Auto Resolved", value: autoResolved, color: "#f8961e" },
      { label: "AI Vs Human Resolution", value: aiVsHuman, color: "#2dd36f" },
    ];
  }, [groupMultiplier, dateMultiplier, datePeriod, selectedGroup]);

  const dynamicPortfolio = useMemo(() => {
    return (data.automationPortfolio || []).map((item) => {
      const count = Math.round((parseInt(item.count) || 120) * groupMultiplier);
      return { ...item, count };
    });
  }, [data.automationPortfolio, groupMultiplier]);

  return (
    <div>

      {/* 1. AIOps Dashboard Summary Header & Cards */}
      <div style={{ marginBottom: "12px" }}>
        <ChartTitle title="AIOps Dashboard Summary" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {dynamicSummary.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
              border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
              borderRadius: "12px",
              padding: "24px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: card.color,
                lineHeight: 1,
                marginBottom: "8px",
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-secondary, #94a3b8)" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Automation Portfolio, Shift-Left, AI Cost Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
        {/* Card 1: Automation Portfolio */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)", marginBottom: "18px" }}>
            Automation Portfolio
          </div>
          {dynamicPortfolio.map((item, idx) => (
            <div key={idx} style={{ marginBottom: idx === 2 ? 0 : "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>{item.label}</span>
                <span style={{ fontSize: "13px", color: item.color, fontWeight: "600" }}>{item.count}</span>
              </div>
              <div className="cen-progress-track">
                <div style={{ background: item.color, height: "100%", width: `${item.percentage}%`, borderRadius: "8px", transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Card 2: Shift-Left Effectiveness */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <div style={{ width: "3.5px", height: "16px", background: "var(--blue2, #00a0ae)", borderRadius: "2px" }} />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)" }}>
              Shift-Left Effectiveness
            </span>
          </div>

          {/* GuideWell Queries Stacked Bar */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>GuideWell Queries</span>
              <span style={{ fontSize: "13px", color: "var(--cen-text-primary, #ffffff)", fontWeight: "700" }}>42% / 58%</span>
            </div>
            <div className="cen-progress-track" style={{ display: "flex" }}>
              <div style={{ background: "#2dd36f", width: "42%" }} />
              <div style={{ background: "#a78bfa", width: "58%" }} />
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "11px", color: "var(--cen-text-secondary, #94a3b8)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", background: "#2dd36f", borderRadius: "2px" }} />
                <span>Resolved Without Ticket (42%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", background: "#a78bfa", borderRadius: "2px" }} />
                <span>Converted to Ticket (58%)</span>
              </div>
            </div>
          </div>

          {/* Noise Reduction */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>Noise Reduction</span>
              <span style={{ fontSize: "13px", color: "#2dd36f", fontWeight: "700" }}>43%</span>
            </div>
            <div className="cen-progress-track">
              <div style={{ background: "#2dd36f", height: "100%", width: "43%", borderRadius: "8px" }} />
            </div>
          </div>

          {/* Runbooks Automated */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>Runbooks Automated</span>
              <span style={{ fontSize: "13px", color: "#00c4ff", fontWeight: "700" }}>42%</span>
            </div>
            <div className="cen-progress-track">
              <div style={{ background: "#00c4ff", height: "100%", width: "42%", borderRadius: "8px" }} />
            </div>
          </div>

          {/* KB Recommendation Accuracy */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>KB Recommendation Accuracy</span>
              <span style={{ fontSize: "13px", color: "#a78bfa", fontWeight: "700" }}>75%</span>
            </div>
            <div className="cen-progress-track">
              <div style={{ background: "#a78bfa", height: "100%", width: "75%", borderRadius: "8px" }} />
            </div>
          </div>
        </div>

        {/* Card 3: AI Cost & Value Governance */}
        <div
          style={{
            background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--cen-text-primary, #ffffff)", marginBottom: "18px" }}>
            AI Cost & Value Governance
          </div>

          {/* Progress 1: Total AI Ops Cost (YTD) */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>Total AI Ops Cost (YTD)</span>
              <span style={{ fontSize: "13px", color: "#f8961e", fontWeight: "600" }}>$150K</span>
            </div>
            <div className="cen-progress-track">
              <div style={{ background: "#f8961e", height: "100%", width: "53%", borderRadius: "8px" }} />
            </div>
          </div>

          {/* Progress 2: Cost per Auto-Resolved Ticket */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>Cost per Auto-Resolved Ticket</span>
              <span style={{ fontSize: "13px", color: "#2dd36f", fontWeight: "600" }}>$5</span>
            </div>
            <div className="cen-progress-track">
              <div style={{ background: "#2dd36f", height: "100%", width: "5%", borderRadius: "8px" }} />
            </div>
          </div>

          {/* Progress 3: Token Usage */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>Token Usage</span>
              <span style={{ fontSize: "13px", color: "#00d2d3", fontWeight: "600" }}>128M</span>
            </div>
            <div className="cen-progress-track">
              <div style={{ background: "#00d2d3", height: "100%", width: "45.2%", borderRadius: "8px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Tab 3: Demand Reduction View (Matches guidewell-html DRO Summary & Item Details)
function DemandReductionView({ data, selectedGroup, datePeriod, fromDate, toDate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const { groupMultiplier, dateMultiplier } = getFilterMultipliers(
    selectedGroup,
    datePeriod,
    fromDate,
    toDate
  );

  const filteredRows = useMemo(() => {
    return (data.droTableRows || []).filter((r) => {
      if (selectedGroup !== "all" && r.businessGroup !== selectedGroup) return false;
      if (
        searchTerm &&
        !r.taskId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.app.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [data.droTableRows, selectedGroup, searchTerm]);

  const dynamicSummary = useMemo(() => {
    const incPrevented = Math.round(13500 * groupMultiplier * (datePeriod === "today" ? 0.08 : dateMultiplier));
    const effortSaved = Math.round(2000 * groupMultiplier * (datePeriod === "today" ? 0.08 : dateMultiplier));
    const implemented = Math.round(75 * groupMultiplier);
    const inProgress = Math.round(25 * groupMultiplier);
    const backlog = Math.round(50 * groupMultiplier);

    return [
      { label: "Incidents Prevented", value: incPrevented.toLocaleString(), subtitle: "(YTD)", color: "#00d2d3" },
      { label: "Effort Savings (Hours)", value: effortSaved.toLocaleString(), subtitle: "(YTD)", color: "#a78bfa" },
      { label: "Tasks Implemented", value: implemented.toLocaleString(), subtitle: "(YTD)", color: "#2dd36f" },
      { label: "Tasks in Progress", value: String(inProgress), subtitle: "", color: "#f8961e" },
      { label: "Task Backlog", value: String(backlog), subtitle: "", color: "#e55353" },
    ];
  }, [groupMultiplier, dateMultiplier, datePeriod]);

  const maxPage = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* DRO Summary Section Header */}
      <div style={{ marginBottom: "12px" }}>
        <ChartTitle title="DRO Summary" />
      </div>

      {/* 5-Card ROI Summary Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {dynamicSummary.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
              border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
              borderRadius: "12px",
              padding: "20px 18px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: card.color,
                lineHeight: 1,
                marginBottom: "8px",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {card.value}
              {card.subtitle && (
                <span style={{ fontSize: "12px", color: "var(--cen-text-secondary, #94a3b8)", fontWeight: "500" }}>
                  {card.subtitle}
                </span>
              )}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--cen-text-secondary, #94a3b8)" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* DRO Item Details Section Header */}
      <div style={{ marginBottom: "12px" }}>
        <ChartTitle title="DRO Item Details" />
      </div>

      {/* DRO Table */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search by Task ID, Title, or Application..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 14px",
              background: "var(--cen-bg-input, rgba(255,255,255,0.05))",
              border: "1px solid var(--cen-border-input, rgba(255,255,255,0.15))",
              borderRadius: "6px",
              color: "var(--cen-text-primary, #ffffff)",
              fontSize: "12px",
              width: "280px",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--cen-text-secondary, #94a3b8)" }}>
            Showing {pagedRows.length} of {filteredRows.length} items
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cen-table-row-border, rgba(255,255,255,0.12))", textAlign: "left" }}>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>Task ID</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>Title</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>Business Group</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>Application Name</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>Incident Savings/Month</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>Effort Savings/Month</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((r) => (
                <tr key={r.taskId} style={{ borderBottom: "1px solid var(--cen-table-row-border, rgba(255,255,255,0.06))" }}>
                  <td style={{ padding: "12px 10px", fontWeight: "600", color: "#009fda" }}>{r.taskId}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-primary, #ffffff)" }}>{r.title}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-secondary, #94a3b8)" }}>{r.businessGroup}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-secondary, #94a3b8)" }}>{r.app}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-primary, #ffffff)" }}>{r.incidentSavings}</td>
                  <td style={{ padding: "12px 10px", color: "#2dd36f", fontWeight: "600" }}>{r.effortSavings} Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "12px", color: "var(--cen-text-secondary, #94a3b8)" }}>
          <button
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #009FDA 0%, #0077A3 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Submit New Toil Item
          </button>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ padding: "4px 10px", background: "var(--cen-bg-input, rgba(255,255,255,0.08))", border: "none", color: "var(--cen-text-primary, #fff)", borderRadius: "4px", cursor: "pointer" }}
            >
              Prev
            </button>
            <span>Page {page} of {maxPage}</span>
            <button
              disabled={page >= maxPage}
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              style={{ padding: "4px 10px", background: "var(--cen-bg-input, rgba(255,255,255,0.08))", border: "none", color: "var(--cen-text-primary, #fff)", borderRadius: "4px", cursor: "pointer" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Tab 4: AOC Shift Left View (Matches guidewell-html AOC Shift Summary & Item Details)
function AOCShiftLeftView({ data, selectedGroup, datePeriod, fromDate, toDate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { groupMultiplier, dateMultiplier } = getFilterMultipliers(
    selectedGroup,
    datePeriod,
    fromDate,
    toDate
  );

  const rows = data.aocTableRows || [];

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (selectedGroup !== "all" && r.businessGroup !== selectedGroup) return false;
      if (
        searchTerm &&
        !r.intakeId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.processTitle.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.app.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rows, selectedGroup, searchTerm]);

  const dynamicSummary = useMemo(() => {
    let resRate = "20%";
    let activeSOPs = Math.round(300 * groupMultiplier);
    let backlogSOPs = Math.round(55 * groupMultiplier);

    if (selectedGroup !== "all") {
      resRate = `${Math.round(20 * (groupMultiplier > 0.2 ? 1.05 : 0.9))}%`;
    }

    return [
      { label: "L1.5 Ticket Resolution", value: resRate, color: "#00c4ff" },
      { label: "Active SOPs", value: activeSOPs.toLocaleString(), color: "#a78bfa" },
      { label: "SOPs in Backlog", value: backlogSOPs.toLocaleString(), color: "#2dd36f" },
    ];
  }, [groupMultiplier, selectedGroup]);

  const maxPage = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* 1. AOC Shift Summary Section Header */}
      <div style={{ marginBottom: "12px" }}>
        <ChartTitle title="AOC Shift Summary" />
      </div>

      {/* 3-Card Summary Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {dynamicSummary.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
              border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
              borderRadius: "12px",
              padding: "24px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: card.color,
                lineHeight: 1,
                marginBottom: "8px",
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--cen-text-secondary, #94a3b8)" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* 2. AOC Shift Item Details Section Header */}
      <div style={{ marginBottom: "12px" }}>
        <ChartTitle title="AOC Shift Item Details" />
      </div>

      {/* 3. AOC Shift Item Details Table */}
      <div
        style={{
          background: "var(--cen-bg-card, rgba(255, 255, 255, 0.04))",
          border: "1px solid var(--cen-border, rgba(255, 255, 255, 0.12))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search by Intake ID, Title, or Application.."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 14px",
              background: "var(--cen-bg-input, rgba(255,255,255,0.05))",
              border: "1px solid var(--cen-border-input, rgba(255,255,255,0.15))",
              borderRadius: "6px",
              color: "var(--cen-text-primary, #ffffff)",
              fontSize: "12px",
              width: "300px",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--cen-text-secondary, #94a3b8)" }}>
            Showing {pagedRows.length} of {filteredRows.length} items
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cen-table-row-border, rgba(255,255,255,0.12))", textAlign: "left" }}>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>INTAKE ID</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>TOWER</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>BUSINESS GROUP</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>APPLICATION NAME</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>PROCESS TITLE</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>FREQUENCY</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>AOC EFFORT (HRS/MONTH)</th>
                <th style={{ padding: "10px", color: "var(--cen-text-primary, #ffffff)" }}>AUTOMATED</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--cen-table-row-border, rgba(255,255,255,0.06))" }}>
                  <td style={{ padding: "12px 10px", fontWeight: "600", color: "#009fda" }}>{r.intakeId}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-secondary, #94a3b8)" }}>{r.tower}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-secondary, #94a3b8)" }}>{r.businessGroup}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-primary, #ffffff)", fontWeight: "500" }}>{r.app}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-primary, #ffffff)" }}>{r.processTitle}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-secondary, #94a3b8)" }}>{r.frequency}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-primary, #ffffff)" }}>{r.effort}</td>
                  <td style={{ padding: "12px 10px", color: "var(--cen-text-primary, #ffffff)" }}>{r.automated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "12px", color: "var(--cen-text-secondary, #94a3b8)" }}>
          <button
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #009FDA 0%, #0077A3 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Submit New Toil Item
          </button>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ padding: "4px 10px", background: "var(--cen-bg-input, rgba(255,255,255,0.08))", border: "none", color: "var(--cen-text-primary, #fff)", borderRadius: "4px", cursor: "pointer" }}
            >
              Prev
            </button>
            <span>Page {page} of {maxPage}</span>
            <button
              disabled={page >= maxPage}
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              style={{ padding: "4px 10px", background: "var(--cen-bg-input, rgba(255,255,255,0.08))", border: "none", color: "var(--cen-text-primary, #fff)", borderRadius: "4px", cursor: "pointer" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
