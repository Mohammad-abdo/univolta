"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { apiGet, apiPut, apiUploadImage, apiUploadImages } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { getImageUrl } from "@/lib/image-utils";
import Link from "next/link";
import Image from "next/image";
import { t, getLanguage } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";

interface University {
  id: string;
  name: string;
  nameI18n?: unknown;
}

interface Program {
  id: string;
  universityId: string;
  name: string;
  nameI18n?: { en?: string; ar?: string };
  slug: string;
  degree?: string;
  duration?: string;
  language?: string;
  tuition?: string;
  tuitionNotes?: string;
  tuitionNotesI18n?: { en?: string; ar?: string };
  department?: string;
  startDate?: string;
  classSchedule?: string;
  studyMethod?: string;
  about?: string;
  aboutI18n?: { en?: string; ar?: string };
  lastApplicationDate?: string;
  studyYear?: number;
  coreSubjects?: string[];
  programImages?: string[];
  bannerImage?: string;
  isActive: boolean;
}

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [formData, setFormData] = useState({
    universityId: "",
    nameEn: "",
    nameAr: "",
    slug: "",
    degree: "",
    duration: "",
    language: "",
    tuition: "",
    tuitionNotesEn: "",
    tuitionNotesAr: "",
    department: "",
    startDate: "",
    classSchedule: "",
    studyMethod: "",
    aboutEn: "",
    aboutAr: "",
    lastApplicationDate: "",
    studyYear: "",
    coreSubjects: [] as string[],
    programImages: [] as string[],
    bannerImage: "",
    isActive: true,
  });

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [programImagePreviews, setProgramImagePreviews] = useState<string[]>([]);
  const [newCoreSubject, setNewCoreSubject] = useState("");

  useEffect(() => {
    if (id) {
      fetchUniversities();
      fetchProgram();
    }
  }, [id]);

  const fetchUniversities = async () => {
    try {
      const data = await apiGet<University[]>("/universities");
      setUniversities(data);
    } catch (error: any) {
      showToast.error(t("failedToLoadUniversities"));
    }
  };

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Program>(`/programs/${id}`);
      
      setFormData({
        universityId: data.universityId || "",
        nameEn: (data.nameI18n?.en ?? data.name) || "",
        nameAr: data.nameI18n?.ar || "",
        slug: data.slug || "",
        degree: data.degree || "",
        duration: data.duration || "",
        language: data.language || "",
        tuition: data.tuition || "",
        tuitionNotesEn: (data.tuitionNotesI18n?.en ?? data.tuitionNotes) || "",
        tuitionNotesAr: data.tuitionNotesI18n?.ar || "",
        department: data.department || "",
        startDate: data.startDate || "",
        classSchedule: data.classSchedule || "",
        studyMethod: data.studyMethod || "",
        aboutEn: (data.aboutI18n?.en ?? data.about) || "",
        aboutAr: data.aboutI18n?.ar || "",
        lastApplicationDate: data.lastApplicationDate || "",
        studyYear: data.studyYear?.toString() || "",
        coreSubjects: Array.isArray(data.coreSubjects) ? data.coreSubjects : [],
        programImages: Array.isArray(data.programImages) ? data.programImages : [],
        bannerImage: data.bannerImage || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      if (data.bannerImage) setBannerPreview(getImageUrl(data.bannerImage));
      if (Array.isArray(data.programImages)) {
        setProgramImagePreviews(data.programImages.map((img: string) => getImageUrl(img)));
      }
    } catch (error: any) {
      const errorMsg = error.message || t("dashboardFailedToLoadProgram");
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: "banner" | "program") => {
    try {
      setUploading(type);
      const result = await apiUploadImage(file);
      const imageUrl = result.url; // Relative path like /uploads/filename.jpg

      if (type === "banner") {
        setFormData({ ...formData, bannerImage: imageUrl });
        setBannerPreview(URL.createObjectURL(file));
      } else if (type === "program") {
        setFormData({ ...formData, programImages: [...formData.programImages, imageUrl] });
        setProgramImagePreviews([...programImagePreviews, URL.createObjectURL(file)]);
      }
    } catch (error: any) {
      showToast.error(error.message || t("dashboardFailedToUploadImage"));
    } finally {
      setUploading(null);
    }
  };

  const handleMultipleProgramImages = async (files: FileList) => {
    try {
      setUploading("program");
      const fileArray = Array.from(files);
      const result = await apiUploadImages(fileArray);
      const urls = result.files.map((f) => f.url);
      setFormData({ ...formData, programImages: [...formData.programImages, ...urls] });
      fileArray.forEach((file) => {
        setProgramImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      });
    } catch (error: any) {
      showToast.error(error.message || t("dashboardFailedToUploadImages"));
    } finally {
      setUploading(null);
    }
  };

  const removeProgramImage = (index: number) => {
    const newImages = formData.programImages.filter((_, i) => i !== index);
    const newPreviews = programImagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, programImages: newImages });
    setProgramImagePreviews(newPreviews);
  };

  const addCoreSubject = () => {
    if (newCoreSubject.trim()) {
      setFormData({
        ...formData,
        coreSubjects: [...formData.coreSubjects, newCoreSubject.trim()],
      });
      setNewCoreSubject("");
    }
  };

  const removeCoreSubject = (index: number) => {
    setFormData({
      ...formData,
      coreSubjects: formData.coreSubjects.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const slug = formData.slug || formData.nameEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      // Convert relative image paths to full URLs for backend validation
      const bannerImage = formData.bannerImage?.trim() 
        ? getImageUrl(formData.bannerImage) || undefined 
        : undefined;
      const programImages = formData.programImages.length > 0 
        ? formData.programImages
            .filter(img => img?.trim())
            .map(img => getImageUrl(img))
            .filter(url => url)
        : undefined;

      await apiPut(`/programs/${id}`, {
        ...formData,
        name: { en: formData.nameEn, ar: formData.nameAr || undefined },
        tuitionNotes:
          formData.tuitionNotesEn || formData.tuitionNotesAr
            ? { en: formData.tuitionNotesEn, ar: formData.tuitionNotesAr || undefined }
            : undefined,
        about:
          formData.aboutEn || formData.aboutAr
            ? { en: formData.aboutEn, ar: formData.aboutAr || undefined }
            : undefined,
        slug,
        universityId: formData.universityId,
        degree: formData.degree || undefined,
        duration: formData.duration || undefined,
        language: formData.language || undefined,
        tuition: formData.tuition || undefined,
        department: formData.department || undefined,
        startDate: formData.startDate || undefined,
        classSchedule: formData.classSchedule || undefined,
        studyMethod: formData.studyMethod || undefined,
        lastApplicationDate: formData.lastApplicationDate || undefined,
        studyYear: formData.studyYear ? parseInt(formData.studyYear) : undefined,
        coreSubjects: formData.coreSubjects.length > 0 ? formData.coreSubjects : undefined,
        programImages,
        bannerImage,
      });

      showToast.success(t("dashboardProgramUpdated"));
      router.push("/dashboard/programs");
    } catch (error: any) {
      const errorMsg = error.message || t("dashboardProgramUpdateFailed");
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/programs">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          {t("editProgram")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">{t("dashboardBasicInformation")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("dashboardUniversityFieldStar")}
              </label>
              <select
                value={formData.universityId}
                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">{t("dashboardSelectUniversityPlaceholder")}</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {pickLocalized(university.nameI18n ?? university.name, getLanguage())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("programNameEnglishStar")}
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("programNameArabicLabel")}
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("slugRequiredLabel")}
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder={t("dashboardSlugPlaceholder")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
              <p className="text-xs text-gray-500 mt-1">{t("dashboardSlugHint")}</p>
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("profileTableDegree")}
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder={t("degreePlaceholderExamples")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("durationLabel")}
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder={t("durationPlaceholderExamples")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("language")}
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder={t("programLanguagePlaceholderExamples")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("departmentLabel")}
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder={t("departmentPlaceholderExamples")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("startOfStudyLabel")}
              </label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder={t("startOfStudyPlaceholder")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("studyTimeLabel")}
              </label>
              <select
                value={formData.classSchedule}
                onChange={(e) => setFormData({ ...formData, classSchedule: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">{t("dashboardSelectStudyTime")}</option>
                <option value="Morning">{t("studyTimeMorning")}</option>
                <option value="Evening">{t("studyTimeEvening")}</option>
              </select>
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("studyMethodLabel")}
              </label>
              <select
                value={formData.studyMethod}
                onChange={(e) => setFormData({ ...formData, studyMethod: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">{t("dashboardSelectStudyMethod")}</option>
                <option value="Undefined">{t("studyMethodUndefined")}</option>
                <option value="Online">{t("studyMethodOnline")}</option>
                <option value="On-campus">{t("studyMethodOnCampus")}</option>
                <option value="Hybrid">{t("studyMethodHybrid")}</option>
              </select>
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("lastApplicationDateLabel")}
              </label>
              <input
                type="text"
                value={formData.lastApplicationDate}
                onChange={(e) => setFormData({ ...formData, lastApplicationDate: e.target.value })}
                placeholder={t("lastApplicationDatePlaceholder")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("studyYearLabel")}
              </label>
              <input
                type="number"
                value={formData.studyYear}
                onChange={(e) => setFormData({ ...formData, studyYear: e.target.value })}
                placeholder={t("studyYearPlaceholder")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("tuitionShortLabel")}
              </label>
              <input
                type="text"
                value={formData.tuition}
                onChange={(e) => setFormData({ ...formData, tuition: e.target.value })}
                placeholder={t("tuitionPlaceholderExample")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("tuitionNotesEnglishLabel")}
              </label>
              <textarea
                value={formData.tuitionNotesEn}
                onChange={(e) => setFormData({ ...formData, tuitionNotesEn: e.target.value })}
                rows={3}
                placeholder={t("tuitionNotesPlaceholderEn")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("tuitionNotesArabicLabel")}
              </label>
              <textarea
                dir="rtl"
                value={formData.tuitionNotesAr}
                onChange={(e) => setFormData({ ...formData, tuitionNotesAr: e.target.value })}
                rows={3}
                placeholder={t("dashboardServiceDescriptionPlaceholderAr")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
          </div>
        </div>

        {/* About the Program */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">{t("dashboardAboutProgramSection")}</h2>
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              {t("dashboardDescriptionEn")}
            </label>
            <textarea
              value={formData.aboutEn}
              onChange={(e) => setFormData({ ...formData, aboutEn: e.target.value })}
              rows={5}
              placeholder={t("describeProgramDetailPlaceholder")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              {t("dashboardDescriptionAr")}
            </label>
            <textarea
              dir="rtl"
              value={formData.aboutAr}
              onChange={(e) => setFormData({ ...formData, aboutAr: e.target.value })}
              rows={5}
              placeholder={t("dashboardDescribeProgramArPlaceholder")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>
        </div>

        {/* Core Subjects */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">{t("dashboardCoreSubjects")}</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCoreSubject}
              onChange={(e) => setNewCoreSubject(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCoreSubject())}
              placeholder={t("dashboardEnterCoreSubject")}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
            <Button type="button" onClick={addCoreSubject} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t("add")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.coreSubjects.map((subject, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {subject}
                <button
                  type="button"
                  onClick={() => removeCoreSubject(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">{t("dashboardImagesSection")}</h2>
          
          {/* Banner Image */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              {t("dashboardBannerHeroLabel")}
            </label>
            {bannerPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                <Image
                  src={bannerPreview}
                  alt={t("universityBanner")}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, bannerImage: "" });
                    setBannerPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{t("dashboardClickUploadBannerImage")}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "banner")}
                  className="hidden"
                  disabled={uploading === "banner"}
                />
              </label>
            )}
          </div>

          {/* Program Images (Tour Gallery) */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              {t("dashboardProgramImagesGalleryLabel")}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {programImagePreviews.map((preview, index) => (
                <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300">
                  <Image
                    src={preview}
                    alt={`Program image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeProgramImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{t("dashboardClickUploadDragMultiple")}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleMultipleProgramImages(e.target.files)}
                className="hidden"
                disabled={uploading === "program"}
              />
            </label>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">{t("dashboardStatusSection")}</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
            />
            <span className="font-montserrat-semibold text-sm">{t("active")}</span>
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
          >
            {saving ? t("saving") : t("saveChanges")}
          </Button>
          <Link href="/dashboard/programs">
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
