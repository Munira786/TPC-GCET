import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@tpc.edu";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminHash,
      name: "Placement Officer",
    },
  });

  const studentPassword = await bcrypt.hash("Student@123", 10);

  const students = [
    {
      enrollmentNumber: "21CSE001",
      name: "Aarav Sharma",
      department: "CSE",
      year: 4,
      cgpa: 8.7,
      profileCompleted: true,
      email: "aarav.sharma@college.edu",
      phone: "9876543210",
      tenthPercent: 92,
      twelfthPercent: 88,
      backlogs: 0,
      skills: "JavaScript, React, Node.js",
      linkedin: "https://linkedin.com/in/aaravsharma",
      github: "https://github.com/aaravsharma",
    },
    {
      enrollmentNumber: "21IT014",
      name: "Priya Verma",
      department: "IT",
      year: 4,
      cgpa: 9.1,
      profileCompleted: true,
      email: "priya.verma@college.edu",
      phone: "9876543211",
      tenthPercent: 95,
      twelfthPercent: 91,
      backlogs: 0,
      skills: "Python, Django, SQL",
      linkedin: "https://linkedin.com/in/priyaverma",
      github: "https://github.com/priyaverma",
    },
    {
      enrollmentNumber: "21ECE022",
      name: "Rohan Gupta",
      department: "ECE",
      year: 4,
      cgpa: 7.4,
      profileCompleted: true,
      email: "rohan.gupta@college.edu",
      phone: "9876543212",
      tenthPercent: 85,
      twelfthPercent: 80,
      backlogs: 1,
      skills: "Embedded C, VLSI",
    },
    {
      enrollmentNumber: "22CSE045",
      name: "Ishita Rao",
      department: "CSE",
      year: 3,
      profileCompleted: false,
    },
  ];

  const createdStudents = [];
  for (const s of students) {
    const student = await prisma.student.upsert({
      where: { enrollmentNumber: s.enrollmentNumber },
      update: {},
      create: { ...s, password: studentPassword },
    });
    createdStudents.push(student);
  }

  const inTwoWeeks = new Date();
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
  const inFiveDays = new Date();
  inFiveDays.setDate(inFiveDays.getDate() + 5);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const companies = [
    {
      name: "TechNova Solutions",
      role: "Software Development Engineer",
      ctc: "12 LPA",
      location: "Bengaluru",
      description: "A fast-growing product company building developer tools.",
      jobDescription:
        "Work on core backend systems using Node.js and PostgreSQL. Strong DSA fundamentals expected. 2 rounds of technical interviews followed by an HR round.",
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedDepartments: JSON.stringify(["CSE", "IT", "AIDS", "AIML"]),
      eligibleYears: JSON.stringify([4]),
      deadline: inTwoWeeks,
      isActive: true,
    },
    {
      name: "Circuit Dynamics",
      role: "Electronics Design Engineer",
      ctc: "8 LPA",
      location: "Pune",
      description: "Designs embedded systems for industrial automation.",
      jobDescription:
        "Design and test analog/digital circuits. Familiarity with VLSI and embedded C required.",
      minCgpa: 6.5,
      maxBacklogs: 1,
      allowedDepartments: JSON.stringify(["ECE", "EEE"]),
      eligibleYears: JSON.stringify([4]),
      deadline: inFiveDays,
      isActive: true,
    },
    {
      name: "DataForge Analytics",
      role: "Data Analyst Intern",
      ctc: "6 LPA",
      location: "Hyderabad",
      description: "A data analytics consultancy serving fintech clients.",
      jobDescription:
        "Build dashboards and analyze large datasets using SQL and Python. Open to pre-final year students.",
      minCgpa: 7,
      maxBacklogs: 0,
      allowedDepartments: JSON.stringify(["CSE", "IT", "AIDS", "AIML", "ECE"]),
      eligibleYears: JSON.stringify([3, 4]),
      deadline: inTwoWeeks,
      isActive: true,
    },
    {
      name: "BuildRight Infra",
      role: "Site Engineer",
      ctc: "5.5 LPA",
      location: "Chennai",
      description: "Infrastructure and construction management firm.",
      jobDescription:
        "On-site project supervision and quality control. Closed for applications already.",
      minCgpa: 6,
      maxBacklogs: 2,
      allowedDepartments: JSON.stringify(["CIVIL"]),
      eligibleYears: JSON.stringify([4]),
      deadline: yesterday,
      isActive: true,
    },
  ];

  const createdCompanies = [];
  for (const c of companies) {
    const existing = await prisma.company.findFirst({ where: { name: c.name } });
    const company = existing
      ? existing
      : await prisma.company.create({ data: c });
    createdCompanies.push(company);
  }

  const aarav = createdStudents.find((s) => s.enrollmentNumber === "21CSE001")!;
  const priya = createdStudents.find((s) => s.enrollmentNumber === "21IT014")!;
  const technova = createdCompanies.find((c) => c.name === "TechNova Solutions")!;
  const dataforge = createdCompanies.find((c) => c.name === "DataForge Analytics")!;

  await prisma.application.upsert({
    where: { studentId_companyId: { studentId: aarav.id, companyId: technova.id } },
    update: {},
    create: { studentId: aarav.id, companyId: technova.id, status: "SHORTLISTED" },
  });

  await prisma.application.upsert({
    where: { studentId_companyId: { studentId: priya.id, companyId: technova.id } },
    update: {},
    create: { studentId: priya.id, companyId: technova.id, status: "APPLIED" },
  });

  await prisma.application.upsert({
    where: { studentId_companyId: { studentId: priya.id, companyId: dataforge.id } },
    update: {},
    create: { studentId: priya.id, companyId: dataforge.id, status: "SELECTED" },
  });

  console.log("Seed complete.");
  console.log(`Admin login -> ${adminEmail} / ${adminPassword}`);
  console.log("Student logins (password: Student@123):");
  for (const s of students) {
    console.log(`  ${s.enrollmentNumber} - ${s.name}${s.profileCompleted ? "" : " (profile incomplete)"}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
