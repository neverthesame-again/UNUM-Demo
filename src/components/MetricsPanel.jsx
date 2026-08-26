// MetricsPanel Component - Display metrics cards and chart

import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export const MetricsPanel = ({ domain }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const base = [38, 52, 64, 78, 88, 96];
    const data = base.map((v) => Math.round(v * (0.92 + Math.random() * 0.16)));

    const rootStyles = getComputedStyle(document.documentElement);
    const navyRgb = rootStyles.getPropertyValue("--navy-rgb").trim();
    const whiteRgb = rootStyles.getPropertyValue("--white-rgb").trim();
    const mutedColor = rootStyles.getPropertyValue("--muted").trim();

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Usage Index",
            data,
            borderColor: domain.accentColor,
            backgroundColor: `${domain.accentColor}18`,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: domain.accentColor,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: `rgba(${navyRgb}, 0.9)`,
            borderColor: `rgba(${whiteRgb}, 0.1)`,
            borderWidth: 1,
            padding: 10,
          },
        },
        scales: {
          x: {
            grid: {
              color: `rgba(${whiteRgb}, 0.05)`,
            },
            ticks: {
              color: mutedColor,
              font: {
                size: 11,
              },
            },
          },
          y: {
            grid: {
              color: `rgba(${whiteRgb}, 0.05)`,
            },
            ticks: {
              color: mutedColor,
              font: {
                size: 11,
              },
            },
            beginAtZero: true,
            max: 100,
            suggestedMin: 0,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [domain.accentColor]);

  return (
    <>
      <div className="metrics-grid">
        {domain.metrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-number">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
          </div>
        ))}
      </div>
      <div className="chart-box">
        <div className="prototype-label" style={{ marginBottom: "18px" }}>
          Adoption & Usage Trend — Last 6 Months
        </div>
        <div style={{ height: "240px" }}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </>
  );
};
