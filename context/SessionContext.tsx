"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import initialMockData from "@/data/mockData.json";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  postedDate: string;
  salary: string;
  extraMessage?: string;
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  education: string;
  experience: string;
  skills: string[];
  resumeUrl: string;
  resume?: string;
  appliedJobIds: string[];
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: "applied" | "shortlisted" | "rejected";
  matchScore: number;
  appliedDate: string;
}

export interface HRUser {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email: string;
  password: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  jobIds: string[];
}

export interface MockData {
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  hrUsers: HRUser[];
}

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  responsibilities?: string[];
  achievements?: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  specialization?: string;
  institution: string;
  university?: string;
  location?: string;
  startYear?: string;
  graduationYear?: string;
  cgpa?: string;
  relevantCoursework?: string;
}

export interface ProjectEntry {
  id: string;
  projectName: string;
  role?: string;
  technologiesUsed: string;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface AchievementEntry {
  id: string;
  name: string;
  organization?: string;
  date?: string;
  description?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: "Basic" | "Intermediate" | "Fluent" | "Native";
}

export interface PublicationEntry {
  id: string;
  title: string;
  journal?: string;
  publicationDate?: string;
  authors?: string;
  url?: string;
  description?: string;
}

export interface LeadershipEntry {
  id: string;
  organization: string;
  role?: string;
  duration?: string;
  responsibilities?: string;
  achievements?: string;
}

export interface MachineExperienceEntry {
  id: string;
  machineName: string;
  yearsOfExperience: string;
  skillLevel: "Basic" | "Intermediate" | "Advanced";
}

export interface TrainingEntry {
  id: string;
  organization: string;
  trainingType: "Apprenticeship" | "Internship" | "Industrial Training" | "In-plant Training";
  department?: string;
  startDate?: string;
  endDate?: string;
  skillsLearned?: string;
  machinesUsed?: string;
  responsibilities?: string;
}

export interface CandidateFormData {
  name: string;
  phone: string;
  email: string;
  education: string;
  experience: string;
  skills: string[];

  // 1. Your Details
  professionalTitle?: string;
  currentLocation?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;

  // 2. Career Profile
  careerLevel?: string;
  totalExperience?: string;
  primaryDomain?: string;
  functionalArea?: string;

  // 3. Education & Qualification
  educations?: EducationEntry[];

  // 4. Experience & Machines
  experiences?: ExperienceEntry[];

  // 5. Skills & Tools
  technicalSkills?: string;
  softwareTools?: string;
  machineryEquipment?: string;
  qualityTools?: string;
  safetyKnowledge?: string;
  softSkills?: string;
  otherSkills?: string;

  // 6. Dedicated Machine Experience
  machineExperiences?: MachineExperienceEntry[];

  // 7. Industrial Certifications
  certifications?: CertificationEntry[];

  // 8. Apprenticeship / Training
  trainings?: TrainingEntry[];

  // 9. Projects
  projects?: ProjectEntry[];

  // 10-13. Dynamic Domain Experiences
  productionProcess?: string;
  productionLine?: string;
  productionTarget?: string;
  shiftExperience?: string;
  teamSize?: string;
  dailyProductionHandling?: string;

  qualityAreas?: string;
  qualityMethods?: string;
  inspectionEquipment?: string;

  maintenanceTypes?: string;
  maintenanceSystems?: string;

  electricalSkills?: string;

  // 14. Preferences
  preferredWorkType?: string;
  preferredShift?: string;
  locationPreference?: string;

  // 15. Availability
  availability?: string;
  availableFrom?: string;

  // 16. Languages
  languages?: LanguageEntry[];

  // 17. Achievements
  achievements?: AchievementEntry[];

  // 18. Resume Choice & Uploaded Resume Path
  uploadedResumePath?: string;
  uploadedResumeName?: string;
  resumeDeliveryChoice?: "uploaded" | "ats";

  // Optional / Legacy
  publications?: PublicationEntry[];
  leadership?: LeadershipEntry[];
}

interface SessionState {
  candidateSession: Candidate | null;
  hrSession: HRUser | null;
  mockData: MockData;
  candidateFormData: CandidateFormData | null;
  applyingToJobId: string | null;
  loginCandidate: (phone: string) => Candidate;
  loginCandidateByEmail: (email: string, password: string) => Candidate | null;
  signupCandidate: (name: string, email: string, phone: string, password: string) => Candidate | string;
  loginHR: (email: string, password: string) => HRUser | string | null;
  signupHR: (name: string, company: string, phone: string, email: string, password: string) => HRUser | string;
  assignHR: (hrId: string) => Promise<boolean>;
  rejectHR: (hrId: string) => Promise<boolean>;
  revokeHR: (hrId: string) => Promise<boolean>;
  postJob: (jobData: { title: string; location: string; description: string; requirements: string[]; salary: string; extraMessage?: string }) => Promise<Job | null>;
  logout: () => void;
  applyToJob: (jobId: string, candidateData: CandidateFormData) => void;
  updateApplicationStatus: (applicationId: string, status: "shortlisted" | "rejected") => void;
  setCandidateFormData: (data: CandidateFormData | null) => void;
  setApplyingToJobId: (jobId: string | null) => void;
  refetchData: () => Promise<void>;
  isHydrated: boolean;
}

const SessionContext = createContext<SessionState | null>(null);

/* ═══════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════ */

export function SessionProvider({ children }: { children: ReactNode }) {
  const [mockData, setMockData] = useState<MockData>(initialMockData as MockData);
  const [candidateSession, setCandidateSession] = useState<Candidate | null>(null);
  const [hrSession, setHRSession] = useState<HRUser | null>(null);
  const [candidateFormData, setCandidateFormData] = useState<CandidateFormData | null>(null);
  const [applyingToJobId, setApplyingToJobId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fetch live dataset from MySQL API on mount
  const refetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMockData(json.data);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live data from MySQL, falling back to local dataset:", err);
    }
  }, []);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  // Hydrate session from localStorage on mount
  useEffect(() => {
    try {
      const savedCandidate = localStorage.getItem("hirelocal_candidate");
      const savedHR = localStorage.getItem("hirelocal_hr");
      const savedFormData = localStorage.getItem("hirelocal_formdata");
      const savedJobId = localStorage.getItem("hirelocal_applying_job");

      if (savedCandidate) {
        setCandidateSession(JSON.parse(savedCandidate));
      }
      if (savedHR) {
        setHRSession(JSON.parse(savedHR));
      }
      if (savedFormData) {
        setCandidateFormData(JSON.parse(savedFormData));
      }
      if (savedJobId) {
        setApplyingToJobId(savedJobId);
      }
    } catch {
      // localStorage not available or corrupted — ignore
    }
    setIsHydrated(true);
  }, []);

  // Persist session changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    if (candidateSession) {
      localStorage.setItem("hirelocal_candidate", JSON.stringify(candidateSession));
    } else {
      localStorage.removeItem("hirelocal_candidate");
    }
  }, [candidateSession, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (hrSession) {
      localStorage.setItem("hirelocal_hr", JSON.stringify(hrSession));
    } else {
      localStorage.removeItem("hirelocal_hr");
    }
  }, [hrSession, isHydrated]);

  // Keep active HR session synced with updated status in hrUsers
  useEffect(() => {
    if (hrSession) {
      const live = mockData.hrUsers.find((h) => h.id === hrSession.id);
      if (live && live.status && live.status !== hrSession.status) {
        setHRSession((prev) => (prev ? { ...prev, status: live.status } : prev));
      }
    }
  }, [mockData.hrUsers, hrSession]);

  useEffect(() => {
    if (!isHydrated) return;
    if (candidateFormData) {
      localStorage.setItem("hirelocal_formdata", JSON.stringify(candidateFormData));
    } else {
      localStorage.removeItem("hirelocal_formdata");
    }
  }, [candidateFormData, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (applyingToJobId) {
      localStorage.setItem("hirelocal_applying_job", applyingToJobId);
    } else {
      localStorage.removeItem("hirelocal_applying_job");
    }
  }, [applyingToJobId, isHydrated]);

  const loginCandidate = useCallback((phone: string): Candidate => {
    // Find existing candidate by phone or create a new stub
    let candidate = mockData.candidates.find((c) => c.phone === phone);
    if (!candidate) {
      candidate = {
        id: `cand-${Date.now()}`,
        name: "",
        phone,
        email: "",
        password: "",
        education: "",
        experience: "",
        skills: [],
        resumeUrl: "",
        appliedJobIds: [],
      };
      setMockData((prev) => ({
        ...prev,
        candidates: [...prev.candidates, candidate!],
      }));
    }

    // Async sync with MySQL
    fetch("/api/auth/candidate/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }).catch(console.error);

    setCandidateSession(candidate);
    setHRSession(null);
    localStorage.removeItem("hirelocal_hr");
    return candidate;
  }, [mockData.candidates]);

  const loginCandidateByEmail = useCallback((email: string, password: string): Candidate | null => {
    const candidate = mockData.candidates.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (candidate) {
      if (candidate.password && password && candidate.password !== password) {
        return null;
      }
      setCandidateSession(candidate);
      setHRSession(null);
      localStorage.removeItem("hirelocal_hr");

      // Async sync with MySQL API
      fetch("/api/auth/candidate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(console.error);

      return candidate;
    }
    return null;
  }, [mockData.candidates]);

  const signupCandidate = useCallback((name: string, email: string, phone: string, password: string): Candidate | string => {
    const existing = mockData.candidates.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return "An account with this email already exists. Please login instead.";
    }

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      name,
      phone,
      email,
      password,
      education: "",
      experience: "",
      skills: [],
      resumeUrl: "",
      appliedJobIds: [],
    };

    setMockData((prev) => ({
      ...prev,
      candidates: [...prev.candidates, newCandidate],
    }));

    // Async sync with MySQL database
    fetch("/api/auth/candidate/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    }).catch(console.error);

    setCandidateSession(newCandidate);
    setHRSession(null);
    localStorage.removeItem("hirelocal_hr");
    return newCandidate;
  }, [mockData.candidates]);

  const loginHR = useCallback((email: string, password: string): HRUser | string | null => {
    const hr = mockData.hrUsers.find(
      (h) => h.email.toLowerCase() === email.toLowerCase()
    );
    if (hr) {
      if (hr.password && password && hr.password !== password) {
        return null;
      }
      if (hr.status === "rejected") {
        return "rejected";
      }

      setHRSession(hr);
      setCandidateSession(null);
      localStorage.setItem("hirelocal_hr", JSON.stringify(hr));
      localStorage.removeItem("hirelocal_candidate");

      fetch("/api/auth/hr/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(console.error);

      return hr;
    }
    return null;
  }, [mockData.hrUsers]);

  const signupHR = useCallback((name: string, company: string, phone: string, email: string, password: string): HRUser | string => {
    const existing = mockData.hrUsers.find(
      (h) => h.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return "An HR account with this email already exists. Please login instead.";
    }

    const newHR: HRUser = {
      id: `hr-${Date.now()}`,
      name,
      company,
      phone,
      email,
      password,
      status: "approved",
      createdAt: new Date().toISOString(),
      jobIds: [],
    };

    setMockData((prev) => ({
      ...prev,
      hrUsers: [...prev.hrUsers, newHR],
    }));

    setHRSession(newHR);
    setCandidateSession(null);
    localStorage.setItem("hirelocal_hr", JSON.stringify(newHR));
    localStorage.removeItem("hirelocal_candidate");

    fetch("/api/auth/hr/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, phone, email, password }),
    }).catch(console.error);

    return newHR;
  }, [mockData.hrUsers]);

  const assignHR = useCallback(async (hrId: string): Promise<boolean> => {
    try {
      setMockData((prev) => ({
        ...prev,
        hrUsers: prev.hrUsers.map((h) =>
          h.id === hrId ? { ...h, status: "approved" as const } : h
        ),
      }));

      setHRSession((prev) => (prev && prev.id === hrId ? { ...prev, status: "approved" as const } : prev));

      const res = await fetch("/api/admin/hr-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrId, action: "assign" }),
      });
      return res.ok;
    } catch (err) {
      console.error("Error assigning HR:", err);
      return false;
    }
  }, []);

  const rejectHR = useCallback(async (hrId: string): Promise<boolean> => {
    try {
      setMockData((prev) => ({
        ...prev,
        hrUsers: prev.hrUsers.map((h) =>
          h.id === hrId ? { ...h, status: "rejected" as const } : h
        ),
      }));

      setHRSession((prev) => (prev && prev.id === hrId ? { ...prev, status: "rejected" as const } : prev));

      const res = await fetch("/api/admin/hr-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrId, action: "revoke" }),
      });
      return res.ok;
    } catch (err) {
      console.error("Error rejecting/revoking HR:", err);
      return false;
    }
  }, []);

  const revokeHR = useCallback(async (hrId: string): Promise<boolean> => {
    return rejectHR(hrId);
  }, [rejectHR]);

  const logout = useCallback(() => {
    setCandidateSession(null);
    setHRSession(null);
    setCandidateFormData(null);
    setApplyingToJobId(null);
    localStorage.removeItem("hirelocal_candidate");
    localStorage.removeItem("hirelocal_hr");
    localStorage.removeItem("hirelocal_formdata");
    localStorage.removeItem("hirelocal_applying_job");
  }, []);

  const applyToJob = useCallback((jobId: string, candidateData: CandidateFormData) => {
    if (!candidateSession) return;

    const resumeVal = candidateData.uploadedResumePath || candidateSession.resume || candidateSession.resumeUrl || '';
    const updatedCandidate: Candidate = {
      ...candidateSession,
      name: candidateData.name || candidateSession.name,
      email: candidateData.email || candidateSession.email,
      education: candidateData.education || candidateSession.education,
      experience: candidateData.experience || candidateSession.experience,
      skills: candidateData.skills.length > 0 ? candidateData.skills : candidateSession.skills,
      resumeUrl: resumeVal,
      resume: resumeVal,
      appliedJobIds: [...new Set([...candidateSession.appliedJobIds, jobId])],
    };

    const job = mockData.jobs.find((j) => j.id === jobId);
    const matchingSkills = job
      ? candidateData.skills.filter((s) =>
          job.requirements.some((r) => r.toLowerCase() === s.toLowerCase())
        ).length
      : 0;
    const totalReqs = job ? job.requirements.length : 1;
    const matchScore = Math.min(95, Math.max(30, Math.round((matchingSkills / totalReqs) * 80) + 20 + Math.floor(Math.random() * 10)));

    const newApplication: Application = {
      id: `app-${Date.now()}`,
      candidateId: candidateSession.id,
      jobId,
      status: "applied",
      matchScore,
      appliedDate: new Date().toISOString().split("T")[0],
    };

    setMockData((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === candidateSession.id ? updatedCandidate : c
      ),
      applications: [...prev.applications, newApplication],
    }));

    // Post to MySQL database
    fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: candidateSession.id,
        jobId,
        matchScore,
        candidateData,
      }),
    }).catch(console.error);

    setCandidateSession(updatedCandidate);
    setCandidateFormData(null);
    setApplyingToJobId(null);
  }, [candidateSession, mockData.jobs]);

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: "shortlisted" | "rejected") => {
      setMockData((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        ),
      }));

      // Update in MySQL
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      }).catch(console.error);
    },
    []
  );

  const postJob = useCallback(async (jobData: { title: string; location: string; description: string; requirements: string[]; salary: string; extraMessage?: string }): Promise<Job | null> => {
    if (!hrSession || hrSession.status === "rejected") return null;

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobData,
          company: hrSession.company,
          hrId: hrSession.id,
        }),
      });

      const json = await res.json();
      if (json.success && json.job) {
        const createdJob: Job = json.job;
        setMockData((prev) => ({
          ...prev,
          jobs: [createdJob, ...prev.jobs],
        }));

        const updatedHR: HRUser = {
          ...hrSession,
          jobIds: [...hrSession.jobIds, createdJob.id],
        };
        setHRSession(updatedHR);
        return createdJob;
      }
    } catch (err) {
      console.error("Error posting job:", err);
    }
    return null;
  }, [hrSession]);

  return (
    <SessionContext.Provider
      value={{
        candidateSession,
        hrSession,
        mockData,
        candidateFormData,
        applyingToJobId,
        loginCandidate,
        loginCandidateByEmail,
        signupCandidate,
        loginHR,
        signupHR,
        assignHR,
        rejectHR,
        revokeHR,
        postJob,
        logout,
        applyToJob,
        updateApplicationStatus,
        setCandidateFormData,
        setApplyingToJobId,
        refetchData,
        isHydrated,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/* ═══════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════ */

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
