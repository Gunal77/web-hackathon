import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk & Sentiment Aware Manu Grievance Intelligence Platform"
        subtitle="An analytics overlay on Mudhalvarin Mugavari to help collectors and officers prioritise high-risk and emotionally critical manus."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="For citizens">
          <p className="text-sm text-slate-700">
            Track the status of your submitted manus in a simple, transparent
            view. This demo uses mock data and does not expose internal risk or
            sentiment scores.
          </p>
          <div className="mt-4">
            <Link
              href="/citizen/dashboard"
              className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Open citizen dashboard
            </Link>
          </div>
        </Card>

        <Card title="For district collectors">
          <p className="text-sm text-slate-700">
            View district-wide risk heatmaps, severe distress signals, and
            taluk-wise backlog to support data-driven field instructions.
          </p>
          <div className="mt-4">
            <Link
              href="/collector/dashboard"
              className="inline-flex items-center rounded-full border border-indigo-600 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              Open collector dashboard
            </Link>
          </div>
        </Card>

        <Card title="For taluk officers">
          <p className="text-sm text-slate-700">
            Focused view of your taluk’s highest priority manus, with emphasis
            on high-risk and distress cases that require immediate attention.
          </p>
          <div className="mt-4">
            <Link
              href="/officer/dashboard"
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Open officer dashboard
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Risk-based prioritisation">
          <p className="text-sm text-slate-700">
            Manus are scored using a combination of risk level, sentiment and
            backlog days. High-risk grievances with severe distress are always
            surfaced to the top for officials.
          </p>
        </Card>
        <Card title="Sentiment-aware governance">
          <p className="text-sm text-slate-700">
            The platform gives special visual treatment to emotionally critical
            manus (\"Severe Distress\"), while keeping these signals visible only
            to authorised officials.
          </p>
        </Card>
      </div>
    </div>
  );
}

