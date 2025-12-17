export type ProgramData = {
  id: string;
  name: string;
  university: string;
  degree: string;
  duration: string;
  language: string;
  tuition: string;
  tuitionDetail?: string;
  image: string;
  startDate: string;
  studyTime: string;
  studyMethod: string;
  about: string;
  coreSubjects: string[];
  admissionRequirements: string[];
  services: string[];
  tourImages: string[];
};

export const programDataMap: Record<string, ProgramData> = {
  "electronic-communications-engineering": {
    id: "electronic-communications-engineering",
    name: "Electronic and Communications Engineering",
    university: "Stanford University",
    degree: "Bachelor",
    duration: "5 Years",
    language: "English",
    tuition: "$56,000",
    tuitionDetail: "~$56,000 per year",
    image: "https://www.figma.com/api/mcp/asset/4526099d-8632-426a-a631-7050b3c966ed",
    startDate: "01/09 Last date for application",
    studyTime: "Morning",
    studyMethod: "On Campus",
    about:
      "Electronic and Communications Engineering focuses on the design, development, and optimization of electronic systems and communication networks. This program equips students with knowledge in digital electronics, wireless systems, signal processing, and embedded technologies — enabling them to drive innovation in a fast-paced tech-driven world.",
    coreSubjects: [
      "Digital & Analog Circuits",
      "Wireless Communication Systems",
      "Signal Processing",
      "Embedded Systems",
      "Antennas and Wave Propagation",
      "Signal Processing Techniques",
      "Wireless Communication Systems",
    ],
    admissionRequirements: [
      "Strong background in math and physics",
      "High school certificate or undergraduate degree",
      "English proficiency test (TOEFL or IELTS)",
      "SAT/ACT or GRE (depending on program level)",
      "Academic transcripts",
      "Motivation letter / Statement of purpose",
    ],
    services: [
      "✅ Application support",
      "✅ Document review",
      "✅ Guidance through the admission process",
      "✅ Optional services: airport pickup, housing assistance",
    ],
    tourImages: [
      "https://www.figma.com/api/mcp/asset/4baae869-5aee-4adc-bd3f-d27de43829e8",
      "https://www.figma.com/api/mcp/asset/a6a72f65-1398-4ba1-a483-0f09a6889855",
      "https://www.figma.com/api/mcp/asset/b85747d5-1a9f-462d-8035-76b02f327ed7",
      "https://www.figma.com/api/mcp/asset/820d852e-1417-46b5-a61b-8d22cd068aab",
      "https://www.figma.com/api/mcp/asset/0d531175-0adc-4c5d-b02c-7a6533296c29",
    ],
  },
  "computer-science-ai": {
    id: "computer-science-ai",
    name: "Computer Science and Artificial Intelligence",
    university: "Stanford University",
    degree: "Bachelor",
    duration: "4 Years",
    language: "English",
    tuition: "$60,000 per year",
    image: "https://www.figma.com/api/mcp/asset/76019b0e-9f25-4d6d-ac86-45f799118d13",
    startDate: "Fall 2025",
    studyTime: "Full Time",
    studyMethod: "On Campus",
    about:
      "Explore advanced computing topics, machine learning, and AI engineering while building products with real-world impact through Stanford’s interdisciplinary ecosystem.",
    coreSubjects: [
      "Algorithms & Data Structures",
      "Machine Learning",
      "Distributed Systems",
      "Human-Computer Interaction",
      "Product Engineering",
      "Ethical AI",
    ],
    admissionRequirements: [
      "Strong programming background",
      "Mathematics proficiency (Calculus, Linear Algebra)",
      "Academic transcripts",
      "Personal projects or portfolio",
      "Statement of purpose",
    ],
    services: [
      "Startup incubator access",
      "Research assistant opportunities",
      "Career placement support",
      "Alumni mentorship network",
    ],
    tourImages: [
      "https://www.figma.com/api/mcp/asset/b85747d5-1a9f-462d-8035-76b02f327ed7",
      "https://www.figma.com/api/mcp/asset/4baae869-5aee-4adc-bd3f-d27de43829e8",
      "https://www.figma.com/api/mcp/asset/0d531175-0adc-4c5d-b02c-7a6533296c29",
    ],
  },
  "international-business-management": {
    id: "international-business-management",
    name: "International Business Management",
    university: "Sorbonne University",
    degree: "Master",
    duration: "2 Years",
    language: "English",
    tuition: "€14,500 per year",
    image: "https://www.figma.com/api/mcp/asset/76019b0e-9f25-4d6d-ac86-45f799118d13",
    startDate: "September 2025",
    studyTime: "Full Time",
    studyMethod: "On Campus",
    about:
      "Gain a strategic perspective on global markets, finance, and leadership with immersive experiences across Europe and direct access to Paris-based multinational partners.",
    coreSubjects: [
      "Global Strategy",
      "Corporate Finance",
      "Cross-cultural Management",
      "Business Analytics",
      "Sustainable Operations",
      "International Marketing",
    ],
    admissionRequirements: [
      "Bachelor’s degree or equivalent",
      "Two recommendation letters",
      "Professional CV",
      "English proficiency proof (IELTS/TOEFL)",
      "Motivation letter",
    ],
    services: [
      "International exchange opportunities",
      "Corporate internship placements",
      "Language immersion courses",
      "Career coaching sessions",
    ],
    tourImages: [
      "https://www.figma.com/api/mcp/asset/820d852e-1417-46b5-a61b-8d22cd068aab",
      "https://www.figma.com/api/mcp/asset/0d531175-0adc-4c5d-b02c-7a6533296c29",
      "https://www.figma.com/api/mcp/asset/a6a72f65-1398-4ba1-a483-0f09a6889855",
    ],
  },
  "applied-data-science": {
    id: "applied-data-science",
    name: "Applied Data Science",
    university: "Sorbonne University",
    degree: "Master",
    duration: "2 Years",
    language: "English",
    tuition: "€13,200 per year",
    image: "https://www.figma.com/api/mcp/asset/4526099d-8632-426a-a631-7050b3c966ed",
    startDate: "September 2025",
    studyTime: "Full Time",
    studyMethod: "Hybrid",
    about:
      "Master advanced analytics, machine learning, and AI-driven innovation with a focus on ethical and sustainable technology for data-centric industries.",
    coreSubjects: [
      "Statistical Learning",
      "Machine Learning",
      "Data Ethics & Governance",
      "Cloud Computing",
      "Data Visualization",
      "Big Data Engineering",
    ],
    admissionRequirements: [
      "Bachelor’s degree in STEM discipline",
      "Programming proficiency (Python or R)",
      "Academic transcripts",
      "Statement of purpose",
      "Two academic or professional references",
    ],
    services: [
      "Industry mentorship",
      "Research lab participation",
      "Career networking events",
      "Internship placement guidance",
    ],
    tourImages: [
      "https://www.figma.com/api/mcp/asset/4baae869-5aee-4adc-bd3f-d27de43829e8",
      "https://www.figma.com/api/mcp/asset/b85747d5-1a9f-462d-8035-76b02f327ed7",
      "https://www.figma.com/api/mcp/asset/a6a72f65-1398-4ba1-a483-0f09a6889855",
    ],
  },
};

export const programList = Object.values(programDataMap).map(
  ({ id, name, degree, duration, language, tuition, image }) => ({
    id,
    name,
    degree,
    duration,
    language,
    tuition,
    image,
  })
);

