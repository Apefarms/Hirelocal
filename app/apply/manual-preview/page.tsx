"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function ManualPreviewPage() {
  const router = useRouter();
  const { candidateSession, candidateFormData, applyingToJobId, isHydrated } = useSession();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isHydrated && !candidateSession) {
      router.replace("/candidate/login");
      return;
    }
    if (isHydrated && !candidateFormData) {
      router.replace("/apply");
    }
  }, [isHydrated, candidateSession, candidateFormData, router]);

  if (!isHydrated || !candidateSession || !candidateFormData) {
    return <FullPageLoader />;
  }

  const data = candidateFormData;

  // Direct PDF Download Engine using jsPDF (no print dialog, strictly ATS layout, zero text overlapping)
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      const margin = 16;
      const contentWidth = pageWidth - margin * 2; // 178mm
      let y = 18;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 16) {
          doc.addPage();
          y = 16;
        }
      };

      const addSectionHeader = (title: string) => {
        checkPageBreak(14);
        y += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(title.toUpperCase(), margin, y);
        y += 2;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      };

      // 1. Candidate Name (Bold Large Heading)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // Slate 900
      const nameText = (data.name || "CANDIDATE NAME").toUpperCase();
      const splitName = doc.splitTextToSize(nameText, contentWidth);
      checkPageBreak(splitName.length * 8);
      doc.text(splitName, margin, y);
      y += splitName.length * 8;

      // 2. Professional Title
      if (data.professionalTitle) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(13, 148, 136); // Teal 600
        const splitTitle = doc.splitTextToSize(data.professionalTitle, contentWidth);
        checkPageBreak(splitTitle.length * 5 + 1);
        doc.text(splitTitle, margin, y);
        y += splitTitle.length * 5 + 1;
      }

      // 3. Contact Details Line
      const contactParts = [
        data.currentLocation ? `Location: ${data.currentLocation}` : "",
        data.phone ? `Phone: ${data.phone}` : "",
        data.email ? `Email: ${data.email}` : "",
        data.linkedinUrl ? `LinkedIn: ${data.linkedinUrl}` : "",
        data.portfolioUrl ? `Profile: ${data.portfolioUrl}` : "",
      ].filter(Boolean);

      if (contactParts.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105); // Slate 600
        const contactText = contactParts.join("   |   ");
        const splitContact = doc.splitTextToSize(contactText, contentWidth);
        checkPageBreak(splitContact.length * 4 + 1);
        doc.text(splitContact, margin, y);
        y += splitContact.length * 4 + 2;
      }

      // Meta tags row
      const metaParts = [
        data.careerLevel ? `Level: ${data.careerLevel}` : "",
        data.totalExperience ? `Experience: ${data.totalExperience}` : "",
        data.primaryDomain ? `Domain: ${data.primaryDomain}` : "",
        data.functionalArea ? `Function: ${data.functionalArea}` : "",
      ].filter(Boolean);

      if (metaParts.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const splitMeta = doc.splitTextToSize(metaParts.join("   •   "), contentWidth);
        checkPageBreak(splitMeta.length * 4 + 2);
        doc.text(splitMeta, margin, y);
        y += splitMeta.length * 4 + 3;
      }

      // 4. CAREER PROFILE
      addSectionHeader("Career Profile");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const summaryText = `${data.careerLevel || "Experienced"} ${data.professionalTitle || "Technical Professional"}${
        data.totalExperience ? ` with ${data.totalExperience} of experience in ${data.primaryDomain || "core manufacturing"}` : ""
      }.${data.functionalArea ? ` Specialized in ${data.functionalArea}.` : ""}${
        data.availability ? ` Available to join: ${data.availability}.` : ""
      }${data.preferredShift ? ` Preferred Shift: ${data.preferredShift}.` : ""}`;
      
      const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
      checkPageBreak(splitSummary.length * 4.2);
      doc.text(splitSummary, margin, y);
      y += splitSummary.length * 4.2 + 2;

      // 5. EDUCATION & TECHNICAL QUALIFICATION
      if (data.educations && data.educations.length > 0) {
        addSectionHeader("Education & Technical Qualification");
        data.educations.forEach((edu) => {
          const yearText = `${edu.startYear ? `${edu.startYear} – ` : ""}${edu.graduationYear || ""}`.trim();
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const yearWidth = yearText ? doc.getTextWidth(yearText) + 6 : 0;
          const maxDegreeWidth = contentWidth - yearWidth;

          const degreeName = `${edu.degree || ""}${edu.specialization ? ` (${edu.specialization})` : ""}`;
          const institutionText = edu.institution ? ` — ${edu.institution}` : "";
          const fullDegreeTitle = `${degreeName}${institutionText}`.replace(/\r?\n+/g, " ").trim();

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          const splitDegree = doc.splitTextToSize(fullDegreeTitle, maxDegreeWidth);
          
          checkPageBreak(splitDegree.length * 4.5 + 8);

          doc.text(splitDegree, margin, y);
          if (yearText) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(yearText, pageWidth - margin, y, { align: "right" });
          }
          y += splitDegree.length * 4.5 + 1;

          if (edu.university || edu.cgpa) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const subDetails = [
              edu.university ? `University/Board: ${edu.university.replace(/\r?\n+/g, " ").trim()}` : "",
              edu.cgpa ? `Score/Percentage: ${edu.cgpa}` : "",
            ].filter(Boolean).join("   |   ");
            const splitSub = doc.splitTextToSize(subDetails, contentWidth);
            checkPageBreak(splitSub.length * 4);
            doc.text(splitSub, margin, y);
            y += splitSub.length * 4 + 1.5;
          }
          y += 2;
        });
      }

      // 6. TECHNICAL SKILLS & COMPETENCIES
      if (data.technicalSkills || data.machineryEquipment || data.softwareTools || data.qualityTools || data.safetyKnowledge || data.electricalSkills || data.softSkills) {
        addSectionHeader("Technical Skills & Competencies");

        const skillsList = [
          data.technicalSkills ? { label: "Technical Skills", val: data.technicalSkills } : null,
          data.machineryEquipment ? { label: "Machinery & Equipment", val: data.machineryEquipment } : null,
          data.softwareTools ? { label: "Software & CAD Tools", val: data.softwareTools } : null,
          data.qualityTools ? { label: "Quality Methods", val: data.qualityTools } : null,
          data.safetyKnowledge ? { label: "Industrial Safety", val: data.safetyKnowledge } : null,
          data.electricalSkills ? { label: "Electrical & Automation", val: data.electricalSkills } : null,
          data.softSkills ? { label: "Soft Skills", val: data.softSkills } : null,
        ].filter(Boolean);

        skillsList.forEach((item) => {
          if (!item || !item.val) return;
          const cleanVal = item.val.replace(/\r?\n+/g, " ").trim();
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          const labelStr = `${item.label}: `;
          const labelWidth = doc.getTextWidth(labelStr);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          const splitVal = doc.splitTextToSize(cleanVal, contentWidth - labelWidth);
          checkPageBreak(splitVal.length * 4 + 2);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 41, 59);
          doc.text(labelStr, margin, y);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          doc.text(splitVal, margin + labelWidth, y);
          y += Math.max(1, splitVal.length) * 4 + 1.5;
        });
      }

      // 7. MACHINE & EQUIPMENT PROFICIENCY
      if (data.machineExperiences && data.machineExperiences.length > 0) {
        addSectionHeader("Machine & Equipment Proficiency");
        data.machineExperiences.forEach((m) => {
          checkPageBreak(5);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(30, 41, 59);
          const prefix = `•  ${m.machineName}: `;
          doc.text(prefix, margin, y);
          
          const w = doc.getTextWidth(prefix);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          doc.text(`${m.yearsOfExperience} (${m.skillLevel} level)`, margin + w, y);
          y += 4.5;
        });
      }

      // 8. WORK EXPERIENCE
      if (data.experiences && data.experiences.length > 0) {
        addSectionHeader("Work Experience");
        data.experiences.forEach((exp) => {
          const dateText = `${exp.startDate || ""} ${exp.startDate ? "–" : ""} ${exp.currentlyWorking ? "Present" : exp.endDate || ""}`.trim();
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const dateWidth = dateText ? doc.getTextWidth(dateText) + 6 : 0;
          const maxTitleWidth = contentWidth - dateWidth;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          const companyStr = exp.companyName ? ` — ${exp.companyName}` : "";
          const locStr = exp.location ? ` (${exp.location})` : "";
          const jobCompanyText = `${exp.jobTitle || "Role"}${companyStr}${locStr}`.replace(/\r?\n+/g, " ").trim();
          const splitJobTitle = doc.splitTextToSize(jobCompanyText, maxTitleWidth);
          
          checkPageBreak(splitJobTitle.length * 4.5 + 6);

          doc.text(splitJobTitle, margin, y);
          if (dateText) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(dateText, pageWidth - margin, y, { align: "right" });
          }
          y += splitJobTitle.length * 4.5 + 1.5;

          // Responsibilities
          if (exp.responsibilities && exp.responsibilities.filter(Boolean).length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            exp.responsibilities.filter(Boolean).forEach((resp) => {
              const cleanResp = resp.replace(/^[\*\-•]\s*/, "").replace(/\r?\n+/g, " ").trim();
              if (!cleanResp) return;
              const splitResp = doc.splitTextToSize(`•  ${cleanResp}`, contentWidth - 4);
              checkPageBreak(splitResp.length * 4);
              doc.text(splitResp, margin + 2, y);
              y += splitResp.length * 4 + 0.5;
            });
          }

          // Key Achievements
          if (exp.achievements && exp.achievements.filter(Boolean).length > 0) {
            checkPageBreak(6);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            doc.text("Key Achievements:", margin + 2, y);
            y += 4;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            exp.achievements.filter(Boolean).forEach((ach) => {
              const cleanAch = ach.replace(/^[\*\-•]\s*/, "").replace(/\r?\n+/g, " ").trim();
              if (!cleanAch) return;
              const splitAch = doc.splitTextToSize(`•  ${cleanAch}`, contentWidth - 4);
              checkPageBreak(splitAch.length * 4);
              doc.text(splitAch, margin + 2, y);
              y += splitAch.length * 4 + 0.5;
            });
          }

          y += 2.5;
        });
      }

      // 9. DOMAIN EXPERTISE
      if (data.productionLine || data.qualityAreas || data.maintenanceTypes) {
        addSectionHeader("Domain Expertise");
        doc.setFontSize(8.5);
        const domainItems = [
          data.productionLine ? `Production: Line: ${data.productionLine} | Output: ${data.dailyProductionHandling || "Standard"} | Shift: ${data.shiftExperience || "General"}` : null,
          data.qualityAreas ? `Quality: Areas: ${data.qualityAreas} | Instruments: ${data.inspectionEquipment || "Standard Gauges"}` : null,
          data.maintenanceTypes ? `Maintenance: Types: ${data.maintenanceTypes} | Systems: ${data.maintenanceSystems || "Standard Systems"}` : null,
        ].filter(Boolean);

        domainItems.forEach((text) => {
          if (!text) return;
          const cleanText = text.replace(/\r?\n+/g, " ").trim();
          const split = doc.splitTextToSize(cleanText, contentWidth);
          checkPageBreak(split.length * 4);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          doc.text(split, margin, y);
          y += split.length * 4 + 1.5;
        });
      }

      // 10. APPRENTICESHIP & INDUSTRIAL TRAINING
      if (data.trainings && data.trainings.length > 0) {
        addSectionHeader("Apprenticeship & Industrial Training");
        data.trainings.forEach((t) => {
          checkPageBreak(8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          const title = `${t.trainingType} — ${t.organization}`.replace(/\r?\n+/g, " ").trim();
          const splitTitle = doc.splitTextToSize(title, contentWidth);
          doc.text(splitTitle, margin, y);
          y += splitTitle.length * 4.2;

          if (t.skillsLearned) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const splitSkills = doc.splitTextToSize(`Learned: ${t.skillsLearned.replace(/\r?\n+/g, " ").trim()}`, contentWidth);
            doc.text(splitSkills, margin, y);
            y += splitSkills.length * 4;
          }
          y += 2;
        });
      }

      // 11. PROJECTS & TECHNICAL WORK
      if (data.projects && data.projects.length > 0) {
        addSectionHeader("Projects & Technical Work");
        data.projects.forEach((proj) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          const projTitle = `${proj.projectName}${proj.role ? ` (${proj.role})` : ""}`.replace(/\r?\n+/g, " ").trim();
          const splitTitle = doc.splitTextToSize(projTitle, contentWidth);
          checkPageBreak(splitTitle.length * 4.5 + 4);
          doc.text(splitTitle, margin, y);
          y += splitTitle.length * 4.5;

          if (proj.technologiesUsed) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const splitTools = doc.splitTextToSize(`Tools/Equipment: ${proj.technologiesUsed.replace(/\r?\n+/g, " ").trim()}`, contentWidth);
            checkPageBreak(splitTools.length * 4);
            doc.text(splitTools, margin, y);
            y += splitTools.length * 4;
          }

          if (proj.description) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            const splitDesc = doc.splitTextToSize(proj.description.replace(/\r?\n+/g, " ").trim(), contentWidth);
            checkPageBreak(splitDesc.length * 4);
            doc.text(splitDesc, margin, y);
            y += splitDesc.length * 4;
          }
          y += 2;
        });
      }

      // 12. INDUSTRIAL CERTIFICATIONS
      if (data.certifications && data.certifications.length > 0) {
        addSectionHeader("Industrial Certifications");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        data.certifications.forEach((c) => {
          const certText = `•  ${c.name}${c.issuingOrganization ? ` — ${c.issuingOrganization}` : ""}`.replace(/\r?\n+/g, " ").trim();
          const splitCert = doc.splitTextToSize(certText, contentWidth);
          checkPageBreak(splitCert.length * 4);
          doc.text(splitCert, margin, y);
          y += splitCert.length * 4 + 1;
        });
      }

      // 13. LANGUAGES
      if (data.languages && data.languages.length > 0) {
        addSectionHeader("Languages Spoken");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const langStr = data.languages.map((l) => `${l.language} (${l.proficiency})`).join("   •   ");
        const splitLang = doc.splitTextToSize(langStr, contentWidth);
        checkPageBreak(splitLang.length * 4);
        doc.text(splitLang, margin, y);
        y += splitLang.length * 4 + 2;
      }

      // DIRECT FILE DOWNLOAD (No print modal!)
      const fileName = `${(data.name || "ATS_Resume").replace(/\s+/g, "_")}_ATS_Resume.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("jsPDF failed, fallback to print:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  /*
  // Razorpay payment flow temporarily deactivated
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const existingScript = document.getElementById("razorpay-checkout-js");
      if (existingScript) return resolve(true);

      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayAndDownload = async () => {
    try {
      setDownloading(true);
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay payment gateway. Please check your internet connection.");
        setDownloading(false);
        return;
      }

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 10,
          candidateName: data.name,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.orderId) {
        alert(`Could not initiate payment: ${orderData.error || "Please try again."}`);
        setDownloading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "HireLocal",
        description: "Professional ATS Resume Download (₹10)",
        order_id: orderData.orderId,
        prefill: {
          name: data.name || "",
          email: data.email || "",
          contact: data.phone || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: () => {
            setDownloading(false);
          },
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                candidateId: candidateSession?.id || null,
                amount: orderData.amount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await handleDownloadPdf();
            } else {
              alert(`Payment verification failed: ${verifyData.error || "Please contact support."}`);
            }
          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            alert("Error verifying payment transaction.");
          } finally {
            setDownloading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        alert(`Payment failed: ${resp.error.description || "Transaction was not completed."}`);
        setDownloading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      alert("An unexpected error occurred while launching payment.");
      setDownloading(false);
    }
  };
  */

  const handleEditDetails = () => {
    if (applyingToJobId) {
      router.push(`/apply?job=${applyingToJobId}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Generated ATS Resume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Core-Industry ATS Resume generated for {data.primaryDomain || "Technical"} Jobs
          </p>
        </div>
        <button
          onClick={handleEditDetails}
          className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
        >
          ← Edit Details
        </button>
      </div>

      {/* Resume Delivery Preference Banner */}
      {data.resumeDeliveryChoice === "uploaded" && data.uploadedResumePath ? (
        <div className="mb-5 p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Resume for HR</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">Uploaded File</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Original file <strong className="font-semibold">{data.uploadedResumeName || "Uploaded Resume"}</strong> will be viewed by HR with your profile.
              </p>
            </div>
          </div>
          <a
            href={data.uploadedResumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-200 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            View Uploaded File ↗
          </a>
        </div>
      ) : (
        <div className="mb-5 p-4 rounded-xl border bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Resume for HR</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">New ATS Resume</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              Standardized ATS resume formatted below will be submitted to the HR reviewer.
            </p>
          </div>
        </div>
      )}

      {/* On-screen Preview Resume Canvas */}
      <div id="ats-resume-card">
      <Card hover={false} className="p-6 sm:p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 font-sans">
        
        {/* Header / Contact Info */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            {data.name}
          </h1>
          {data.professionalTitle && (
            <p className="text-base font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
              {data.professionalTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
            {data.currentLocation && <span>📍 {data.currentLocation}</span>}
            {data.phone && <span>📞 {data.phone}</span>}
            {data.email && <span>✉️ {data.email}</span>}
            {data.linkedinUrl && <span>🔗 LinkedIn: {data.linkedinUrl}</span>}
            {data.portfolioUrl && <span>🌐 Profile: {data.portfolioUrl}</span>}
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 mt-2.5">
            {data.careerLevel && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Level: {data.careerLevel}</span>}
            {data.totalExperience && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Experience: {data.totalExperience}</span>}
            {data.primaryDomain && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Domain: {data.primaryDomain}</span>}
            {data.functionalArea && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Function: {data.functionalArea}</span>}
          </div>
        </div>

        {/* 1. Professional Profile Summary */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
            Career Profile
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.careerLevel || "Experienced"} {data.professionalTitle || "Technical Professional"}
            {data.totalExperience ? ` with ${data.totalExperience} in ${data.primaryDomain || "core manufacturing"}` : ""}.
            {data.functionalArea ? ` Specialized in ${data.functionalArea}.` : ""}
            {data.availability ? ` Available to join: ${data.availability}.` : ""}
            {data.preferredShift ? ` Shift Preference: ${data.preferredShift}.` : ""}
          </p>
        </section>

        {/* 2. Education & Technical Qualification */}
        {data.educations && data.educations.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
              Education & Technical Qualification
            </h2>
            <div className="space-y-3">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-xs sm:text-sm">
                  <div className="flex flex-wrap items-baseline justify-between font-bold text-slate-800 dark:text-slate-100">
                    <span>
                      {edu.degree} {edu.specialization ? `(${edu.specialization})` : ""} — <span className="font-normal italic">{edu.institution}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {edu.startYear ? `${edu.startYear} – ` : ""}{edu.graduationYear}
                    </span>
                  </div>
                  {edu.university && (
                    <p className="text-xs text-slate-500">Board/University: {edu.university}</p>
                  )}
                  {edu.cgpa && (
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">Score/Percentage: {edu.cgpa}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Technical Skills & Tools */}
        {(data.technicalSkills || data.softwareTools || data.machineryEquipment || data.qualityTools || data.safetyKnowledge || data.electricalSkills) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              Technical Skills & Competencies
            </h2>
            <div className="space-y-1.5 text-xs sm:text-sm">
              {data.technicalSkills && (
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Technical Skills:</span>{" "}
                  {data.technicalSkills}
                </p>
              )}
              {data.machineryEquipment && (
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Machinery & Equipment:</span>{" "}
                  {data.machineryEquipment}
                </p>
              )}
              {data.softwareTools && (
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Software & CAD Tools:</span>{" "}
                  {data.softwareTools}
                </p>
              )}
              {data.qualityTools && (
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Quality Methods:</span>{" "}
                  {data.qualityTools}
                </p>
              )}
              {data.safetyKnowledge && (
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Industrial Safety:</span>{" "}
                  {data.safetyKnowledge}
                </p>
              )}
              {data.electricalSkills && (
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Electrical & Automation:</span>{" "}
                  {data.electricalSkills}
                </p>
              )}
              {data.softSkills && (
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Soft Skills:</span>{" "}
                  {data.softSkills}
                </p>
              )}
            </div>
          </section>
        )}

        {/* 4. Machine Experience Table */}
        {data.machineExperiences && data.machineExperiences.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              Machine & Equipment Proficiency
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {data.machineExperiences.map((m) => (
                <div key={m.id} className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold">{m.machineName}</span>
                  <span className="text-slate-500">{m.yearsOfExperience} • {m.skillLevel}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Work Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
              Work Experience
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="text-xs sm:text-sm">
                  <div className="flex flex-wrap items-baseline justify-between font-bold text-slate-800 dark:text-slate-100">
                    <span>
                      {exp.jobTitle} — <span className="font-normal italic">{exp.companyName}</span>
                      {exp.location ? ` (${exp.location})` : ""}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {exp.startDate} {exp.startDate ? "–" : ""} {exp.currentlyWorking ? "Present" : exp.endDate}
                    </span>
                  </div>

                  {exp.responsibilities && exp.responsibilities.filter(Boolean).length > 0 && (
                    <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600 dark:text-slate-300">
                      {exp.responsibilities.filter(Boolean).map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  )}

                  {exp.achievements && exp.achievements.filter(Boolean).length > 0 && (
                    <div className="mt-1">
                      <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">Key Achievements:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                        {exp.achievements.filter(Boolean).map((ach, idx) => (
                          <li key={idx}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Dynamic Domain Summaries (Production / Quality / Maintenance) */}
        {(data.productionLine || data.qualityAreas || data.maintenanceTypes) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              Domain Expertise
            </h2>
            <div className="space-y-2 text-xs sm:text-sm">
              {data.productionLine && (
                <p><span className="font-semibold">Production:</span> Line: {data.productionLine} | Output: {data.dailyProductionHandling} | Shift: {data.shiftExperience}</p>
              )}
              {data.qualityAreas && (
                <p><span className="font-semibold">Quality:</span> Areas: {data.qualityAreas} | Instruments: {data.inspectionEquipment}</p>
              )}
              {data.maintenanceTypes && (
                <p><span className="font-semibold">Maintenance:</span> Types: {data.maintenanceTypes} | Systems: {data.maintenanceSystems}</p>
              )}
            </div>
          </section>
        )}

        {/* 7. Apprenticeship & Industrial Training */}
        {data.trainings && data.trainings.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              Apprenticeship & Industrial Training
            </h2>
            <div className="space-y-2 text-xs sm:text-sm">
              {data.trainings.map((t) => (
                <div key={t.id}>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {t.trainingType} — {t.organization}
                  </p>
                  {t.skillsLearned && <p className="text-xs text-slate-600">Learned: {t.skillsLearned}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Projects */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
              Projects & Technical Work
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj) => (
                <div key={proj.id} className="text-xs sm:text-sm">
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    {proj.projectName} {proj.role ? `(${proj.role})` : ""}
                  </div>
                  {proj.technologiesUsed && (
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tools/Equipment: {proj.technologiesUsed}</p>
                  )}
                  {proj.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              Industrial Certifications
            </h2>
            <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 text-slate-700 dark:text-slate-300">
              {data.certifications.map((c) => (
                <li key={c.id}>
                  <span className="font-semibold">{c.name}</span>
                  {c.issuingOrganization ? ` — ${c.issuingOrganization}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 10. Languages */}
        {data.languages && data.languages.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              Languages Spoken
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
            </p>
          </section>
        )}

      </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          fullWidth
          size="lg"
          onClick={() => router.push("/apply/confirm")}
        >
          Looks Good, Continue →
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          loading={downloading}
          onClick={handleDownloadPdf}
          className="flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download ATS Resume</span>
        </Button>
        {data.uploadedResumePath && (
          <a
            href={data.uploadedResumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <span>📄</span>
            <span>View Uploaded File</span>
          </a>
        )}
      </div>
    </div>
  );
}
