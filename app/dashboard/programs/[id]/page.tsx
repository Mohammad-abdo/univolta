"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, BookOpen, Clock, DollarSign, Globe, GraduationCap, Building2, Calendar, CheckCircle, XCircle, ExternalLink, MapPin } from "lucide-react";
import { apiGet } from "@/lib/api";
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
  studyYear?: number;
  lastApplicationDate?: string;
  classSchedule?: string;
  studyMethod?: string;
  startDate?: string;
  coreSubjects?: string[];
  about?: string;
  department?: string;
  programImages?: string[];
  bannerImage?: string;
  isActive: boolean;
  university: {
    id: string;
    name: string;
    slug: string;
    country: string;
    city: string;
  };
}

export default function ProgramDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (id) {
      fetchProgram();
    }
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Program>(`/programs/${id}`);
      setProgram(data);
    } catch (error: any) {
      showToast.error("Failed to load program details");
      router.push("/dashboard/programs");
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

  if (!program) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Program not found</div>
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
            Program Details
          </h1>
        </div>
        <Link href={`/dashboard/programs/${id}/edit`}>
          <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Banner Image */}
      {program.bannerImage && (
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(program.bannerImage)}
            alt={program.name}
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
            <div className="mb-4">
              <h2 className="text-2xl font-montserrat-bold text-[#121c67] mb-2">
                {program.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <Link
                  href={`/dashboard/universities/${program.university.id}`}
                  className="flex items-center gap-1 text-[#5260ce] hover:text-[#4350b0]"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{program.university.name}</span>
                </Link>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{program.university.city}, {program.university.country}</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  program.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {program.isActive ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span>{program.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>

            {program.about && (
              <div className="mt-4">
                <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-2">
                  About
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{program.about}</p>
              </div>
            )}
          </div>

          {/* Program Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
              Program Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {program.degree && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Degree</div>
                    <div className="font-semibold">{program.degree}</div>
                  </div>
                </div>
              )}
              {program.duration && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-semibold">{program.duration}</div>
                  </div>
                </div>
              )}
              {program.language && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Language</div>
                    <div className="font-semibold">{program.language}</div>
                  </div>
                </div>
              )}
              {program.tuition && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Tuition</div>
                    <div className="font-semibold">{program.tuition}</div>
                  </div>
                </div>
              )}
              {program.department && (
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Department</div>
                    <div className="font-semibold">{program.department}</div>
                  </div>
                </div>
              )}
              {program.studyMethod && (
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Study Method</div>
                    <div className="font-semibold">{program.studyMethod}</div>
                  </div>
                </div>
              )}
              {program.classSchedule && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Class Schedule</div>
                    <div className="font-semibold">{program.classSchedule}</div>
                  </div>
                </div>
              )}
              {program.startDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Start Date</div>
                    <div className="font-semibold">{program.startDate}</div>
                  </div>
                </div>
              )}
              {program.lastApplicationDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Last Application Date</div>
                    <div className="font-semibold">{program.lastApplicationDate}</div>
                  </div>
                </div>
              )}
              {program.studyYear && (
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#5260ce]" />
                  <div>
                    <div className="text-sm text-gray-600">Study Year</div>
                    <div className="font-semibold">Year {program.studyYear}</div>
                  </div>
                </div>
              )}
            </div>
            {program.tuitionNotes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Tuition Notes</div>
                <div className="text-gray-700">{program.tuitionNotes}</div>
              </div>
            )}
          </div>

          {/* Core Subjects */}
          {program.coreSubjects && program.coreSubjects.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
                Core Subjects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {program.coreSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Program Images */}
          {program.programImages && program.programImages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
                Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {program.programImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(img)}
                      alt={`${program.name} - Image ${index + 1}`}
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
          {/* University Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
              University
            </h3>
            <Link
              href={`/dashboard/universities/${program.university.id}`}
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-[#121c67]">{program.university.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                {program.university.city}, {program.university.country}
              </div>
            </Link>
            <Link
              href={`/universities/${program.university.slug}`}
              target="_blank"
              className="mt-3 flex items-center gap-2 text-sm text-[#5260ce] hover:text-[#4350b0]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View University Page</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-montserrat-semibold text-[#121c67] mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                href={`/universities/${program.university.slug}/programs/${program.slug}`}
                target="_blank"
                className="flex items-center gap-2 text-[#5260ce] hover:text-[#4350b0] text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Public Page</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

