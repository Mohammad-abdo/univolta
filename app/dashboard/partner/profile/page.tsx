"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X } from "lucide-react";
import { apiGet, apiPut, apiUploadImage, apiUploadImages } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { getImageUrl } from "@/lib/image-utils";
import Link from "next/link";
import Image from "next/image";

interface University {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  language: string;
  description?: string;
  about?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  establishmentYear?: number;
  worldRanking?: number;
  localRanking?: number;
  studentsNumber?: string;
  admissionRequirements?: string[];
  services?: string[];
  tourImages?: string[];
  isActive: boolean;
}

export default function UniversityProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    country: "",
    city: "",
    language: "",
    description: "",
    about: "",
    website: "",
    logoUrl: "",
    bannerUrl: "",
    establishmentYear: "",
    worldRanking: "",
    localRanking: "",
    studentsNumber: "",
    admissionRequirements: [] as string[],
    services: [] as string[],
    tourImages: [] as string[],
    isActive: true,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [tourImagePreviews, setTourImagePreviews] = useState<string[]>([]);
  const [newAdmissionReq, setNewAdmissionReq] = useState("");
  const [newService, setNewService] = useState("");
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchUniversity();
  }, []);

  const fetchUniversity = async () => {
    try {
      setLoading(true);
      // Get user's university info
      const userData = await apiGet("/auth/me") as any;
      if (!userData?.universityId) {
        showToast.error("No university associated with your account");
        setError("No university associated with your account");
        return;
      }

      setUniversityId(userData?.universityId);
      const university = await apiGet<University>(`/partner/university`);
      
      setFormData({
        name: university.name || "",
        slug: university.slug || "",
        country: university.country || "",
        city: university.city || "",
        language: university.language || "",
        description: university.description || "",
        about: university.about || "",
        website: university.website || "",
        logoUrl: university.logoUrl || "",
        bannerUrl: university.bannerUrl || "",
        establishmentYear: university.establishmentYear?.toString() || "",
        worldRanking: university.worldRanking?.toString() || "",
        localRanking: university.localRanking?.toString() || "",
        studentsNumber: university.studentsNumber || "",
        admissionRequirements: Array.isArray(university.admissionRequirements) 
          ? university.admissionRequirements 
          : [],
        services: Array.isArray(university.services) ? university.services : [],
        tourImages: Array.isArray(university.tourImages) ? university.tourImages : [],
        isActive: university.isActive !== undefined ? university.isActive : true,
      });

      if (university.logoUrl) {
        const logoUrl = getImageUrl(university.logoUrl);
        if (logoUrl) setLogoPreview(logoUrl);
      }
      if (university.bannerUrl) {
        const bannerUrl = getImageUrl(university.bannerUrl);
        if (bannerUrl) setBannerPreview(bannerUrl);
      }
      if (Array.isArray(university.tourImages) && university.tourImages.length > 0) {
        const tourUrls = university.tourImages
          .map((img: string) => getImageUrl(img))
          .filter((url: string) => url);
        if (tourUrls.length > 0) setTourImagePreviews(tourUrls);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to load university profile";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: "logo" | "banner" | "tour") => {
    try {
      setUploading(type);
      const result = await apiUploadImage(file);
      const imageUrl = result.url;

      if (type === "logo") {
        setFormData({ ...formData, logoUrl: imageUrl });
        setLogoPreview(URL.createObjectURL(file));
      } else if (type === "banner") {
        setFormData({ ...formData, bannerUrl: imageUrl });
        setBannerPreview(URL.createObjectURL(file));
      } else if (type === "tour") {
        setFormData({ ...formData, tourImages: [...formData.tourImages, imageUrl] });
        setTourImagePreviews([...tourImagePreviews, URL.createObjectURL(file)]);
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const handleMultipleTourImages = async (files: FileList) => {
    try {
      setUploading("tour");
      const fileArray = Array.from(files);
      const result = await apiUploadImages(fileArray);
      const urls = result.files.map((f) => f.url);
      setFormData({ ...formData, tourImages: [...formData.tourImages, ...urls] });
      fileArray.forEach((file) => {
        setTourImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      });
    } catch (error: any) {
      showToast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(null);
    }
  };

  const removeTourImage = (index: number) => {
    const newImages = formData.tourImages.filter((_, i) => i !== index);
    const newPreviews = tourImagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, tourImages: newImages });
    setTourImagePreviews(newPreviews);
  };

  const addAdmissionReq = () => {
    if (newAdmissionReq.trim()) {
      setFormData({
        ...formData,
        admissionRequirements: [...formData.admissionRequirements, newAdmissionReq.trim()],
      });
      setNewAdmissionReq("");
    }
  };

  const removeAdmissionReq = (index: number) => {
    setFormData({
      ...formData,
      admissionRequirements: formData.admissionRequirements.filter((_, i) => i !== index),
    });
  };

  const addService = () => {
    if (newService.trim()) {
      setFormData({
        ...formData,
        services: [...formData.services, newService.trim()],
      });
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityId) return;
    
    setError("");
    setSaving(true);

    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const logoUrl = formData.logoUrl?.trim() 
        ? getImageUrl(formData.logoUrl) || undefined 
        : undefined;
      const bannerUrl = formData.bannerUrl?.trim() 
        ? getImageUrl(formData.bannerUrl) || undefined 
        : undefined;
      const tourImages = formData.tourImages.length > 0 
        ? formData.tourImages
            .filter(img => img?.trim())
            .map(img => getImageUrl(img))
            .filter(url => url)
        : undefined;

      await apiPut(`/partner/university`, {
        ...formData,
        slug,
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined,
        worldRanking: formData.worldRanking ? parseInt(formData.worldRanking) : undefined,
        localRanking: formData.localRanking ? parseInt(formData.localRanking) : undefined,
        admissionRequirements: formData.admissionRequirements.length > 0 ? formData.admissionRequirements : undefined,
        services: formData.services.length > 0 ? formData.services : undefined,
        tourImages,
      });

      showToast.success("University profile updated successfully!");
      fetchUniversity(); // Refresh data
    } catch (error: any) {
      const errorMsg = error.message || "Failed to update university profile";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/partner">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          University Profile
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
            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                University Name *
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
                Country *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Language *
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Establishment Year
              </label>
              <input
                type="number"
                value={formData.establishmentYear}
                onChange={(e) => setFormData({ ...formData, establishmentYear: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                World Ranking
              </label>
              <input
                type="number"
                value={formData.worldRanking}
                onChange={(e) => setFormData({ ...formData, worldRanking: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Local Ranking
              </label>
              <input
                type="number"
                value={formData.localRanking}
                onChange={(e) => setFormData({ ...formData, localRanking: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Number of Students
              </label>
              <input
                type="text"
                value={formData.studentsNumber}
                onChange={(e) => setFormData({ ...formData, studentsNumber: e.target.value })}
                placeholder="e.g., 10,000+"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                About
              </label>
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">Images</h2>
          
          {/* Logo */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              University Logo
            </label>
            {logoPreview ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-contain p-2"
                  unoptimized
                  onError={(e) => {
                    console.error("Logo image failed to load:", logoPreview);
                    e.currentTarget.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, logoUrl: "" });
                    setLogoPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "logo")}
                  className="hidden"
                  disabled={uploading === "logo"}
                />
              </label>
            )}
          </div>

          {/* Banner */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Banner Image
            </label>
            {bannerPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    console.error("Banner image failed to load:", bannerPreview);
                    e.currentTarget.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, bannerUrl: "" });
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
                <span className="text-sm text-gray-500">Click to upload banner</span>
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

          {/* Tour Images */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Tour Images (Gallery)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {tourImagePreviews.map((preview, index) => (
                <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                  <Image
                    src={preview}
                    alt={`Tour image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      console.error("Tour image failed to load:", preview);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeTourImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload tour images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleMultipleTourImages(e.target.files)}
                className="hidden"
                disabled={uploading === "tour"}
              />
            </label>
          </div>
        </div>

        {/* Admission Requirements */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">Admission Requirements</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAdmissionReq}
              onChange={(e) => setNewAdmissionReq(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAdmissionReq())}
              placeholder="Enter requirement"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
            <Button type="button" onClick={addAdmissionReq} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.admissionRequirements.map((req, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {req}
                <button
                  type="button"
                  onClick={() => removeAdmissionReq(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">Services</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              placeholder="Enter service"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
            <Button type="button" onClick={addService} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.services.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/dashboard/partner">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

