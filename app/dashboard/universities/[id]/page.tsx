"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MapPin, Globe, Calendar, Users, Award, Building2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { apiGet } from "@/lib/api";
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
  programs?: Array<{
    id: string;
    name: string;
    slug: string;
    degree?: string;
    duration?: string;
  }>;
}

export default function UniversityDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState<University | null>(null);

  useEffect(() => {
    if (id) {
      fetchUniversity();
    }
  }, [id]);

  const fetchUniversity = async () => {
    try {
      setLoading(true);
      const data = await apiGet<University>(`/universities/${id}`);
      setUniversity(data);
    } catch (error: any) {
      showToast.error("Failed to load university details");
      router.push("/dashboard/universities");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">University not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">
            University Details
          </h1>
        </div>
        <Link href={`/dashboard/universities/${id}/edit`}>
          <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Banner Image */}
      {university.bannerUrl && (
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(university.bannerUrl)}
            alt={university.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              {university.logoUrl && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={getImageUrl(university.logoUrl)}
                    alt={university.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-montserrat-bold text-[#121c67] mb-2">
                  {university.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{university.city}, {university.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{university.language}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    university.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {university.isActive ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>{university.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            </div>

            {university.description && (
              <p className="text-gray-700 mb-4">{university.description}</p>
            )}

            {university.about && (
              <div className="mt-4">
                <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-2">
                  About
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{university.about}</p>
              </div>
            )}
          </div>

          {/* Admission Requirements */}
          {university.admissionRequirements && university.admissionRequirements.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
                Admission Requirements
              </h3>
              <ul className="space-y-2">
                {university.admissionRequirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {university.services && university.services.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
                Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {university.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Images */}
          {university.tourImages && university.tourImages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
                Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {university.tourImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(img)}
                      alt={`${university.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
              Statistics
            </h3>
            <div className="space-y-4">
              {university.establishmentYear && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Established</div>
                    <div className="font-semibold">{university.establishmentYear}</div>
                  </div>
                </div>
              )}
              {university.worldRanking && (
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">World Ranking</div>
                    <div className="font-semibold">#{university.worldRanking}</div>
                  </div>
                </div>
              )}
              {university.localRanking && (
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Local Ranking</div>
                    <div className="font-semibold">#{university.localRanking}</div>
                  </div>
                </div>
              )}
              {university.studentsNumber && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Students</div>
                    <div className="font-semibold">{university.studentsNumber}</div>
                  </div>
                </div>
              )}
              {university.programs && university.programs.length > 0 && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Programs</div>
                    <div className="font-semibold">{university.programs.length}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              {university.website && (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#5260ce] hover:text-[#4350b0] text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Official Website</span>
                </a>
              )}
              <Link
                href={`/universities/${university.slug}`}
                target="_blank"
                className="flex items-center gap-2 text-[#5260ce] hover:text-[#4350b0] text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Public Page</span>
              </Link>
            </div>
          </div>

          {/* Programs List */}
          {university.programs && university.programs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
                Programs ({university.programs.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {university.programs.map((program) => (
                  <Link
                    key={program.id}
                    href={`/dashboard/programs/${program.id}`}
                    className="block p-2 rounded hover:bg-gray-50 text-sm text-gray-700 hover:text-[#5260ce]"
                  >
                    <div className="font-medium">{program.name}</div>
                    {program.degree && (
                      <div className="text-xs text-gray-500">{program.degree}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

