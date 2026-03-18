"use client";

import { Header } from "@/components/layout/header";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div>
      <Header
        title="Analytics"
        description="Track listener engagement and growth across your podcasts"
      />
      <div className="p-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
