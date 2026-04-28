"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Plane, User, GraduationCap, Search } from "lucide-react";
import Link from "next/link";

interface Arrival {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  arrivalDate: string;
  university?: { name: string };
  program?: { name: string };
  acceptanceLetterUrl?: string;
  acceptanceLetterFileName?: string;
  documents?: { documentType: string; fileUrl: string; fileName: string }[];
}

export default function ArrivalsPage() {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [filtered, setFiltered] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchArrivals();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      arrivals.filter(
        (a) =>
          a.fullName.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.university?.name?.toLowerCase().includes(term) ||
          a.country?.toLowerCase().includes(term)
      )
    );
  }, [search, arrivals]);

  const fetchArrivals = async () => {
    try {
      const apps = await apiGet<any[]>("/applications");
      const withArrival = apps
        .filter((a) => a.status === "APPROVED" && a.arrivalDate)
        .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());
      setArrivals(withArrival);
      setFiltered(withArrival);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "long", year: "numeric" });

  const isUpcoming = (d: string) => new Date(d) >= new Date();
  const isPast     = (d: string) => new Date(d) < new Date();

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
            <Plane className="w-7 h-7 text-sky-500" />
            Student Arrivals
          </h1>
          <p className="text-gray-500 mt-1">All accepted students with confirmed arrival dates.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{filtered.length} students</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <p className="text-xs text-sky-600 font-semibold">Total with Arrival Date</p>
          <p className="text-2xl font-bold text-sky-800">{arrivals.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-semibold">Upcoming</p>
          <p className="text-2xl font-bold text-emerald-800">{arrivals.filter((a) => isUpcoming(a.arrivalDate)).length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-semibold">Past</p>
          <p className="text-2xl font-bold text-gray-800">{arrivals.filter((a) => isPast(a.arrivalDate)).length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-semibold">This Month</p>
          <p className="text-2xl font-bold text-[#121c67]">
            {arrivals.filter((a) => {
              const d = new Date(a.arrivalDate);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email, university, country…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No arrival dates found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const upcoming = isUpcoming(a.arrivalDate);
            const flightTicket = a.documents?.find((d) => d.documentType === "other" || d.fileName?.toLowerCase().includes("ticket") || d.fileName?.toLowerCase().includes("flight"));
            return (
              <div
                key={a.id}
                className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4 ${upcoming ? "border-sky-200" : "border-gray-200 opacity-75"}`}
              >
                {/* Date badge */}
                <div className={`shrink-0 rounded-xl px-4 py-3 text-center min-w-[90px] ${upcoming ? "bg-sky-100 text-sky-800" : "bg-gray-100 text-gray-500"}`}>
                  <Calendar className="w-5 h-5 mx-auto mb-1 opacity-70" />
                  <p className="text-xs font-bold leading-tight">{formatDate(a.arrivalDate)}</p>
                  {upcoming && (
                    <span className="inline-block mt-1 text-[10px] bg-sky-200 text-sky-800 rounded-full px-2 py-0.5 font-semibold">Upcoming</span>
                  )}
                </div>

                {/* Student info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="font-semibold text-gray-900 truncate">{a.fullName}</p>
                    {a.country && <span className="text-xs text-gray-400 shrink-0">({a.country})</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{a.email}{a.phone && ` • ${a.phone}`}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{a.university?.name ?? "—"}{a.program?.name ? ` — ${a.program.name}` : ""}</span>
                  </div>
                </div>

                {/* Flight ticket */}
                <div className="shrink-0 flex flex-col gap-2 text-sm">
                  {flightTicket ? (
                    <a
                      href={flightTicket.fileUrl.startsWith("http") ? flightTicket.fileUrl : `${API_BASE_URL.replace("/api/v1", "")}${flightTicket.fileUrl}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sky-600 hover:underline"
                    >
                      <Plane className="w-4 h-4" /> View Ticket
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs flex items-center gap-1"><Plane className="w-4 h-4" />No ticket yet</span>
                  )}
                  {a.acceptanceLetterUrl && (
                    <a
                      href={a.acceptanceLetterUrl.startsWith("http") ? a.acceptanceLetterUrl : `${API_BASE_URL.replace("/api/v1", "")}${a.acceptanceLetterUrl}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:underline"
                    >
                      <Download className="w-4 h-4" /> Acceptance Letter
                    </a>
                  )}
                </div>

                {/* Link to app */}
                <div className="shrink-0">
                  <Link href={`/dashboard/applications/${a.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">View Application</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
