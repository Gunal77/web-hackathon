"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ManuCitizenList } from "@/components/manu/ManuCitizenList";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { useManus } from "@/components/providers/ManuProvider";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
import { districtTaluks, tamilNaduDistricts } from "@/lib/mock-data/manus";

export default function CitizenDashboardPage() {
  const { manus, addManu } = useManus();
  const [searchId, setSearchId] = useState("");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedManuId, setSelectedManuId] = useState<string | null>(null);
  const [formDistrict, setFormDistrict] = useState("");
  const [formTaluk, setFormTaluk] = useState("");

  const filtered = useMemo(() => {
    return manus.filter((m) => {
      if (searchId && !m.id.includes(searchId.trim())) return false;
      if (district && m.district !== district) return false;
      if (taluk && m.taluk !== taluk) return false;
      return true;
    });
  }, [manus, searchId, district, taluk]);

  const districts = Array.from(new Set(manus.map((m) => m.district)));
  const taluksForDistrict = district
    ? Array.from(
        new Set(
          manus
            .filter((m) => m.district === district)
            .map((m) => m.taluk)
        )
      )
    : [];

  const selectedManu = selectedManuId
    ? manus.find((m) => m.id === selectedManuId) ?? null
    : null;

  const formTaluksForDistrict = formDistrict
    ? (districtTaluks as Record<string, string[]>)[formDistrict] ?? []
    : [];

  function handleCreateManu(formData: FormData) {
    const citizenName = String(formData.get("citizenName") ?? "").trim();
    const departmentCategory = formData.get(
      "departmentCategory"
    ) as any;
    const title = String(formData.get("title") ?? "").trim();
    const descriptionText = String(
      formData.get("descriptionText") ?? ""
    ).trim();

    if (
      !citizenName ||
      !formDistrict ||
      !formTaluk ||
      !departmentCategory ||
      !title ||
      !descriptionText
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    addManu({
      citizenName,
      district: formDistrict,
      taluk: formTaluk,
      departmentCategory,
      title,
      descriptionText
    });

    setShowCreate(false);
    setFormDistrict("");
    setFormTaluk("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citizen dashboard"
        subtitle="Track the status of your manus as recorded in the system. This view does not show internal risk or sentiment scoring."
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Create new manu
          </button>
        }
      />

      <DashboardCard
        title="Filter manus"
        subtitle="Quickly narrow down to your manu using ID, district or taluk."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search by Manu ID
            </label>
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. 12"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              District
            </label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setTaluk("");
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Taluk
            </label>
            <select
              value={taluk}
              onChange={(e) => setTaluk(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={!district}
            >
              <option value="">All</option>
              {taluksForDistrict.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            <p className="mt-5">
              Data shown here is mock data for demonstration only. For privacy,
              internal risk and sentiment analysis is reserved for officials.
            </p>
          </div>
        </div>
      </DashboardCard>

      {showCreate && (
        <DashboardCard
          title="Create a new manu"
          subtitle="Describe your issue in as much detail as possible. Officials will use internal analysis to prioritise cases."
          rightSlot={
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          }
        >
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateManu(formData);
              e.currentTarget.reset();
            }}
          >
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Citizen name
              </label>
              <input
                name="citizenName"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Your name"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                District
              </label>
              <select
              name="district"
              value={formDistrict}
              onChange={(e) => {
                setFormDistrict(e.target.value);
                setFormTaluk("");
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select district</option>
              {tamilNaduDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Taluk
              </label>
            {formTaluksForDistrict.length > 0 ? (
              <select
                name="taluk"
                value={formTaluk}
                onChange={(e) => setFormTaluk(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={!formDistrict}
                required
              >
                <option value="">Select taluk</option>
                {formTaluksForDistrict.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="taluk"
                value={formTaluk}
                onChange={(e) => setFormTaluk(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter taluk"
                disabled={!formDistrict}
                required
              />
            )}
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Department
              </label>
              <select
                name="departmentCategory"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                <option value="">Select department</option>
                <option value="Health">Health</option>
                <option value="Revenue">Revenue</option>
                <option value="Electricity">Electricity</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Roads">Roads</option>
                <option value="Police">Police</option>
                <option value="Education">Education</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Manu title
              </label>
              <input
                name="title"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Short title summarising the issue"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Manu description
              </label>
              <textarea
                name="descriptionText"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={4}
                placeholder="Describe your grievance in detail. Do not include sensitive personal information."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Optional attachment
              </label>
              <input
                type="file"
                name="attachment"
                className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Attach supporting documents if needed. Files are not uploaded in
                this demo.
              </p>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Submit manu
              </button>
            </div>
          </form>
        </DashboardCard>
      )}

      <ManuCitizenList
        manus={filtered}
        onViewTracking={(manu) => setSelectedManuId(manu.id)}
      />

      {selectedManu && (
        <TrackingTimeline manu={selectedManu} isOfficialView={false} />
      )}
    </div>
  );
}

