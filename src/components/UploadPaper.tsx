import React, { useState, useEffect } from "react";
import { 
  UploadCloud, FileText, CheckCircle, AlertTriangle, Sparkles, Plus, 
  Trash2, BookOpen, RefreshCw, X
} from "lucide-react";
import { Department, Subject } from "../types";

interface UploadPaperProps {
  user: any;
  departments: Department[];
  subjects: Subject[];
  onUploadSuccess: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function UploadPaper({
  user,
  departments,
  subjects,
  onUploadSuccess,
  addToast
}: UploadPaperProps) {
  const [title, setTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSem, setSelectedSem] = useState(1);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [examType, setExamType] = useState<'Midterm' | 'Final' | 'Internal'>("Final");
  
  // Tags Section
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Simulated PDF Select states
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Suggested titles helper
  useEffect(() => {
    if (subjectName && university) {
      setTitle(`${selectedDept ? selectedDept.split(" ")[0] : "Academic"} ${subjectName} ${examType} ${year} Exam Booklet`);
    }
  }, [subjectName, university, examType, year]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragover") {
      setIsDragOver(true);
    } else {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      addToast("Invalid file type formatting! UniVault archive accepts high-quality PDF files only.", "error");
      return;
    }
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile({
      name: file.name,
      size: `${sizeInMB} MB`
    });
    addToast("PDF catalog verified and loaded successfully!", "success");
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      if (tags.length >= 6) {
        addToast("A paper booklet can have a maximum of 6 semantic keywords tags.", "error");
        return;
      }
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Paper post request
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast("Session expired. Please join or login to UniVault.", "error");
      return;
    }
    if (!selectedFile) {
      addToast("Please drag-and-drop or select an exam booklet PDF before archiving.", "error");
      return;
    }
    if (!subjectName || !subjectCode || !university || !selectedDept) {
      addToast("Please complete academic indexation fields before submission.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          department: selectedDept,
          semester: selectedSem,
          subjectName,
          subjectCode,
          university,
          year,
          examType,
          tags,
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToast("Question paper published for evaluation successfully!", "success");
        onUploadSuccess();
      } else {
        addToast(data.error || "Validation check failed.", "error");
      }
    } catch (e) {
      addToast("Failed interfacing with core storage channels.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Archive question booklet
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Curate university previous year papers to earn ranking points, achieve scholar badges, and populate the public student vaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Drag upload and validations check */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Main Select Area */}
          <div 
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center select-none cursor-pointer transition-all ${
              isDragOver 
                ? "border-blue-500 bg-blue-500/5" 
                : "border-slate-300 dark:border-slate-850 hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
            }`}
          >
            <input 
              type="file" 
              accept="application/pdf"
              id="file-selector-input" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <label htmlFor="file-selector-input" className="cursor-pointer space-y-3.5 block">
              <UploadCloud className="h-10 w-10 mx-auto text-blue-500 animate-pulse" />
              <div>
                <strong className="text-xs text-slate-800 dark:text-slate-200 block">Drag & drop syllabus PDF</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">or click to choose files</span>
              </div>
            </label>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3 text-left">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950 rounded-xl text-blue-500 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block" title={selectedFile.name}>
                  {selectedFile.name}
                </strong>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{selectedFile.size}</span>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Verification checklist card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">Vault standards checklist</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${selectedFile ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span className="text-slate-500">Document formatted as PDF Only</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${subjectCode.length > 2 ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span className="text-slate-500">Valid Course Code indexed</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${selectedDept ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span className="text-slate-500">Target Faculty assigned</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${university.length > 3 ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span className="text-slate-500">Recognized University listed</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 2 Columns: Curation metadata indexer */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500">Academic Indexation</h3>

            {/* Title display */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Calculated Publication Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Generates dynamically... (e.g. CSE Networking midterm 2025 booklet)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Faculty / Department</label>
                <select
                  required
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Semester Term</label>
                <select
                  required
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Network Protocols"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Subject Code</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS303"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">University Institution</label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Exams Year</label>
                  <input
                    type="number"
                    min="2010"
                    max="2030"
                    required
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Cycle Type</label>
                  <select
                    value={examType}
                    onChange={(e: any) => setExamType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Final">Final</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Keyword tags adder */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Curriculum Topic Tags (Max 6)</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. algorithms, thermodynamics, databases"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-750 dark:text-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
                >
                  Add Tag
                </button>
              </div>

              {/* Tags deck */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/45 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold"
                    >
                      <span>#{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(idx)}
                        className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md text-blue-505"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="w-full font-bold py-3 bg-blue-600 hover:bg-blue-700 text-white leading-none rounded-lg text-xs transition duration-200 shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  <span>Validating & encrypting question papers...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4.5 w-4.5" />
                  <span>Upload Paper and earn +100 Points</span>
                </>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
