"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useSession,
  type CandidateFormData,
  type ExperienceEntry,
  type EducationEntry,
  type ProjectEntry,
  type CertificationEntry,
  type AchievementEntry,
  type LanguageEntry,
  type MachineExperienceEntry,
  type TrainingEntry,
} from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function ApplyPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ApplyPageContent />
    </Suspense>
  );
}

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const {
    candidateSession,
    candidateFormData,
    mockData,
    setCandidateFormData,
    setApplyingToJobId,
    isHydrated,
  } = useSession();

  const [mode, setMode] = useState<"choose" | "upload" | "manual">("choose");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Resume Upload & Delivery Option
  const [uploadedResumePath, setUploadedResumePath] = useState("");
  const [uploadedResumeName, setUploadedResumeName] = useState("");
  const [resumeDeliveryChoice, setResumeDeliveryChoice] = useState<"uploaded" | "ats">("uploaded");

  // 1. Your Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // 2. Career Profile
  const [careerLevel, setCareerLevel] = useState("Experienced");
  const [totalExperience, setTotalExperience] = useState("");
  const [primaryDomain, setPrimaryDomain] = useState("Manufacturing");
  const [functionalArea, setFunctionalArea] = useState("Production");

  // 3. Education & Technical Qualification
  const [educations, setEducations] = useState<EducationEntry[]>([]);

  // 4. Work Experience
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);

  // 5. Technical Skills
  const [technicalSkills, setTechnicalSkills] = useState("");
  const [softwareTools, setSoftwareTools] = useState("");
  const [machineryEquipment, setMachineryEquipment] = useState("");
  const [qualityTools, setQualityTools] = useState("");
  const [safetyKnowledge, setSafetyKnowledge] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [otherSkills, setOtherSkills] = useState("");

  // 6. Dedicated Machine Experience
  const [machineExperiences, setMachineExperiences] = useState<MachineExperienceEntry[]>([]);

  // 7. Industrial Certifications
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);

  // 8. Apprenticeship / Training
  const [trainings, setTrainings] = useState<TrainingEntry[]>([]);

  // 9. Projects
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  // 10-13. Dynamic Domain Specific Sections
  // Production
  const [productionProcess, setProductionProcess] = useState("");
  const [productionLine, setProductionLine] = useState("");
  const [productionTarget, setProductionTarget] = useState("");
  const [shiftExperience, setShiftExperience] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [dailyProductionHandling, setDailyProductionHandling] = useState("");

  // Quality
  const [qualityAreas, setQualityAreas] = useState("");
  const [qualityMethods, setQualityMethods] = useState("");
  const [inspectionEquipment, setInspectionEquipment] = useState("");

  // Maintenance
  const [maintenanceTypes, setMaintenanceTypes] = useState("");
  const [maintenanceSystems, setMaintenanceSystems] = useState("");

  // Electrical / Electronics
  const [electricalSkills, setElectricalSkills] = useState("");

  // 14. Preferences
  const [preferredWorkType, setPreferredWorkType] = useState("Full Time");
  const [preferredShift, setPreferredShift] = useState("General Shift");
  const [locationPreference, setLocationPreference] = useState("Local");

  // 15. Availability
  const [availability, setAvailability] = useState("Immediate");
  const [availableFrom, setAvailableFrom] = useState("");

  // 16. Languages
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);

  // 17. Achievements
  const [achievements, setAchievements] = useState<AchievementEntry[]>([]);

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setFormError("");
  };

  const job = jobId ? mockData.jobs.find((j) => j.id === jobId) : null;

  // Dynamic Visibility Helpers based on selected Domain / Functional Area
  const showProduction =
    ["Manufacturing", "Production", "Automotive", "Process / Operations"].includes(primaryDomain) ||
    ["Production", "Assembly", "Machine Operation", "Site Operations"].includes(functionalArea);

  const showQuality =
    ["Quality"].includes(primaryDomain) ||
    ["Quality Control", "Quality Assurance", "Testing", "Inspection"].includes(functionalArea);

  const showMaintenance =
    ["Maintenance", "Engineering"].includes(primaryDomain) ||
    ["Maintenance"].includes(functionalArea);

  const showElectrical =
    ["Electrical", "Electronics"].includes(primaryDomain) ||
    ["Maintenance", "Testing", "Inspection"].includes(functionalArea);

  // Auth guard
  useEffect(() => {
    if (isHydrated && !candidateSession) {
      router.replace(`/candidate/login${jobId ? `?job=${jobId}` : ""}`);
    }
  }, [isHydrated, candidateSession, router, jobId]);

  // Pre-fill form with existing candidateFormData or candidateSession
  useEffect(() => {
    if (candidateFormData) {
      setMode("manual");
      if (candidateFormData.name) setName(candidateFormData.name);
      if (candidateFormData.phone) setPhone(candidateFormData.phone);
      if (candidateFormData.email) setEmail(candidateFormData.email);
      if (candidateFormData.currentLocation) setCurrentLocation(candidateFormData.currentLocation);
      if (candidateFormData.professionalTitle) setProfessionalTitle(candidateFormData.professionalTitle);
      if (candidateFormData.linkedinUrl) setLinkedinUrl(candidateFormData.linkedinUrl);
      if (candidateFormData.portfolioUrl) setPortfolioUrl(candidateFormData.portfolioUrl);

      if (candidateFormData.careerLevel) setCareerLevel(candidateFormData.careerLevel);
      if (candidateFormData.totalExperience) setTotalExperience(candidateFormData.totalExperience);
      if (candidateFormData.primaryDomain) setPrimaryDomain(candidateFormData.primaryDomain);
      if (candidateFormData.functionalArea) setFunctionalArea(candidateFormData.functionalArea);

      if (candidateFormData.educations && candidateFormData.educations.length > 0) {
        setEducations(candidateFormData.educations);
      }
      if (candidateFormData.experiences && candidateFormData.experiences.length > 0) {
        setExperiences(candidateFormData.experiences);
      }
      if (candidateFormData.machineExperiences && candidateFormData.machineExperiences.length > 0) {
        setMachineExperiences(candidateFormData.machineExperiences);
      }
      if (candidateFormData.certifications && candidateFormData.certifications.length > 0) {
        setCertifications(candidateFormData.certifications);
      }
      if (candidateFormData.trainings && candidateFormData.trainings.length > 0) {
        setTrainings(candidateFormData.trainings);
      }
      if (candidateFormData.projects && candidateFormData.projects.length > 0) {
        setProjects(candidateFormData.projects);
      }

      if (candidateFormData.technicalSkills) setTechnicalSkills(candidateFormData.technicalSkills);
      if (candidateFormData.softwareTools) setSoftwareTools(candidateFormData.softwareTools);
      if (candidateFormData.machineryEquipment) setMachineryEquipment(candidateFormData.machineryEquipment);
      if (candidateFormData.qualityTools) setQualityTools(candidateFormData.qualityTools);
      if (candidateFormData.safetyKnowledge) setSafetyKnowledge(candidateFormData.safetyKnowledge);
      if (candidateFormData.softSkills) setSoftSkills(candidateFormData.softSkills);
      if (candidateFormData.otherSkills) setOtherSkills(candidateFormData.otherSkills);

      if (candidateFormData.productionLine) setProductionLine(candidateFormData.productionLine);
      if (candidateFormData.dailyProductionHandling) setDailyProductionHandling(candidateFormData.dailyProductionHandling);
      if (candidateFormData.shiftExperience) setShiftExperience(candidateFormData.shiftExperience);
      if (candidateFormData.teamSize) setTeamSize(candidateFormData.teamSize);

      if (candidateFormData.qualityAreas) setQualityAreas(candidateFormData.qualityAreas);
      if (candidateFormData.qualityMethods) setQualityMethods(candidateFormData.qualityMethods);
      if (candidateFormData.inspectionEquipment) setInspectionEquipment(candidateFormData.inspectionEquipment);

      if (candidateFormData.maintenanceTypes) setMaintenanceTypes(candidateFormData.maintenanceTypes);
      if (candidateFormData.maintenanceSystems) setMaintenanceSystems(candidateFormData.maintenanceSystems);

      if (candidateFormData.electricalSkills) setElectricalSkills(candidateFormData.electricalSkills);

      if (candidateFormData.preferredWorkType) setPreferredWorkType(candidateFormData.preferredWorkType);
      if (candidateFormData.preferredShift) setPreferredShift(candidateFormData.preferredShift);
      if (candidateFormData.locationPreference) setLocationPreference(candidateFormData.locationPreference);

      if (candidateFormData.availability) setAvailability(candidateFormData.availability);
      if (candidateFormData.availableFrom) setAvailableFrom(candidateFormData.availableFrom);

      if (candidateFormData.languages && candidateFormData.languages.length > 0) {
        setLanguages(candidateFormData.languages);
      }
      if (candidateFormData.achievements && candidateFormData.achievements.length > 0) {
        setAchievements(candidateFormData.achievements);
      }
      if (candidateFormData.uploadedResumePath) {
        setUploadedResumePath(candidateFormData.uploadedResumePath);
      }
      if (candidateFormData.uploadedResumeName) {
        setUploadedResumeName(candidateFormData.uploadedResumeName);
      }
      if (candidateFormData.resumeDeliveryChoice) {
        setResumeDeliveryChoice(candidateFormData.resumeDeliveryChoice);
      }
    } else if (candidateSession) {
      setName(candidateSession.name || "");
      setPhone(candidateSession.phone || "");
      setEmail(candidateSession.email || "");

      if (candidateSession.resume || candidateSession.resumeUrl) {
        const existing = candidateSession.resume || candidateSession.resumeUrl;
        setUploadedResumePath(existing);
        setUploadedResumeName(existing.split("/").pop() || "Uploaded Resume");
      }

      if (candidateSession.skills?.length > 0) {
        setTechnicalSkills(candidateSession.skills.join(", "));
      }

      if (candidateSession.education && educations.length === 0) {
        setEducations([
          {
            id: `edu-default`,
            degree: "Diploma / Degree",
            specialization: "Technical Trade",
            institution: candidateSession.education,
          },
        ]);
      }

      if (candidateSession.experience && experiences.length === 0) {
        setExperiences([
          {
            id: `exp-default`,
            jobTitle: "Technician / Operator",
            companyName: candidateSession.experience,
          },
        ]);
      }
    }
  }, [candidateSession, candidateFormData]);

  const handleFileUpload = useCallback(async (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setUploadError("Please upload a PDF, DOCX, PNG, or JPG file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume-parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to parse resume");
      }

      const data = await res.json();

      if (data.mappedFields) {
        if (data.mappedFields.name) setName(data.mappedFields.name);
        if (data.mappedFields.phone) setPhone(data.mappedFields.phone);
        if (data.mappedFields.email) setEmail(data.mappedFields.email);
        if (data.mappedFields.skills?.length > 0) {
          setTechnicalSkills(data.mappedFields.skills.join(", "));
        }
        if (data.mappedFields.education) {
          setEducations([
            {
              id: `edu-${Date.now()}`,
              degree: "Technical Qualification",
              institution: data.mappedFields.education,
            },
          ]);
        }
        if (data.mappedFields.experience) {
          setExperiences([
            {
              id: `exp-${Date.now()}`,
              jobTitle: "Industrial Work Experience",
              companyName: data.mappedFields.experience,
            },
          ]);
        }
      }

      if (data.resumePath) {
        setUploadedResumePath(data.resumePath);
        setUploadedResumeName(data.fileName || file.name);
        setResumeDeliveryChoice("uploaded");
      }

      setMode("manual");
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Something went wrong parsing resume"
      );
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Full Name is required";
    }
    if (!phone.trim()) {
      errors.phone = "Phone Number is required";
    }
    if (!currentLocation.trim()) {
      errors.currentLocation = "Current Location is required";
    }
    if (!professionalTitle.trim()) {
      errors.professionalTitle = "Professional / Target Job Title is required";
    }

    if (resumeDeliveryChoice === "uploaded" && !uploadedResumePath) {
      errors.resume = "Please upload your resume file in Section 18 or select 'Create New ATS-Friendly Resume'";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      setFormError(errors[firstKey]);

      const targetId =
        firstKey === "name"
          ? "field-name"
          : firstKey === "phone"
          ? "field-phone"
          : firstKey === "currentLocation"
          ? "field-current-location"
          : firstKey === "professionalTitle"
          ? "field-professional-title"
          : firstKey === "resume"
          ? "section-resume-choice"
          : "";

      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus?.();
          }
        }, 80);
      }
      return;
    }

    // Aggregate skills
    const allSkills = [
      ...technicalSkills.split(","),
      ...softwareTools.split(","),
      ...machineryEquipment.split(","),
      ...qualityTools.split(","),
      ...safetyKnowledge.split(","),
      ...softSkills.split(","),
      ...otherSkills.split(","),
      ...electricalSkills.split(","),
    ]
      .map((s) => s.trim())
      .filter(Boolean);

    const fallbackEducation = educations
      .map(
        (e) =>
          `${e.degree} ${e.specialization ? `in ${e.specialization}` : ""} from ${e.institution}${
            e.graduationYear ? ` (${e.graduationYear})` : ""
          }`
      )
      .join("\n");

    const fallbackExperience = experiences
      .map(
        (e) =>
          `${e.jobTitle} at ${e.companyName}${e.location ? ` (${e.location})` : ""}${
            e.startDate ? ` [${e.startDate} - ${e.currentlyWorking ? "Present" : e.endDate || ""}]` : ""
          }`
      )
      .join("\n");

    const formData: CandidateFormData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      education: fallbackEducation || "Technical Qualification",
      experience: fallbackExperience || "Industrial Experience",
      skills: allSkills.length > 0 ? allSkills : ["Technical Skills"],

      // Core Details
      professionalTitle: professionalTitle.trim(),
      currentLocation: currentLocation.trim(),
      linkedinUrl: linkedinUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),

      // Profile
      careerLevel,
      totalExperience: totalExperience.trim(),
      primaryDomain,
      functionalArea,

      // Structured Repeats
      educations,
      experiences,
      machineExperiences,

      // Skills
      technicalSkills: technicalSkills.trim(),
      softwareTools: softwareTools.trim(),
      machineryEquipment: machineryEquipment.trim(),
      qualityTools: qualityTools.trim(),
      safetyKnowledge: safetyKnowledge.trim(),
      softSkills: softSkills.trim(),
      otherSkills: otherSkills.trim(),

      // Certifications & Trainings
      certifications,
      trainings,
      projects,

      // Domain-specific
      productionProcess: productionProcess.trim(),
      productionLine: productionLine.trim(),
      productionTarget: productionTarget.trim(),
      shiftExperience: shiftExperience.trim(),
      teamSize: teamSize.trim(),
      dailyProductionHandling: dailyProductionHandling.trim(),

      qualityAreas: qualityAreas.trim(),
      qualityMethods: qualityMethods.trim(),
      inspectionEquipment: inspectionEquipment.trim(),

      maintenanceTypes: maintenanceTypes.trim(),
      maintenanceSystems: maintenanceSystems.trim(),

      electricalSkills: electricalSkills.trim(),

      // Preferences & Availability
      preferredWorkType,
      preferredShift,
      locationPreference,
      availability,
      availableFrom: availableFrom.trim(),

      languages,
      achievements,
      uploadedResumePath,
      uploadedResumeName,
      resumeDeliveryChoice,
    };

    setCandidateFormData(formData);
    setApplyingToJobId(jobId || "");
    router.push("/apply/manual-preview");
  };

  if (!isHydrated || !candidateSession) return <FullPageLoader />;

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-10 text-center">
        <div className="animate-fade-in">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            Job not found
          </h2>
          <p className="text-slate-500 mb-4">
            This job posting may have expired or the link is invalid.
          </p>
          <Button onClick={() => router.push("/jobs")} variant="secondary">
            Browse Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 sm:py-10">
      {/* Target Job Details Card */}
      <Card hover={false} className="mb-6 border-l-4 border-l-primary-500 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {job.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {job.company} • {job.location}
            </p>
            {job.salary && (
              <p className="text-sm font-medium text-primary-600 mt-1">
                {job.salary}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.requirements.map((req) => (
            <Badge key={req} variant="info">
              {req}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {job.description}
        </p>

        {job.extraMessage && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/80 dark:from-slate-800 dark:to-slate-800/90 border border-blue-200 dark:border-blue-900/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-base font-bold">
                📢
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                    Important Message from Recruiter
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                    Contact & Notes
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                  {job.extraMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Mode Choice */}
      {mode === "choose" && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            How would you like to apply?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upload Resume */}
            <div
              className={`glass-card p-6 text-center cursor-pointer transition-all duration-200 ${
                dragActive ? "border-primary-400 bg-primary-50/50 scale-[1.02]" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.png,.jpg,.jpeg,.docx";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file);
                };
                input.click();
              }}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 mb-3 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    Parsing resume...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Upload Resume
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PDF, DOCX, PNG, or JPG
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Drag & drop or click to browse
                  </p>
                </>
              )}
            </div>

            {/* Enter Manually */}
            <Card onClick={() => setMode("manual")} className="p-6 text-center cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-50 dark:bg-accent-900/40 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                Enter Manually
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fill in your details step by step
              </p>
            </Card>
          </div>

          {uploadError && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Mode: Manual Candidate Entry Form (Core Industry First) */}
      {mode === "manual" && (
        <div className="animate-slide-up">
          <form onSubmit={handleFormSubmit} className="space-y-6">

            {/* ═══════════════════════════════════════════
               1. YOUR DETAILS
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">1</span>
                  Your Details
                </h2>
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="text-xs text-slate-500 hover:text-primary-600 transition-colors"
                >
                  ← Change Method
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="field-name"
                  label="Full Name *"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  error={fieldErrors.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("name");
                  }}
                  autoFocus
                />
                <Input
                  id="field-phone"
                  label="Phone Number *"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  error={fieldErrors.phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError("phone");
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="field-email"
                  label="Email *"
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="field-current-location"
                  label="Current Location *"
                  placeholder="e.g. Bhiwandi, Mumbai or Chennai, TN"
                  value={currentLocation}
                  error={fieldErrors.currentLocation}
                  onChange={(e) => {
                    setCurrentLocation(e.target.value);
                    clearFieldError("currentLocation");
                  }}
                  helperText="Crucial for local/plant-based hiring"
                />
              </div>

              <Input
                id="field-professional-title"
                label="Professional Title / Target Job Title *"
                placeholder="e.g. CNC Operator / Fitter / Electrical Technician / Mechanical Engineer"
                value={professionalTitle}
                error={fieldErrors.professionalTitle}
                onChange={(e) => {
                  setProfessionalTitle(e.target.value);
                  clearFieldError("professionalTitle");
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="LinkedIn URL (Optional)"
                  placeholder="linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
                <Input
                  label="Portfolio / Profile Link (Optional)"
                  placeholder="myportfolio.com or project link"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>
            </Card>

            {/* ═══════════════════════════════════════════
               2. CAREER PROFILE
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">2</span>
                  Career Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Career Level *
                  </label>
                  <select
                    value={careerLevel}
                    onChange={(e) => setCareerLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="Trainee">Trainee</option>
                    <option value="Apprentice">Apprentice</option>
                    <option value="Junior">Junior</option>
                    <option value="Experienced">Experienced</option>
                    <option value="Senior">Senior</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <Input
                  label="Total Experience"
                  placeholder="e.g. 3 Years 6 Months or Fresher"
                  value={totalExperience}
                  onChange={(e) => setTotalExperience(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Primary Industry / Domain *
                  </label>
                  <select
                    value={primaryDomain}
                    onChange={(e) => setPrimaryDomain(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Construction">Construction</option>
                    <option value="Production">Production</option>
                    <option value="Quality">Quality</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Process / Operations">Process / Operations</option>
                    <option value="Software / IT">Software / IT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Functional Area *
                  </label>
                  <select
                    value={functionalArea}
                    onChange={(e) => setFunctionalArea(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Production">Production</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Design">Design</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Machine Operation">Machine Operation</option>
                    <option value="Stores">Stores</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Safety">Safety</option>
                    <option value="Projects">Projects</option>
                    <option value="Site Operations">Site Operations</option>
                    <option value="Testing">Testing</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* ═══════════════════════════════════════════
               3. EDUCATION & TECHNICAL QUALIFICATION (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">3</span>
                  Education & Technical Qualification
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setEducations([
                      ...educations,
                      {
                        id: `edu-${Date.now()}`,
                        degree: "Diploma",
                        specialization: "Mechanical Engineering",
                        institution: "",
                        graduationYear: "",
                      },
                    ])
                  }
                >
                  + Add Qualification
                </Button>
              </div>

              {educations.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-2">
                  No qualifications added yet. Click &quot;+ Add Qualification&quot; to include ITI, Diploma, or Degree details.
                </p>
              ) : (
                <div className="space-y-4">
                  {educations.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Qualification #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEducations(educations.filter((e) => e.id !== edu.id))
                          }
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                            Qualification *
                          </label>
                          <select
                            value={edu.degree || "Diploma"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEducations(
                                educations.map((item) =>
                                  item.id === edu.id ? { ...item, degree: val } : item
                                )
                              );
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          >
                            <option value="10th">10th Pass</option>
                            <option value="12th">12th Pass</option>
                            <option value="ITI">ITI</option>
                            <option value="Diploma">Diploma</option>
                            <option value="B.E.">B.E.</option>
                            <option value="B.Tech">B.Tech</option>
                            <option value="B.Sc.">B.Sc.</option>
                            <option value="B.Com">B.Com</option>
                            <option value="M.E.">M.E.</option>
                            <option value="M.Tech">M.Tech</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <Input
                          label="Course / Trade *"
                          placeholder="e.g. Fitter, Electrician, Mechanical, ECE, CSE"
                          value={edu.specialization || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEducations(
                              educations.map((item) =>
                                item.id === edu.id ? { ...item, specialization: val } : item
                              )
                            );
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Institution / College *"
                          placeholder="e.g. Govt Polytechnic College"
                          value={edu.institution}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEducations(
                              educations.map((item) =>
                                item.id === edu.id ? { ...item, institution: val } : item
                              )
                            );
                          }}
                        />
                        <Input
                          label="University / Board"
                          placeholder="e.g. State Board of Technical Education"
                          value={edu.university || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEducations(
                              educations.map((item) =>
                                item.id === edu.id ? { ...item, university: val } : item
                              )
                            );
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Start Year"
                          placeholder="e.g. 2022"
                          value={edu.startYear || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEducations(
                              educations.map((item) =>
                                item.id === edu.id ? { ...item, startYear: val } : item
                              )
                            );
                          }}
                        />
                        <Input
                          label="Passing Year *"
                          placeholder="e.g. 2025"
                          value={edu.graduationYear || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEducations(
                              educations.map((item) =>
                                item.id === edu.id ? { ...item, graduationYear: val } : item
                              )
                            );
                          }}
                        />
                        <Input
                          label="Percentage / CGPA"
                          placeholder="e.g. 82% or 8.2/10"
                          value={edu.cgpa || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEducations(
                              educations.map((item) =>
                                item.id === edu.id ? { ...item, cgpa: val } : item
                              )
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               4. WORK EXPERIENCE (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">4</span>
                  Work Experience
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setExperiences([
                      ...experiences,
                      {
                        id: `exp-${Date.now()}`,
                        jobTitle: "",
                        companyName: "",
                        employmentType: "Full Time",
                        currentlyWorking: false,
                        responsibilities: [""],
                        achievements: [""],
                      },
                    ])
                  }
                >
                  + Add Experience
                </Button>
              </div>

              {experiences.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-2">
                  No experience added yet. Click &quot;+ Add Experience&quot; to list your plant or industrial work history.
                </p>
              ) : (
                <div className="space-y-4">
                  {experiences.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Experience #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExperiences(experiences.filter((e) => e.id !== exp.id))
                          }
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Job Title *"
                          placeholder="e.g. CNC Operator / Maintenance Technician"
                          value={exp.jobTitle}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExperiences(
                              experiences.map((item) =>
                                item.id === exp.id ? { ...item, jobTitle: val } : item
                              )
                            );
                          }}
                        />
                        <Input
                          label="Company Name *"
                          placeholder="e.g. FastTrack Engineering"
                          value={exp.companyName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExperiences(
                              experiences.map((item) =>
                                item.id === exp.id ? { ...item, companyName: val } : item
                              )
                            );
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Location"
                          placeholder="e.g. Bhiwandi / Thane"
                          value={exp.location || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExperiences(
                              experiences.map((item) =>
                                item.id === exp.id ? { ...item, location: val } : item
                              )
                            );
                          }}
                        />
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                            Employment Type
                          </label>
                          <select
                            value={exp.employmentType || "Full Time"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExperiences(
                                experiences.map((item) =>
                                  item.id === exp.id ? { ...item, employmentType: val } : item
                                )
                              );
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          >
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Apprenticeship">Apprenticeship</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`current-${exp.id}`}
                            checked={exp.currentlyWorking || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setExperiences(
                                experiences.map((item) =>
                                  item.id === exp.id
                                    ? { ...item, currentlyWorking: checked }
                                    : item
                                )
                              );
                            }}
                            className="rounded text-primary-600"
                          />
                          <label htmlFor={`current-${exp.id}`} className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            Currently Working
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Start Date *"
                          placeholder="e.g. Jan 2022"
                          value={exp.startDate || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExperiences(
                              experiences.map((item) =>
                                item.id === exp.id ? { ...item, startDate: val } : item
                              )
                            );
                          }}
                        />
                        {!exp.currentlyWorking && (
                          <Input
                            label="End Date"
                            placeholder="e.g. Dec 2024"
                            value={exp.endDate || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExperiences(
                                experiences.map((item) =>
                                  item.id === exp.id ? { ...item, endDate: val } : item
                                )
                              );
                            }}
                          />
                        )}
                      </div>

                      <Textarea
                        label="Job Responsibilities (Bullet Points)"
                        placeholder="e.g. Operated Fanuc CNC Lathe machine&#10;Performed daily preventive maintenance checks"
                        value={(exp.responsibilities || []).join("\n")}
                        onChange={(e) => {
                          const lines = e.target.value.split("\n");
                          setExperiences(
                            experiences.map((item) =>
                              item.id === exp.id ? { ...item, responsibilities: lines } : item
                            )
                          );
                        }}
                        rows={3}
                      />

                      <Textarea
                        label="Key Achievements (Bullet Points)"
                        placeholder="e.g. Maintained 99% production efficiency&#10;Achieved zero safety incidents in 2024"
                        value={(exp.achievements || []).join("\n")}
                        onChange={(e) => {
                          const lines = e.target.value.split("\n");
                          setExperiences(
                            experiences.map((item) =>
                              item.id === exp.id ? { ...item, achievements: lines } : item
                            )
                          );
                        }}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               5. TECHNICAL SKILLS & TOOLS
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">5</span>
                  Technical Skills & Tools
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Technical Skills"
                  placeholder="e.g. CNC Operation, Electrical Maintenance, Welding, Troubleshooting, Calibration"
                  value={technicalSkills}
                  onChange={(e) => setTechnicalSkills(e.target.value)}
                  helperText="Comma separated"
                />
                <Input
                  label="Software / CAD / ERP Tools"
                  placeholder="e.g. AutoCAD, SolidWorks, CATIA, SAP, MS Excel"
                  value={softwareTools}
                  onChange={(e) => setSoftwareTools(e.target.value)}
                  helperText="Comma separated"
                />
                <Input
                  label="Machinery / Equipment Worked With"
                  placeholder="e.g. CNC Lathe, VMC, PLC Panels, Motors, Compressors, Pumps"
                  value={machineryEquipment}
                  onChange={(e) => setMachineryEquipment(e.target.value)}
                  helperText="Comma separated"
                />
                <Input
                  label="Quality Tools & Methods"
                  placeholder="e.g. 5S, Kaizen, 7 QC Tools, FMEA, SPC, Root Cause Analysis"
                  value={qualityTools}
                  onChange={(e) => setQualityTools(e.target.value)}
                  helperText="Comma separated"
                />
                <Input
                  label="Industrial Safety Knowledge"
                  placeholder="e.g. PPE, LOTO, Fire Safety, Permit to Work, EHS"
                  value={safetyKnowledge}
                  onChange={(e) => setSafetyKnowledge(e.target.value)}
                  helperText="Comma separated"
                />
                <Input
                  label="Soft Skills"
                  placeholder="e.g. Teamwork, Communication, Problem Solving, Leadership"
                  value={softSkills}
                  onChange={(e) => setSoftSkills(e.target.value)}
                  helperText="Comma separated"
                />
              </div>

              {/* Skills Needed for this Job */}
              {job && job.requirements && job.requirements.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Skills needed for this job (click to add to Technical Skills):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requirements.map((req) => {
                      const currentTech = technicalSkills
                        .split(",")
                        .map((s) => s.trim().toLowerCase());
                      const isAdded = currentTech.includes(req.toLowerCase());
                      return (
                        <button
                          key={req}
                          type="button"
                          onClick={() => {
                            if (!isAdded) {
                              setTechnicalSkills((prev) =>
                                prev ? `${prev}, ${req}` : req
                              );
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            isAdded
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300"
                          }`}
                        >
                          {isAdded ? "✓ " : "+ "}
                          {req}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               6. MACHINE / EQUIPMENT EXPERIENCE (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">6</span>
                  Machine / Equipment Experience
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setMachineExperiences([
                      ...machineExperiences,
                      {
                        id: `mach-${Date.now()}`,
                        machineName: "",
                        yearsOfExperience: "1 Year",
                        skillLevel: "Intermediate",
                      },
                    ])
                  }
                >
                  + Add Machine
                </Button>
              </div>

              {machineExperiences.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-1">
                  Optional. Click &quot;+ Add Machine&quot; to detail experience on specific machines (e.g. CNC Lathe, VMC, PLC Panels).
                </p>
              ) : (
                <div className="space-y-3">
                  {machineExperiences.map((m, idx) => (
                    <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Machine Entry #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setMachineExperiences(machineExperiences.filter((item) => item.id !== m.id))}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Machine / Equipment Name"
                          placeholder="e.g. CNC Lathe / VMC"
                          value={m.machineName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMachineExperiences(machineExperiences.map((item) => item.id === m.id ? { ...item, machineName: val } : item));
                          }}
                        />
                        <Input
                          label="Years of Experience"
                          placeholder="e.g. 3 Years"
                          value={m.yearsOfExperience}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMachineExperiences(machineExperiences.map((item) => item.id === m.id ? { ...item, yearsOfExperience: val } : item));
                          }}
                        />
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                            Skill Level
                          </label>
                          <select
                            value={m.skillLevel}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setMachineExperiences(machineExperiences.map((item) => item.id === m.id ? { ...item, skillLevel: val } : item));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white text-sm"
                          >
                            <option value="Basic">Basic</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               7. INDUSTRIAL CERTIFICATIONS (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">7</span>
                  Industrial Certifications
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCertifications([
                      ...certifications,
                      {
                        id: `cert-${Date.now()}`,
                        name: "",
                      },
                    ])
                  }
                >
                  + Add Certification
                </Button>
              </div>

              {certifications.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-1">
                  Optional. Click &quot;+ Add Certification&quot; to include Industrial Safety, Electrical Safety, CNC/PLC, NDT, etc.
                </p>
              ) : (
                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={cert.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Certification #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setCertifications(certifications.filter((c) => c.id !== cert.id))}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Certification Name"
                          placeholder="e.g. Industrial Safety / CNC Programming / NDT Level II"
                          value={cert.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCertifications(certifications.map((item) => item.id === cert.id ? { ...item, name: val } : item));
                          }}
                        />
                        <Input
                          label="Issuing Organization"
                          placeholder="e.g. National Safety Council / MSME"
                          value={cert.issuingOrganization || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCertifications(certifications.map((item) => item.id === cert.id ? { ...item, issuingOrganization: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               8. APPRENTICESHIP / TRAINING (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">8</span>
                  Apprenticeship / Industrial Training
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setTrainings([
                      ...trainings,
                      {
                        id: `train-${Date.now()}`,
                        organization: "",
                        trainingType: "Apprenticeship",
                      },
                    ])
                  }
                >
                  + Add Training / Apprenticeship
                </Button>
              </div>

              {trainings.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-1">
                  Especially important for ITI, Diploma & Freshers. Click &quot;+ Add Training&quot; to include plant training.
                </p>
              ) : (
                <div className="space-y-3">
                  {trainings.map((train, idx) => (
                    <div key={train.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Training Entry #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setTrainings(trainings.filter((t) => t.id !== train.id))}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Organization / Plant Name"
                          placeholder="e.g. Tata Motors Plant"
                          value={train.organization}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTrainings(trainings.map((item) => item.id === train.id ? { ...item, organization: val } : item));
                          }}
                        />
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                            Training Type
                          </label>
                          <select
                            value={train.trainingType}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setTrainings(trainings.map((item) => item.id === train.id ? { ...item, trainingType: val } : item));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                          >
                            <option value="Apprenticeship">Apprenticeship</option>
                            <option value="Internship">Internship</option>
                            <option value="Industrial Training">Industrial Training</option>
                            <option value="In-plant Training">In-plant Training</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Skills / Machines Learned"
                          placeholder="e.g. Lathe Operation, Panel Wiring"
                          value={train.skillsLearned || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTrainings(trainings.map((item) => item.id === train.id ? { ...item, skillsLearned: val } : item));
                          }}
                        />
                        <Input
                          label="Responsibilities"
                          placeholder="e.g. Assisted senior technician in preventive maintenance"
                          value={train.responsibilities || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTrainings(trainings.map((item) => item.id === train.id ? { ...item, responsibilities: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               9. PROJECTS (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">9</span>
                  Projects & Academic Work
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setProjects([
                      ...projects,
                      {
                        id: `proj-${Date.now()}`,
                        projectName: "",
                        technologiesUsed: "",
                      },
                    ])
                  }
                >
                  + Add Project
                </Button>
              </div>

              {projects.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-1">
                  Optional. Click &quot;+ Add Project&quot; to include academic or industrial project work.
                </p>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={proj.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Project #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setProjects(projects.filter((p) => p.id !== proj.id))}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Project Name"
                          placeholder="e.g. Automatic Conveyor Sorting System"
                          value={proj.projectName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjects(projects.map((item) => item.id === proj.id ? { ...item, projectName: val } : item));
                          }}
                        />
                        <Input
                          label="Role"
                          placeholder="e.g. Project Lead / Technician"
                          value={proj.role || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjects(projects.map((item) => item.id === proj.id ? { ...item, role: val } : item));
                          }}
                        />
                      </div>

                      <Input
                        label="Tools / Equipment / Tech Used"
                        placeholder="e.g. PLC, Sensors, Pneumatics, AutoCAD"
                        value={proj.technologiesUsed}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProjects(projects.map((item) => item.id === proj.id ? { ...item, technologiesUsed: val } : item));
                        }}
                      />

                      <Textarea
                        label="Description & Outcome"
                        placeholder="e.g. Built automated sorting line; reduced manual sorting time by 40%"
                        value={proj.description || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProjects(projects.map((item) => item.id === proj.id ? { ...item, description: val } : item));
                        }}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               10-13. DYNAMIC DOMAIN SECTIONS
               ═══════════════════════════════════════════ */}
            {/* Production Experience */}
            {showProduction && (
              <Card hover={false} className="p-5 sm:p-6 space-y-4 border-l-4 border-l-amber-500">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">10</span>
                    Production Experience
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Production Line / Process"
                    placeholder="e.g. Assembly Line #2 / Machine Shop"
                    value={productionLine}
                    onChange={(e) => setProductionLine(e.target.value)}
                  />
                  <Input
                    label="Daily Output / Target Handled"
                    placeholder="e.g. Handled 500+ units/day"
                    value={dailyProductionHandling}
                    onChange={(e) => setDailyProductionHandling(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Shift Experience"
                    placeholder="e.g. 3-Shift Rotational"
                    value={shiftExperience}
                    onChange={(e) => setShiftExperience(e.target.value)}
                  />
                  <Input
                    label="Team Size Handled"
                    placeholder="e.g. Managed 15 operators"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                  />
                </div>
              </Card>
            )}

            {/* Quality Experience */}
            {showQuality && (
              <Card hover={false} className="p-5 sm:p-6 space-y-4 border-l-4 border-l-emerald-500">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">11</span>
                    Quality & Inspection Experience
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Quality Areas"
                    placeholder="e.g. Incoming Quality, In-Process, Final Inspection, QA/QC"
                    value={qualityAreas}
                    onChange={(e) => setQualityAreas(e.target.value)}
                  />
                  <Input
                    label="Inspection Instruments Used"
                    placeholder="e.g. Vernier Caliper, Micrometer, Height Gauge, CMM"
                    value={inspectionEquipment}
                    onChange={(e) => setInspectionEquipment(e.target.value)}
                  />
                </div>
              </Card>
            )}

            {/* Maintenance Experience */}
            {showMaintenance && (
              <Card hover={false} className="p-5 sm:p-6 space-y-4 border-l-4 border-l-blue-500">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">12</span>
                    Maintenance Experience
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Maintenance Type"
                    placeholder="e.g. Preventive, Breakdown, Electrical, Mechanical"
                    value={maintenanceTypes}
                    onChange={(e) => setMaintenanceTypes(e.target.value)}
                  />
                  <Input
                    label="Systems / Equipment Maintained"
                    placeholder="e.g. Motors, Pumps, Compressors, Hydraulics, Pneumatics"
                    value={maintenanceSystems}
                    onChange={(e) => setMaintenanceSystems(e.target.value)}
                  />
                </div>
              </Card>
            )}

            {/* Electrical Skills */}
            {showElectrical && (
              <Card hover={false} className="p-5 sm:p-6 space-y-4 border-l-4 border-l-purple-500">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-bold">13</span>
                    Electrical & Electronics Skills
                  </h2>
                </div>

                <Input
                  label="Electrical & Automation Skills"
                  placeholder="e.g. Panel Wiring, Control Panels, PLC, VFD, Motor Maintenance, Sensors, Switchgear"
                  value={electricalSkills}
                  onChange={(e) => setElectricalSkills(e.target.value)}
                  helperText="Comma separated"
                />
              </Card>
            )}

            {/* ═══════════════════════════════════════════
               14. SHIFT & WORK PREFERENCE
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">14</span>
                  Shift & Work Preference
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Preferred Work Type
                  </label>
                  <select
                    value={preferredWorkType}
                    onChange={(e) => setPreferredWorkType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                    <option value="Internship">Internship</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Preferred Shift
                  </label>
                  <select
                    value={preferredShift}
                    onChange={(e) => setPreferredShift(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="General Shift">General Shift</option>
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="Rotational">Rotational Shift</option>
                    <option value="Any">Any Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Location Preference
                  </label>
                  <select
                    value={locationPreference}
                    onChange={(e) => setLocationPreference(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Local">Local Only</option>
                    <option value="Nearby Locations">Nearby Locations</option>
                    <option value="Willing to Relocate">Willing to Relocate</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* ═══════════════════════════════════════════
               15. NOTICE PERIOD / AVAILABILITY
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">15</span>
                  Notice Period / Availability
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Immediate">Immediate Joiner</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>

                <Input
                  label="Available From Date (Optional)"
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>
            </Card>

            {/* ═══════════════════════════════════════════
               16. LANGUAGES (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">16</span>
                  Languages
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setLanguages([
                      ...languages,
                      {
                        id: `lang-${Date.now()}`,
                        language: "",
                        proficiency: "Fluent",
                      },
                    ])
                  }
                >
                  + Add Language
                </Button>
              </div>

              {languages.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-1">
                  Click &quot;+ Add Language&quot; to include spoken languages (e.g. Hindi, Tamil, English).
                </p>
              ) : (
                <div className="space-y-3">
                  {languages.map((lang, idx) => (
                    <div
                      key={lang.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                    >
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Language #{idx + 1}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tamil, Hindi, English"
                          value={lang.language}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLanguages(
                              languages.map((item) =>
                                item.id === lang.id ? { ...item, language: val } : item
                              )
                            );
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                      </div>

                      <div className="w-full sm:w-48">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Proficiency
                        </label>
                        <select
                          value={lang.proficiency}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setLanguages(
                              languages.map((item) =>
                                item.id === lang.id ? { ...item, proficiency: val } : item
                              )
                            );
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Native">Native</option>
                        </select>
                      </div>

                      <div className="pt-1 sm:pt-5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setLanguages(languages.filter((l) => l.id !== lang.id))}
                          className="px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               17. ACHIEVEMENTS / AWARDS (Repeatable)
               ═══════════════════════════════════════════ */}
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-600 flex items-center justify-center text-xs font-bold">17</span>
                  Achievements & Awards
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setAchievements([
                      ...achievements,
                      {
                        id: `ach-${Date.now()}`,
                        name: "",
                      },
                    ])
                  }
                >
                  + Add Achievement
                </Button>
              </div>

              {achievements.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-1">
                  Optional. Click &quot;+ Add Achievement&quot; to include Best Employee, Kaizen, or Safety awards.
                </p>
              ) : (
                <div className="space-y-3">
                  {achievements.map((ach, idx) => (
                    <div key={ach.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Achievement #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setAchievements(achievements.filter((a) => a.id !== ach.id))}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Achievement / Award Name"
                          placeholder="e.g. Best Employee Award / Kaizen Award"
                          value={ach.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAchievements(achievements.map((item) => item.id === ach.id ? { ...item, name: val } : item));
                          }}
                        />
                        <Input
                          label="Organization / Plant"
                          placeholder="e.g. Plant Management"
                          value={ach.organization || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAchievements(achievements.map((item) => item.id === ach.id ? { ...item, organization: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ═══════════════════════════════════════════
               18. RESUME OPTION FOR HR REVIEW
               ═══════════════════════════════════════════ */}
            <Card
              id="section-resume-choice"
              hover={false}
              className={`p-5 sm:p-6 space-y-4 border-2 transition-all ${
                fieldErrors.resume
                  ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/10 dark:bg-red-950/20"
                  : "border-primary-200 dark:border-primary-800/60 bg-gradient-to-b from-white to-primary-50/20 dark:from-slate-900 dark:to-primary-950/20"
              }`}
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shadow-sm ${
                      fieldErrors.resume ? "bg-red-600" : "bg-primary-600"
                    }`}>18</span>
                    Resume Option for HR Review
                  </h2>
                  <Badge variant={fieldErrors.resume ? "rejected" : "info"}>
                    {fieldErrors.resume ? "Action Required" : "Choose Option"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Decide whether the employer/HR should view the original uploaded resume alongside your entered details, or a newly generated ATS-friendly resume.
                </p>
                {fieldErrors.resume && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {fieldErrors.resume}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Option 1: Use Uploaded Resume */}
                <div
                  onClick={() => {
                    setResumeDeliveryChoice("uploaded");
                    if (uploadedResumePath) clearFieldError("resume");
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    resumeDeliveryChoice === "uploaded"
                      ? "border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                          resumeDeliveryChoice === "uploaded"
                            ? "bg-primary-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}>
                          📄
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Use Uploaded Resume
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="resumeDeliveryChoice"
                        checked={resumeDeliveryChoice === "uploaded"}
                        onChange={() => setResumeDeliveryChoice("uploaded")}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      View the resume you uploaded for HR review along with all details entered above.
                    </p>
                  </div>

                  {/* Uploaded File Info or Inline Uploader */}
                  <div className="mt-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    {uploadedResumePath ? (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-emerald-600 font-bold text-xs shrink-0">✓ File:</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {uploadedResumeName || "Uploaded Resume"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={uploadedResumePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-0.5"
                          >
                            View ↗
                          </a>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                          >
                            Change
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">
                          No resume file attached yet. Upload your file:
                        </p>
                        <label className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-primary-400 dark:border-primary-600 rounded-lg text-xs font-semibold text-primary-600 dark:text-primary-300 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-100/50 cursor-pointer transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>{uploading ? "Uploading..." : "Upload Resume (PDF, DOCX, IMG)"}</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.docx"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option 2: Create new ATS-friendly Resume */}
                <div
                  onClick={() => {
                    setResumeDeliveryChoice("ats");
                    clearFieldError("resume");
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    resumeDeliveryChoice === "ats"
                      ? "border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                          resumeDeliveryChoice === "ats"
                            ? "bg-primary-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}>
                          ⚡
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Create New ATS-Friendly Resume
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="resumeDeliveryChoice"
                        checked={resumeDeliveryChoice === "ats"}
                        onChange={() => {
                          setResumeDeliveryChoice("ats");
                          clearFieldError("resume");
                        }}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      Generate a brand new ATS-friendly resume formatted directly with the details you entered above for HR review.
                    </p>
                  </div>

                  <div className="mt-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
                    <span>✨ Standardized format matching HR ATS screening systems</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Error Alert */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-sm text-red-600 dark:text-red-300 font-medium flex items-center justify-between gap-3 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{formError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const firstKey = Object.keys(fieldErrors)[0];
                    const targetId =
                      firstKey === "name"
                        ? "field-name"
                        : firstKey === "phone"
                        ? "field-phone"
                        : firstKey === "currentLocation"
                        ? "field-current-location"
                        : firstKey === "professionalTitle"
                        ? "field-professional-title"
                        : firstKey === "resume"
                        ? "section-resume-choice"
                        : "";
                    if (targetId) {
                      const el = document.getElementById(targetId);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      el?.focus?.();
                    }
                  }}
                  className="text-xs font-bold underline hover:text-red-800 dark:hover:text-red-200 shrink-0 cursor-pointer"
                >
                  Scroll to field ↑
                </button>
              </div>
            )}

            {/* Submit / ATS Resume Generation Button */}
            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" className="py-3 text-base shadow-md">
                {resumeDeliveryChoice === "uploaded" && uploadedResumePath
                  ? "Proceed with Uploaded Resume →"
                  : "Preview ATS Resume →"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
