"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { apiPost, apiUploadImage, apiUploadImages, apiGet } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import Image from "next/image";

interface Department {
  id: string;
  name: string;
}

interface Degree {
  id: string;
  name: string;
}

interface EducationalYear {
  id: string;
  name: string;
}

export default function AddPartnerProgramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [educationalYears, setEducationalYears] = useState<EducationalYear[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    degree: "",
    degreeId: "",
    duration: "",
    language: "",
    tuition: "",
    tuitionNotes: "",
    department: "",
    departmentId: "",
    educationalYearId: "",
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
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const [depts, degs, years] = await Promise.all([
        apiGet<Department[]>("/partner/departments").catch(() => []),
        apiGet<Degree[]>("/partner/degrees").catch(() => []),
        apiGet<EducationalYear[]>("/partner/educational-years").catch(() => []),
      ]);
      setDepartments(depts || []);
      setDegrees(degs || []);
      setEducationalYears(years || []);
    } catch (error) {
      showToast.error("Failed to load departments, degrees, or educational years");
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
    setLoading(true);

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

      await apiPost("/partner/programs", {
        ...formData,
        slug,
        degree: formData.degree || undefined,
        degreeId: formData.degreeId || undefined,
        duration: formData.duration || undefined,
        language: formData.language || undefined,
        tuition: formData.tuition || undefined,
        tuitionNotes: formData.tuitionNotes || undefined,
        department: formData.department || undefined,
        departmentId: formData.departmentId || undefined,
        educationalYearId: formData.educationalYearId || undefined,
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

      showToast.success("Program created successfully!");
      router.push("/dashboard/partner/programs");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to create program";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/partner/programs">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          Add New Program
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
              <select
                value={formData.degreeId}
                onChange={(e) => {
                  const selected = degrees.find(d => d.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    degreeId: e.target.value,
                    degree: selected?.name || ""
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">Select a degree</option>
                {degrees.map((deg) => (
                  <option key={deg.id} value={deg.id}>
                    {deg.name}
                  </option>
                ))}
              </select>
              {degrees.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <Link href="/dashboard/partner/degrees" className="text-[#5260ce] hover:underline">
                    Add degrees first
                  </Link>
                </p>
              )}
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
              <select
                value={formData.departmentId}
                onChange={(e) => {
                  const selected = departments.find(d => d.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    departmentId: e.target.value,
                    department: selected?.name || ""
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {departments.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <Link href="/dashboard/partner/departments" className="text-[#5260ce] hover:underline">
                    Add departments first
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Educational Year
              </label>
              <select
                value={formData.educationalYearId}
                onChange={(e) => setFormData({ ...formData, educationalYearId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">Select an educational year</option>
                {educationalYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
              {educationalYears.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <Link href="/dashboard/partner/educational-years" className="text-[#5260ce] hover:underline">
                    Add educational years first
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Department (Text - Legacy)
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
            disabled={loading}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
          >
            {loading ? "Creating..." : "Create Program"}
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

