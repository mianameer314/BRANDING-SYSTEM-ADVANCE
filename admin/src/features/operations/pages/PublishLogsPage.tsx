import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { Activity, RefreshCw } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { operationsApi } from "../api";
import { ErrorState } from "@/components/shared/ErrorState";
import { PublishLogTable } from "../components/PublishLogTable";
import { PublishLogStats } from "../components/PublishLogStats";
import { CustomSelect } from "@/components/shared/CustomSelect";

const STATUS_OPTIONS = [
  { value: "success", label: "Success", colorClass: "bg-emerald-500" },
  { value: "failed", label: "Failed", colorClass: "bg-red-500" }
];

const CONTENT_TYPES = [
  { value: "blog", label: "Blogs", colorClass: "bg-primary" },
  { value: "news", label: "News", colorClass: "bg-info" },
  { value: "project", label: "Projects", colorClass: "bg-success" },
  { value: "insight", label: "Insights", colorClass: "bg-warning" },
  { value: "case_study", label: "Case Studies", colorClass: "bg-destructive" },
];

export function PublishLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setHeaderState } = useOutletContext<any>();

  useEffect(() => {
    setHeaderState({
      title: 'Publish Logs',
      subtitle: 'Webhook delivery history and integration recovery controls.',
      showBackButton: false
    });
  }, [setHeaderState]);

  const [page, setPage] = useState(1);
  const perPage = 20;

  const filters = {
    status: searchParams.get("status") || "all",
    content_type: searchParams.get("content_type") || "all",
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['publish-logs', page, perPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      if (filters.status !== "all") params.append('status', filters.status);
      if (filters.content_type !== "all") params.append('content_type', filters.content_type);
      
      const res = await operationsApi.getPublishLogs(params);
      return res;
    },
    refetchInterval: 15000,
  });

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState message={(error as Error).message} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 30-Day Retention Banner */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600 mt-0.5">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Data Retention & Compliance</h3>
          <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
            In accordance with enterprise data management standards, webhook delivery logs are automatically securely archived and retained for <strong>30 days</strong>. Logs exceeding this retention period are routinely purged to ensure optimal system performance and compliance.
          </p>
        </div>
      </div>

      <PublishLogStats stats={data?.stats} isLoading={isLoading} />
      
      <div className="relative z-20 flex items-center justify-between bg-background/50 backdrop-blur border border-border/50 p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <CustomSelect
            options={STATUS_OPTIONS}
            value={filters.status === "all" ? "" : filters.status}
            onChange={(value) => handleFilterChange("status", value || "all")}
            placeholder="All Statuses"
            className="w-[160px]"
          />

          <CustomSelect
            options={CONTENT_TYPES}
            value={filters.content_type === "all" ? "" : filters.content_type}
            onChange={(value) => handleFilterChange("content_type", value || "all")}
            placeholder="All Types"
            className="w-[180px]"
          />
        </div>

        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border shadow-sm rounded-xl text-sm font-bold text-foreground hover:bg-muted/50 transition-all hover:shadow active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? 'animate-spin text-primary' : ''}`} />
          Refresh Logs
        </button>
      </div>

      <PublishLogTable 
        items={data?.items || []} 
        isLoading={isLoading} 
        page={page}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        onRetrySuccess={refetch}
      />

    </div>
  );
}
