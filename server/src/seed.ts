import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to calculate SHA-256 in Node
function calculateSHA256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Helper to generate simulated IPFS CIDs
function generateSimulatedCID(text: string) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let hashResult = 'bafybeic';
  let sum = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < 35; i++) {
    const idx = (sum + i * 17) % chars.length;
    hashResult += chars[idx];
  }
  return hashResult;
}

const defaultCerts = [
  {
    id: 'BC-2026-1001',
    studentName: 'Aarav Sharma',
    registerNumber: 'CS20220891',
    department: 'Computer Science & Engineering',
    courseName: 'Bachelor of Technology',
    grade: 'A+ (9.2 CGPA)',
    issueDate: '2026-05-15'
  },
  {
    id: 'BC-2026-1002',
    studentName: 'Ananya Iyer',
    registerNumber: 'CS20220412',
    department: 'Information Technology',
    courseName: 'Bachelor of Technology',
    grade: 'O (9.6 CGPA)',
    issueDate: '2026-05-15'
  },
  {
    id: 'BC-2026-1003',
    studentName: 'Rahul Verma',
    registerNumber: 'CS20220734',
    department: 'Software Engineering',
    courseName: 'Bachelor of Technology',
    grade: 'A (8.5 CGPA)',
    issueDate: '2026-05-20'
  }
];

async function main() {
  console.log('🌱 Database seeding initiated...');

  // 1. Create Default Users (Super Admin, Registrar, HOD Computer Science)
  const users = [
    {
      name: 'Super Administrator',
      email: 'superadmin@blockcert.edu',
      password: 'superadmin123',
      role: 'SUPER_ADMIN',
      department: null
    },
    {
      name: 'University Registrar',
      email: 'registrar@blockcert.edu',
      password: 'registrar123',
      role: 'REGISTRAR',
      department: null
    },
    {
      name: 'HOD Computer Science',
      email: 'hodcs@blockcert.edu',
      password: 'hodcs123',
      role: 'HOD',
      department: 'Computer Science & Engineering'
    }
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        department: u.department
      }
    });
    console.log(`👤 Seeded User: ${u.email} (${u.role})`);
  }

  // 2. Create Default Certificates
  const initialBlock = 18459200;
  for (let i = 0; i < defaultCerts.length; i++) {
    const cert = defaultCerts[i];
    const rawString = `${cert.id}|${cert.studentName}|${cert.registerNumber}|${cert.department}|${cert.grade}|${cert.issueDate}`;
    const hash = calculateSHA256(rawString);
    const ipfs = generateSimulatedCID(rawString);
    const tx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const gas = (35000 + Math.floor(Math.random() * 5000)).toString();
    const block = initialBlock + i * 4;

    await prisma.certificate.upsert({
      where: { id: cert.id },
      update: {},
      create: {
        id: cert.id,
        studentName: cert.studentName,
        registerNumber: cert.registerNumber,
        department: cert.department,
        courseName: cert.courseName,
        grade: cert.grade,
        issueDate: cert.issueDate,
        hash,
        ipfsCID: ipfs,
        txHash: tx,
        blockNumber: block,
        gasUsed: gas,
        status: 'Secured',
        signerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
      }
    });
    console.log(`🎓 Seeded Certificate: ${cert.id} for ${cert.studentName}`);
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
