import React, { useState, useEffect } from "react";
import { 
  FileText, Download, Bookmark, Sparkles, Send, Star, AlertTriangle, 
  ArrowLeft, CheckCircle, ShieldAlert, BookOpen, RefreshCw, Eye, TrendingUp
} from "lucide-react";
import { Paper, Comment } from "../types";

interface ReaderPanelProps {
  paper: Paper;
  user: any;
  onBack: () => void;
  onDownload: (id: string) => void;
  onBookmark: (id: string, e: any) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function ReaderPanel({
  paper,
  user,
  onBack,
  onDownload,
  onBookmark,
  addToast
}: ReaderPanelProps) {
  const [activeTab, setActiveTab] = useState<'sheet' | 'ai-insights' | 'comments'>('sheet');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  
  // AI OCR States
  const [ocrText, setOcrText] = useState("");
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // AI Prediction States
  const [predictions, setPredictions] = useState<string[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);

  // Load comments
  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/papers/${paper.id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (e) {
      console.error("Comments fetch error:", e);
    }
  };

  useEffect(() => {
    fetchComments();
    if (paper.ocrText) {
      setOcrText(paper.ocrText);
      setHasScanned(true);
    }
    if (paper.predictionTips) {
      setPredictions(paper.predictionTips);
      setHasPredicted(true);
    }
  }, [paper]);

  // Run Gemini OCR extraction
  const runAIOCR = async () => {
    setIsScanningOCR(true);
    addToast("Initializing UniVault AI OCR scanner module...", "info");
    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/papers/${paper.id}/ocr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOcrText(data.text);
        setHasScanned(true);
        addToast("AI scan successful! OCR text and questions formatted.", "success");
      } else {
        addToast(data.error || "OCR Scan failed. Using simulated template.", "error");
      }
    } catch (e) {
      addToast("Network failure interfacing with OCR scan API.", "error");
    } finally {
      setIsScanningOCR(false);
    }
  };

  // Run Gemini Future Predictions Builder
  const runAIPredict = async (fresh = false) => {
    setIsPredicting(true);
    addToast("Analysing curriculum trends and topics...", "info");
    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/papers/${paper.id}/predict?fresh=${fresh ? 'true' : 'false'}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPredictions(data.tips);
        setHasPredicted(true);
        addToast("AI Predictions generated for course module!", "success");
      } else {
        addToast(data.error || "Predictions build failed.", "error");
      }
    } catch (e) {
      addToast("Network failure interface.", "error");
    } finally {
      setIsPredicting(false);
    }
  };

  // Submit Comments
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast("Please login to post reviews and academic feedback.", "error");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/papers/${paper.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment, rating })
      });
      if (res.ok) {
        const added = await res.json();
        setComments([added, ...comments]);
        setNewComment("");
        addToast("Academic feedback logged! Review successfully published.", "success");
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to submit comment.", "error");
      }
    } catch (err) {
      addToast("Network crash. Try posting later.", "error");
    }
  };

  // File Report
  const fileReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast("Please login to log audit reports.", "error");
      return;
    }
    if (!reportReason.trim()) return;

    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch(`/api/papers/${paper.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        addToast("Report logged. Content validation team alerted.", "success");
        setIsReporting(false);
        setReportReason("");
      } else {
        const data = await res.json();
        addToast(data.error || "Report failed.", "error");
      }
    } catch (e) {
      addToast("Network error submitting ticket.", "error");
    }
  };

  // Generate simulated file downloads
  const triggerDownloadAction = () => {
    onDownload(paper.id);
    
    // Create printable mockup question contents for direct TXT download
    const printableContent = `
========================================
             UNIVAULT VAULTS
========================================
University: ${paper.university}
Subject Name: ${paper.subjectName}
Subject Code: ${paper.subjectCode}
Exam Cycle: ${paper.examType} ${paper.year}
Semester ID: ${paper.semester}
Uploader Peer: ${paper.uploaderName}
----------------------------------------

GUIDELINES:
1. All sections are mandatory.
2. Read instructions carefully before penning answers.
3. This is a UniVault validated curriculum booklet.

RECONSTRUCTED QUESTIONS:
${paper.questions ? paper.questions.map((q, i) => `[Question ${i+1}] ${q}`).join('\n\n') : 'Blank question layout'}

----------------------------------------
AUTHENTICATED SECURED ACADEMIC ARCHIVE.
========================================
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([printableContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${paper.subjectCode}_${paper.examType}_${paper.year}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast("Syllabus Paper print booklet downloaded directly!", "success");
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* Upper Control Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-205 dark:border-slate-800 pb-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Repository</span>
        </button>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={(e) => onBookmark(paper.id, e)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-500"
            title="Bookmark to revision profile"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsReporting(!isReporting)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            title="Report inaccurate syllabus content"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>

          <button
            onClick={triggerDownloadAction}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-shadow shadow-md shadow-blue-500/10"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Mock PDF Text Download</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Card Reader vs insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Interactive PDF Booklet Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider relative -bottom-[1px] border-b-2 transition-all ${
                activeTab === 'sheet' 
                  ? "border-blue-600 text-blue-600 dark:text-blue-450" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Academic Question Booklet
            </button>
            <button
              onClick={() => setActiveTab('ai-insights')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider relative -bottom-[1px] border-b-2 transition-all ${
                activeTab === 'ai-insights' 
                  ? "border-blue-600 text-blue-600 dark:text-blue-450" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Gemini AI Study Assistant
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider relative -bottom-[1px] border-b-2 transition-all ${
                activeTab === 'comments' 
                  ? "border-blue-600 text-blue-600 dark:text-blue-450" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Discussions ({comments.length})
            </button>
          </div>

          {activeTab === 'sheet' && (
            <div className="relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 sm:p-12 overflow-hidden transition-colors font-serif text-slate-800 dark:text-slate-100 min-h-[500px]">
              
              {/* Dynamic Diagonal Watermark System */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] dark:opacity-[0.05] z-0 rotate-45 scale-125">
                <span className="text-4xl sm:text-7xl font-sans font-black tracking-widest text-slate-600 dark:text-slate-100 uppercase text-center leading-none">
                  UniVault Validated &bull; UniVault Verified &bull; Syllabus Vaults
                </span>
              </div>

              {/* Inner Print Booklet Graphics */}
              <div className="relative z-10 space-y-8 flex flex-col justify-between h-full font-serif">
                
                {/* Official Exam Offices Heading */}
                <div className="text-center font-sans tracking-tight border-b-4 border-slate-800 dark:border-slate-200 pb-5">
                  <h4 className="text-[11px] font-bold tracking-widest uppercase text-slate-500">{paper.university}</h4>
                  <h2 className="text-lg sm:text-xl font-black mt-1 uppercase text-slate-850 dark:text-slate-150">EXAMINATIONS AUDIT OFFICE</h2>
                  <p className="text-[10px] font-mono mt-1 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    SEMESTER {paper.semester} TERM ASSESSMENT &bull; {paper.examType} CYCLES {paper.year}
                  </p>
                </div>

                {/* Question Info Table */}
                <div className="grid grid-cols-2 gap-4 font-sans text-xs border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase">Course Title</span>
                    <strong className="block text-slate-700 dark:text-slate-200 truncate">{paper.subjectName}</strong>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 text-[10px] uppercase">Course Code</span>
                    <strong className="block text-slate-705 dark:text-slate-200 font-mono tracking-wider">{paper.subjectCode}</strong>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-400 text-[10px] uppercase">Allocated Duration</span>
                    <strong className="block text-slate-700 dark:text-slate-200">3 Hours (180 Mins)</strong>
                  </div>
                  <div className="space-y-1 text-right pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-400 text-[10px] uppercase">Maximum Score</span>
                    <strong className="block text-slate-700 dark:text-slate-250">100 Marks</strong>
                  </div>
                </div>

                {/* Instructions Booklet */}
                <div className="text-xs text-slate-650 dark:text-slate-400 italic font-sans leading-relaxed border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 p-3.5 rounded-r-xl">
                  <strong>Validation Guidelines for Students:</strong> Candidates must review instructions before answering. Design diagrams and schemas where applicable to support answers. All recursive logic functions must compile correctly.
                </div>

                {/* Structured Questions list */}
                <div className="space-y-6 pt-4">
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-blue-650 dark:text-blue-400 border-b border-blue-500/20 pb-1">
                    Section A &mdash; Core Theory & Modeling (Short Response)
                  </h3>

                  {paper.questions && paper.questions.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-4 text-sm leading-relaxed tracking-normal">
                      {paper.questions.map((q, i) => (
                        <li key={i} className="pl-2">
                          <span className="font-serif select-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{q}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-center font-sans py-10 text-slate-500">
                      <p className="text-xs">Scanning of printed page missing questions content. Run AI-OCR scan to index text!</p>
                    </div>
                  )}
                </div>

                {/* Signature Block */}
                <div className="pt-10 flex border-t border-dashed border-slate-200 dark:border-slate-800 justify-between font-sans text-[10px] text-slate-400">
                  <span>UniVault ID: {paper.id}</span>
                  <span>Validated Academic Archive Vault</span>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="space-y-6">
              
              {/* Gemini Trigger OCR module */}
              <div className="bg-gradient-to-tr from-slate-100/35 to-blue-50/35 dark:from-slate-900/30 dark:to-blue-950/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500 animate-pulse" />
                      Gemini OCR Scanned Text Extractor
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Instantly translate blurry scanner images or scanned paper prints into highly structured editable notes.
                    </p>
                  </div>
                  
                  <button
                    onClick={runAIOCR}
                    disabled={isScanningOCR}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    {isScanningOCR ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    <span>{hasScanned ? "Re-Scan Page" : "Scan with Gemini"}</span>
                  </button>
                </div>

                {/* Scan Visual Transcript */}
                {hasScanned && ocrText && (
                  <div className="mt-5 p-4 bg-white/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
                    <span className="text-[9px] font-mono tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded font-black">
                      AI OCR OUTPUT TRANSCRIPT
                    </span>
                    <div className="mt-3 text-xs leading-relaxed font-mono whitespace-pre-line text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto text-left">
                      {ocrText}
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Exam Trends predictions */}
              <div className="bg-gradient-to-tr from-slate-100/35 to-blue-55/35 dark:from-slate-900/30 dark:to-blue-955/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                      AI Future Question Prediction Engine
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Let Gemini analyze historical weights, tag densities, and previous years to predict expected questions.
                    </p>
                  </div>

                  <button
                    onClick={() => runAIPredict(true)}
                    disabled={isPredicting}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    {isPredicting ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span>{hasPredicted ? "Refresh Analysis" : "Analyze Trends"}</span>
                  </button>
                </div>

                {hasPredicted && predictions && predictions.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <span className="text-[9px] font-mono tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded font-black">
                      PROBABILITY PREDICTIONS LIST
                    </span>
                    <div className="space-y-2">
                      {predictions.map((tip, index) => (
                        <div key={index} className="p-3 bg-white/70 dark:bg-slate-950/75 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start space-x-2.5">
                          <CheckCircle className="h-4.5 w-4.5 text-blue-505 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              
              {/* Feedback Form */}
              <form onSubmit={submitComment} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold">Write Academic Review</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-slate-500">Complexity Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-0.5 text-amber-400 hover:scale-110"
                      >
                        <Star className={`h-4.5 w-4.5 ${s <= rating ? 'fill-amber-400' : 'text-slate-400'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold">({rating}/5)</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Provide exam analysis feedback, solution tips, or notes warnings..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl text-xs bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              {/* Feed lists */}
              <div className="space-y-3.5">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No discussion entries logged yet for this exam booklet. Be the first to advise!</p>
                ) : (
                  comments.map((com) => (
                    <div key={com.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2">
                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(com.userName)}`} className="w-5 h-5 rounded-full" />
                          <strong className="text-slate-705 dark:text-slate-200">{com.userName}</strong>
                        </div>
                        <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-405">
                          <div className="flex text-amber-400 mr-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= com.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <span>{new Date(com.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">{com.comment}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* Right 1 Col: Audit details, reports and bookmark counts */}
        <div className="space-y-6 text-left">
          
          {/* Uploader Card info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Archivist Details</h3>
            
            <div className="flex items-center space-x-3">
              <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(paper.uploaderName)}`} 
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-950" 
                alt="Uploader profile photo"
              />
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{paper.uploaderName}</h4>
                <p className="text-xs text-slate-500">Vault Contributor Member</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Views</span>
                <strong className="text-sm font-mono mt-0.5 block">{paper.views || 0} times</strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Downloads</span>
                <strong className="text-sm font-mono mt-0.5 block text-blue-600 dark:text-blue-400">{paper.downloads || 0} books</strong>
              </div>
            </div>
          </div>

          {/* Related paper suggestions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Related revision sheets</h3>
            <p className="text-[11px] text-slate-500">Auto suggested curriculum syllabus sheets relating to tag categories:</p>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50/70 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl cursor-not-allowed">
                <strong className="text-xs block text-slate-800 dark:text-slate-300">Basic Programming & Algorithms CS101</strong>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">Sem 1 &bull; 2024 Exam &bull; MIT</span>
              </div>
              <div className="p-3 bg-slate-50/70 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl cursor-not-allowed">
                <strong className="text-xs block text-slate-800 dark:text-slate-300">Advanced Networking & Protocols CS405</strong>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">Sem 7 &bull; 2025 Exam &bull; Stanford</span>
              </div>
            </div>
          </div>

          {/* Reporting Panel overlay */}
          {isReporting && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-3 text-left animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 text-rose-500">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-sm font-bold">Report Content Issue</h3>
              </div>
              <p className="text-xs text-slate-500">Flag this booklet if it contains inappropriate content, copyright warnings, or blurry scans.</p>
              
              <form onSubmit={fileReport} className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Provide precise details of syllabus error..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-md shadow-rose-600/10"
                >
                  File Complaint
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
