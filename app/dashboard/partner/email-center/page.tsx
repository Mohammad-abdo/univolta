"use client";

import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

type Draft = {
  id: string;
  title: string;
  subject: string;
  message: string;
  updatedAt?: string;
};

type EmailLog = {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: string;
  createdAt: string;
  sentAt?: string | null;
  errorMessage?: string | null;
};

type Program = { id: string; name: string };

export default function PartnerEmailCenterPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [programId, setProgramId] = useState("");
  const [country, setCountry] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [audienceCount, setAudienceCount] = useState(0);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadInitial();
  }, []);

  useEffect(() => {
    void refreshAudienceCount();
  }, [status, programId, country, fromDate, toDate]);

  const filters = useMemo(
    () => ({
      ...(status ? { status } : {}),
      ...(programId ? { programId } : {}),
      ...(country ? { country } : {}),
      ...(fromDate ? { fromDate: new Date(fromDate).toISOString() } : {}),
      ...(toDate ? { toDate: new Date(`${toDate}T23:59:59`).toISOString() } : {}),
    }),
    [status, programId, country, fromDate, toDate]
  );

  const loadInitial = async () => {
    try {
      const [draftRes, logRes, programsRes] = await Promise.all([
        apiGet<{ drafts: Draft[] }>("/partner/emails/drafts"),
        apiGet<{ items: EmailLog[] }>("/partner/emails/logs?limit=15"),
        apiGet<Program[]>("/partner/programs"),
      ]);
      setDrafts(draftRes?.drafts || []);
      setLogs(logRes?.items || []);
      setPrograms((programsRes || []).map((p: any) => ({ id: p.id, name: p.name })));
    } catch {
      showToast.error("Failed to load email center data");
    }
  };

  const refreshAudienceCount = async () => {
    try {
      const params = new URLSearchParams(filters as Record<string, string>);
      const result = await apiGet<{ audienceCount: number }>(`/partner/emails/audience-count?${params.toString()}`);
      setAudienceCount(result.audienceCount || 0);
    } catch {
      setAudienceCount(0);
    }
  };

  const generatePreview = async () => {
    try {
      const res = await apiPost<{ html: string }>("/partner/emails/preview", {
        message: message || "Preview message",
      });
      setPreviewHtml(res.html || "");
    } catch {
      showToast.error("Preview failed");
    }
  };

  const saveDraft = async () => {
    if (!subject || !message) {
      showToast.error("Subject and message are required");
      return;
    }
    try {
      await apiPost("/partner/emails/drafts", {
        title: subject.slice(0, 60),
        subject,
        message,
      });
      showToast.success("Draft saved");
      await loadInitial();
    } catch {
      showToast.error("Failed to save draft");
    }
  };

  const loadDraft = (draft: Draft) => {
    setSubject(draft.subject);
    setMessage(draft.message);
    showToast.success("Draft loaded");
  };

  const deleteDraft = async (id: string) => {
    try {
      await apiDelete(`/partner/emails/drafts/${id}`);
      await loadInitial();
      showToast.success("Draft deleted");
    } catch {
      showToast.error("Failed to delete draft");
    }
  };

  const sendBulk = async () => {
    if (!subject || !message) {
      showToast.error("Subject and message are required");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost<{ audienceCount: number; queuedCount: number }>("/partner/emails/bulk", {
        subject,
        message,
        scheduleAt: scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
        filters,
      });
      showToast.success(`Queued ${res.queuedCount} email(s)`);
      await loadInitial();
    } catch (error: any) {
      showToast.error(error?.error || "Failed to queue emails");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">Email Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Audience</p>
          <p className="text-2xl font-bold text-[#121c67] mt-1">{audienceCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-[#121c67] mt-1">{drafts.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Recent Logs</p>
          <p className="text-2xl font-bold text-[#121c67] mt-1">{logs.length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-4">
        <h2 className="text-lg font-semibold text-[#121c67]">Compose / Schedule Bulk Email</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">All statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="REVIEW">REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border rounded-lg px-3 py-2"
            placeholder="Country"
          />
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded-lg px-3 py-2" />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded-lg px-3 py-2" />
        </div>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Email subject"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 min-h-[140px]"
          placeholder="Email message"
        />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={saveDraft}>Save Draft</Button>
          <Button variant="outline" onClick={generatePreview}>Preview</Button>
          <Button onClick={sendBulk} className="bg-[#5260ce] hover:bg-[#4350b0]" disabled={loading}>
            {loading ? "Sending..." : "Send / Schedule Bulk"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-[#121c67] mb-3">Drafts</h3>
          <div className="space-y-2 max-h-[320px] overflow-auto">
            {drafts.length === 0 ? (
              <p className="text-sm text-gray-500">No drafts yet.</p>
            ) : (
              drafts.map((draft) => (
                <div key={draft.id} className="border rounded-lg p-3">
                  <p className="font-medium text-sm">{draft.title}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{draft.subject}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => loadDraft(draft)}>Load</Button>
                    <Button variant="outline" size="sm" onClick={() => deleteDraft(draft.id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-[#121c67] mb-3">Preview</h3>
          {previewHtml ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe srcDoc={previewHtml} className="w-full h-[300px]" title="Email preview" />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Click Preview to generate template preview.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-[#121c67] mb-3">Recent Email Logs</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pe-3">Recipient</th>
                <th className="py-2 pe-3">Subject</th>
                <th className="py-2 pe-3">Template</th>
                <th className="py-2 pe-3">Status</th>
                <th className="py-2 pe-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0">
                  <td className="py-2 pe-3">{log.recipient}</td>
                  <td className="py-2 pe-3">{log.subject}</td>
                  <td className="py-2 pe-3">{log.template}</td>
                  <td className="py-2 pe-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : log.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 pe-3">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

