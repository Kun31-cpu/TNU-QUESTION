import React, { useState, useEffect } from "react";
import { 
  Building, CheckCircle, XCircle, Trash2, ShieldAlert, Users, 
  FileText, ArrowUpRight, BarChart3, AlertCircle, RefreshCw, UserMinus, UserCheck, Inbox
} from "lucide-react";
import { Paper, Report, User } from "../types";

interface AdminPanelProps {
  user: any;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onRefreshStats?: () => void;
}

export default function AdminPanel({ user, addToast }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'approval' | 'papers' | 'reports' | 'users'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("univault_token");
      const res = await (await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      })).json();
      setStats(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Load papers list
  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem("univault_token");
      const res = await (await fetch("/api/admin/papers", {
        headers: { "Authorization": `Bearer ${token}` }
      })).json();
      setPapers(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Load reports list
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("univault_token");
      const res = await (await fetch("/api/admin/reports", {
        headers: { "Authorization": `Bearer ${token}` }
      })).json();
      setReports(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Load users list
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("univault_token");
      const res = await (await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      })).json();
      setUsers(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAll = async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchPapers(), fetchReports(), fetchUsers()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Update paper status (Approve / Reject)
  const handlePaperStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/admin/papers/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addToast(`Content successfully ${status}! Points and alerts issued to contributor.`, "success");
        loadAll();
      } else {
        const err = await res.json();
        addToast(err.error || "Status update failed.", "error");
      }
    } catch (e) {
      addToast("Network failure updating paper.", "error");
    }
  };

  // Permanently delete inappropriate content
  const handleDeletePaper = async (id: string) => {
    if (!window.confirm("Permanently eradicate this question paper from catalogs? This is irreversible.")) return;
    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/admin/papers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Question paper permanently destroyed and deleted.", "success");
        loadAll();
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to delete compilation.", "error");
      }
    } catch (e) {
      addToast("Network failure.", "error");
    }
  };

  // Ban or Unban student account
  const handleUserStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "banned" ? "active" : "banned";
    if (!window.confirm(`Are you sure you want to change student status to ${nextStatus}?`)) return;

    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        addToast(`Student account successfully changed to ${nextStatus}.`, "success");
        loadAll();
      } else {
        const err = await res.json();
        addToast(err.error || "User state change failed.", "error");
      }
    } catch (e) {
      addToast("Network failure.", "error");
    }
  };

  // Resolve Reported grievance
  const handleResolveReport = async (id: string) => {
    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/admin/reports/${id}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        addToast("Grievance ticket successfully resolved.", "success");
        loadAll();
      } else {
        const err = await res.json();
        addToast(err.error || "Resolution update failed.", "error");
      }
    } catch (e) {
      addToast("Network error resolving ticket.", "error");
    }
  };

  const pendingPapers = papers.filter(p => p.status === "pending");
  const approvedPapers = papers.filter(p => p.status === "approved");
  const openReports = reports.filter(r => r.status === "pending");

  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-blue-600 dark:from-slate-100 dark:to-blue-400 bg-clip-text text-transparent">
            Admin Management Console
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">CURATOR MODERATOR CONTROL &bull; SECURE OVERLAYS</p>
        </div>

        <button
          onClick={loadAll}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Datastore</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stats' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500"
          }`}
        >
          Overview Statistics
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'approval' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500"
          }`}
        >
          Pending Verifications
          {pendingPapers.length > 0 && (
            <span className="absolute top-1.5 right-0.5 w-3 h-3 rounded-full bg-blue-600 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('papers')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'papers' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500"
          }`}
        >
          All Question Catalogs
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'reports' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500"
          }`}
        >
          Content Grievance Tickets
          {openReports.length > 0 && (
            <span className="absolute top-1.5 right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-extrabold flex items-center justify-center">
              {openReports.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'users' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500"
          }`}
        >
          University Student Records
        </button>
      </div>

      {/* Overview Analytics Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase text-slate-400 font-mono block">Total Syllabus Uploads</span>
                <strong className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">{stats.totalPapers} Papers</strong>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl text-cyan-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase text-slate-400 font-mono block">Approved Publications</span>
                <strong className="text-xl font-bold font-mono text-slate-805 dark:text-slate-100">{stats.approvedPapers} Approved</strong>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-955/30 rounded-xl text-amber-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase text-slate-400 font-mono block">Queue Inspections</span>
                <strong className="text-xl font-bold font-mono text-slate-850 dark:text-slate-150">{stats.pendingPapers} Pending</strong>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-955/45 rounded-xl text-rose-500">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase text-slate-400 font-mono block">Content Grievances</span>
                <strong className="text-xl font-bold font-mono text-slate-855 dark:text-slate-150">{stats.reportedPapersCount} Claims</strong>
              </div>
            </div>
          </div>

          {/* Department stats charts */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-left space-y-4 shadow-sm">
            <h3 className="text-sm font-bold flex items-center">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600 mr-2" />
              Upload Densities by Department Faculty
            </h3>
            <div className="space-y-3.5 max-w-2xl">
              {stats.deptStats && stats.deptStats.map((d: any, idx: number) => {
                const percentage = stats.totalPapers > 0 ? Math.round((d.count / stats.totalPapers) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{d.name}</span>
                      <span className="font-mono text-slate-500">{d.count} papers ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pending Reviews Verification Tab */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500/80 font-mono">Academic validation queue</h3>
          
          {pendingPapers.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
              <Inbox className="h-10 w-10 mx-auto text-slate-400 mb-3" />
              <p className="text-xs">All submitted papers have been audited and resolved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPapers.map((paper) => (
                <div key={paper.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-850 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded">
                      {paper.subjectCode}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">
                      Uploaded by {paper.uploaderName}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-normal text-slate-800 dark:text-slate-200">{paper.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{paper.subjectName} &middot; Sem {paper.semester} &middot; {paper.university}</p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                    <button
                      onClick={() => handlePaperStatus(paper.id, "approved")}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs leading-none"
                    >
                      Approve & Grant Points
                    </button>
                    <button
                      onClick={() => handlePaperStatus(paper.id, "rejected")}
                      className="py-1.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs leading-none"
                    >
                      Reject Submission
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Question Catalogues Management tab */}
      {activeTab === 'papers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-mono tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">University</th>
                <th className="px-5 py-3.5">Contributor</th>
                <th className="px-5 py-3.5">Downloads</th>
                <th className="px-5 py-3.5 text-right">Eradication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {approvedPapers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">No published curriculum question papers active currently.</td>
                </tr>
              ) : (
                approvedPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{paper.subjectCode}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-300 max-w-sm truncate">{paper.title}</td>
                    <td className="px-5 py-3.5 text-slate-500">{paper.university}</td>
                    <td className="px-5 py-3.5 text-slate-500">{paper.uploaderName}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono font-bold pl-7">{paper.downloads}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeletePaper(paper.id)}
                        className="p-1.5 rounded hover:bg-rose-50 text-rose-500 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports And Grievance Resolution tab */}
      {activeTab === 'reports' && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden text-left shadow-sm">
          {reports.length === 0 ? (
            <div className="p-10 text-center text-slate-550">All compliant and reported content folders clear.</div>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-mono tracking-wider font-black px-2 py-0.5 rounded uppercase ${
                      rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'
                    }`}>
                      {rep.status} REPORT
                    </span>
                    <span className="text-slate-400 font-mono text-[9px]">{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Claim Title: {rep.paperTitle}
                  </h4>
                  <p className="text-xs text-rose-500 italic">"Reason: {rep.reason}"</p>
                  <p className="text-[10px] text-slate-400">Filed by student {rep.reporterName}</p>
                </div>

                <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                  {rep.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                      >
                        Resolve Complaint
                      </button>
                      <button
                        onClick={() => handleDeletePaper(rep.paperId)}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                        title="Delete Paper directly"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Registered University Students and Moderation lists */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-mono tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3.5">Student Username</th>
                <th className="px-5 py-3.5">Email Directory</th>
                <th className="px-5 py-3.5">Role type</th>
                <th className="px-5 py-3.5">Contribution Points</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((target) => {
                const isBanned = target.status === "banned";
                const isAdmin = target.role === "admin";
                return (
                  <tr key={target.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <img src={target.avatar} className="w-5 h-5 rounded-full" />
                      <span>{target.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{target.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-bold ${
                        isAdmin ? 'bg-blue-105 bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {target.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-700 dark:text-slate-300">{target.points} pts</td>
                    <td className="px-5 py-3.5 font-mono">
                      <span className={`text-[10px] font-semibold ${isBanned ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                        &bull; {target.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!isAdmin && (
                        <button
                          onClick={() => handleUserStatus(target.id, target.status)}
                          className={`p-1.5 px-3 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${
                            isBanned 
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40" 
                              : "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/40"
                          }`}
                        >
                          {isBanned ? "Pardon/Unban" : "Ban Account"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
