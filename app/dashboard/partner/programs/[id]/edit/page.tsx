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

interface Program {
  id: string;
  name: string;
  slug: string;
  degree?: string;
  duration?: string;
  language?: string;
  tuition?: string;
  tuitionNotes?: string;
  department?: string;
  startDate?: string;
  classSchedule?: string;
  studyMethod?: string;
  about?: string;
  lastApplicationDate?: string;
  studyYear?: number;
  coreSubjects?: string[];
  programImages?: string[];
  bannerImage?: string;
  isActive: boolean;
}

export default function EditPartnerProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    degree: "",
    duration: "",
    language: "",
    tuition: "",
    tuitionNotes: "",
    department: "",
    startDate: "",
    classSchedule: "",
    studyMethod: "",
    about: "",
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
      fetchProgram();
    }
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Program>(`/partner/programs/${id}`);
      
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        degree: data.degree || "",
        duration: data.duration || "",
        language: data.language || "",
        tuition: data.tuition || "",
        tuitionNotes: data.tuitionNotes || "",
        department: data.department || "",
        startDate: data.startDate || "",
        classSchedule: data.classSchedule || "",
        studyMethod: data.studyMethod || "",
        about: data.about || "",
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
      const errorMsg = error.message || "Failed to load program";
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
      const imageUrl = result.url;

      if (type === "banner") {
        setFormData({ ...formData, bannerImage: imageUrl });
        setBannerPreview(URL.createObjectURL(file));
      } else if (type === "program") {
        setFormData({ ...formData, programImages: [...formData.programImages, imageUrl] });
        setProgramImagePreviews([...programImagePreviews, URL.createObjectURL(file)]);
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to upload image");
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
      showToast.error(error.message || "Failed to upload images");
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
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const bannerImage = formData.bannerImage?.trim() 
        ? getImageUrl(formData.bannerImage) || undefined 
        : undefined;
      const programImages = formData.programImages.length > 0 
        ? formData.programImages
            .filter(img => img?.trim())
            .map(img => getImageUrl(img))
            .filter(url => url)
        : undefined;

      await apiPut(`/partner/programs/${id}`, {
        ...formData,
        slug,
        degree: formData.degree || undefined,
        duration: formData.duration || undefined,
        language: formData.language || undefined,
        tuition: formData.tuition || undefined,
        tuitionNotes: formData.tuitionNotes || undefined,
        department: formData.department || undefined,
        startDate: formData.startDate || undefined,
        classSchedule: formData.classSchedule || undefined,
        studyMethod: formData.studyMethod || undefined,
        about: formData.about || undefined,
        lastApplicationDate: formData.lastApplicationDate || undefined,
        studyYear: formData.studyYear ? parseInt(formData.studyYear) : undefined,
        coreSubjects: formData.coreSubjects.length > 0 ? formData.coreSubjects : undefined,
        programImages,
        bannerImage,
      });

      showToast.success("Program updated successfully!");
      router.push("/dashboard/partner/programs");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to update program";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/partner/programs">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          Edit Program
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
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Program Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated from name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from name</p>
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Degree
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g., Bachelor's, Master's, PhD"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 4 years, 2 years, 5 years"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="e.g., English, German"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Engineering, Computer Science"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Start of Study
              </label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="e.g., 01/09"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Study Time
              </label>
              <select
                value={formData.classSchedule}
                onChange={(e) => setFormData({ ...formData, classSchedule: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">Select study time</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Study Method
              </label>
              <select
                value={formData.studyMethod}
                onChange={(e) => setFormData({ ...formData, studyMethod: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">Select study method</option>
                <option value="Undefined">Undefined</option>
                <option value="Online">Online</option>
                <option value="On-campus">On-campus</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Last Application Date
              </label>
              <input
                type="text"
                value={formData.lastApplicationDate}
                onChange={(e) => setFormData({ ...formData, lastApplicationDate: e.target.value })}
                placeholder="e.g., 01/06/2025"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Study Year
              </label>
              <input
                type="number"
                value={formData.studyYear}
                onChange={(e) => setFormData({ ...formData, studyYear: e.target.value })}
                placeholder="e.g., 2005"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Tuition
              </label>
              <input
                type="text"
                value={formData.tuition}
                onChange={(e) => setFormData({ ...formData, tuition: e.target.value })}
                placeholder="e.g., $56,000 per year"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                Tuition Notes
              </label>
              <textarea
                value={formData.tuitionNotes}
                onChange={(e) => setFormData({ ...formData, tuitionNotes: e.target.value })}
                rows={3}
                placeholder="Additional information about tuition fees"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
          </div>
        </div>

        {/* About the Program */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">About the Program</h2>
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Description
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              rows={5}
              placeholder="Describe the program in detail..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>
        </div>

        {/* Core Subjects */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">Core Subjects</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCoreSubject}
              onChange={(e) => setNewCoreSubject(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCoreSubject())}
              placeholder="Enter core subject"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
            <Button type="button" onClick={addCoreSubject} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add
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
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">Images</h2>
          
          {/* Banner Image */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Banner Image (Hero Image)
            </label>
            {bannerPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
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
                <span className="text-sm text-gray-500">Click to upload banner image</span>
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
              Program Images (Tour Gallery)
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
              <span className="text-sm text-gray-500">Click to upload or drag multiple images</span>
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
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">Status</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
            />
            <span className="font-montserrat-semibold text-sm">Active</span>
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/dashboard/partner/programs">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

