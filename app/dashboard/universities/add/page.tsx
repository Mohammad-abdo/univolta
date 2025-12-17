"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X } from "lucide-react";
import { apiPost, apiUploadImage, apiUploadImages } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import Link from "next/link";
import Image from "next/image";

export default function AddUniversityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleImageUpload = async (
    file: File,
    type: "logo" | "banner" | "tour"
  ) => {
    try {
      setUploading(type);
      const result = await apiUploadImage(file);
      // Store relative path, not full URL with /api/v1
      const imageUrl = result.url; // Already relative path like /uploads/filename.jpg

      if (type === "logo") {
        setFormData({ ...formData, logoUrl: imageUrl });
        setLogoPreview(URL.createObjectURL(file));
      } else if (type === "banner") {
        setFormData({ ...formData, bannerUrl: imageUrl });
        setBannerPreview(URL.createObjectURL(file));
      } else if (type === "tour") {
        setFormData({
          ...formData,
          tourImages: [...formData.tourImages, imageUrl],
        });
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
      // Store relative paths, not full URLs with /api/v1
      const urls = result.files.map((f) => f.url); // Already relative paths like /uploads/filename.jpg
      setFormData({
        ...formData,
        tourImages: [...formData.tourImages, ...urls],
      });
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
    const newTourImages = formData.tourImages.filter((_, i) => i !== index);
    const newPreviews = tourImagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, tourImages: newTourImages });
    setTourImagePreviews(newPreviews);
  };

  const addAdmissionRequirement = () => {
    if (newAdmissionReq.trim()) {
      setFormData({
        ...formData,
        admissionRequirements: [
          ...formData.admissionRequirements,
          newAdmissionReq.trim(),
        ],
      });
      setNewAdmissionReq("");
    }
  };

  const removeAdmissionRequirement = (index: number) => {
    setFormData({
      ...formData,
      admissionRequirements: formData.admissionRequirements.filter(
        (_, i) => i !== index
      ),
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
    setError("");
    setLoading(true);

    try {
      const slug =
        formData.slug ||
        formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      // Convert relative image paths to full URLs for backend validation
      // Backend expects full URLs, but we store relative paths in formData
      const logoUrl = formData.logoUrl?.trim()
        ? getImageUrl(formData.logoUrl) || undefined
        : undefined;
      const bannerUrl = formData.bannerUrl?.trim()
        ? getImageUrl(formData.bannerUrl) || undefined
        : undefined;
      const tourImages =
        formData.tourImages.length > 0
          ? formData.tourImages
              .filter((img) => img?.trim())
              .map((img) => getImageUrl(img))
              .filter((url) => url) // Remove any empty strings
          : undefined;

      await apiPost("/universities", {
        ...formData,
        slug,
        logoUrl,
        bannerUrl,
        establishmentYear: formData.establishmentYear
          ? parseInt(formData.establishmentYear)
          : undefined,
        worldRanking: formData.worldRanking
          ? parseInt(formData.worldRanking)
          : undefined,
        localRanking: formData.localRanking
          ? parseInt(formData.localRanking)
          : undefined,
        admissionRequirements:
          formData.admissionRequirements.length > 0
            ? formData.admissionRequirements
            : undefined,
        services: formData.services.length > 0 ? formData.services : undefined,
        tourImages,
      });

      showToast.success("University created successfully!");
      router.push("/dashboard/universities");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to create university";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/universities">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          Add New University
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              University Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="auto-generated from name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to auto-generate from name
            </p>
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Logo
            </label>
            <div className="space-y-2">
              {logoPreview && (
                <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5260ce] transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploading === "logo"
                      ? "Uploading..."
                      : "Click to upload logo"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading === "logo"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "logo");
                  }}
                />
              </label>
              {formData.logoUrl && (
                <input
                  type="text"
                  value={formData.logoUrl}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-sm"
                  placeholder="Logo URL"
                />
              )}
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Banner Image
            </label>
            <div className="space-y-2">
              {bannerPreview && (
                <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5260ce] transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploading === "banner"
                      ? "Uploading..."
                      : "Click to upload banner"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading === "banner"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "banner");
                  }}
                />
              </label>
              {formData.bannerUrl && (
                <input
                  type="text"
                  value={formData.bannerUrl}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-sm"
                  placeholder="Banner URL"
                />
              )}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Establishment Year
            </label>
            <input
              type="number"
              value={formData.establishmentYear}
              onChange={(e) =>
                setFormData({ ...formData, establishmentYear: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, worldRanking: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, localRanking: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Students Number
            </label>
            <input
              type="text"
              value={formData.studentsNumber}
              onChange={(e) =>
                setFormData({ ...formData, studentsNumber: e.target.value })
              }
              placeholder="e.g., 1154K"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          {/* Tour Images */}
          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Tour Images
            </label>
            <div className="space-y-4">
              {tourImagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-4">
                  {tourImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 border border-gray-300 rounded-lg overflow-hidden">
                        <Image
                          src={preview}
                          alt={`Tour ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTourImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5260ce] transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploading === "tour"
                      ? "Uploading..."
                      : "Click to upload tour images (multiple)"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading === "tour"}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0)
                      handleMultipleTourImages(files);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              About
            </label>
            <textarea
              value={formData.about}
              onChange={(e) =>
                setFormData({ ...formData, about: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          {/* Admission Requirements */}
          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Admission Requirements
            </label>
            <div className="space-y-2">
              {formData.admissionRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdmissionRequirement(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAdmissionReq}
                  onChange={(e) => setNewAdmissionReq(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addAdmissionRequirement())
                  }
                  placeholder="Add admission requirement"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                />
                <Button
                  type="button"
                  onClick={addAdmissionRequirement}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Services
            </label>
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={service}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addService())
                  }
                  placeholder="Add service"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                />
                <Button type="button" onClick={addService} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
              />
              <span className="font-montserrat-semibold text-sm">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={loading || uploading !== null}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
          >
            {loading ? "Creating..." : "Create University"}
          </Button>
          <Link href="/dashboard/universities">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
