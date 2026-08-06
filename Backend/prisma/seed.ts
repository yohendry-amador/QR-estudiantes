import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const professorPasswordHash = await bcrypt.hash('Prof123!', 12);
  const studentPasswordHash = await bcrypt.hash('Estu123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduportal.com' },
    update: {},
    create: { email: 'admin@eduportal.com', passwordHash: adminPasswordHash, role: Role.ADMIN },
  });
  console.log('Admin user created');

  const professorUser = await prisma.user.upsert({
    where: { email: 'jperez@eduportal.com' },
    update: {},
    create: { email: 'jperez@eduportal.com', passwordHash: professorPasswordHash, role: Role.PROFESSOR },
  });

  const professor = await prisma.professor.upsert({
    where: { userId: professorUser.id },
    update: {},
    create: { employeeCode: 'EMP-2024-001', firstName: 'Juan', lastName: 'Pérez', userId: professorUser.id },
  });
  console.log('Professor created');

  const studentUser1 = await prisma.user.upsert({
    where: { email: 'mrodriguez@eduportal.com' },
    update: {},
    create: { email: 'mrodriguez@eduportal.com', passwordHash: studentPasswordHash, role: Role.STUDENT },
  });

  const student1 = await prisma.student.upsert({
    where: { userId: studentUser1.id },
    update: {},
    create: { studentCode: '2021-0045', firstName: 'María', lastName: 'Rodríguez', userId: studentUser1.id },
  });

  const studentUser2 = await prisma.user.upsert({
    where: { email: 'acarlos@eduportal.com' },
    update: {},
    create: { email: 'acarlos@eduportal.com', passwordHash: studentPasswordHash, role: Role.STUDENT },
  });

  const student2 = await prisma.student.upsert({
    where: { userId: studentUser2.id },
    update: {},
    create: { studentCode: '2021-0112', firstName: 'Ana', lastName: 'Carlos', userId: studentUser2.id },
  });
  console.log('Students created');

  const course1 = await prisma.course.upsert({
    where: { code: 'MAT-101' },
    update: {},
    create: { code: 'MAT-101', name: 'Matemática Avanzada', description: 'Curso de matemáticas avanzadas', credits: 4 },
  });

  const course2 = await prisma.course.upsert({
    where: { code: 'FIS-101' },
    update: {},
    create: { code: 'FIS-101', name: 'Física II', description: 'Curso de física general', credits: 4 },
  });

  const course3 = await prisma.course.upsert({
    where: { code: 'INF-101' },
    update: {},
    create: { code: 'INF-101', name: 'Introducción a la Programación', description: 'Fundamentos de programación', credits: 3 },
  });
  console.log('Courses created');

  const section1 = await prisma.section.upsert({
    where: { courseId_code_semester_year: { courseId: course1.id, code: 'A', semester: 'Otoño', year: 2024 } },
    update: {},
    create: { code: 'A', courseId: course1.id, professorId: professor.id, schedule: 'Lun-Mié 08:00-09:30', room: 'Aula 402', semester: 'Otoño', year: 2024 },
  });

  const section2 = await prisma.section.upsert({
    where: { courseId_code_semester_year: { courseId: course2.id, code: 'A', semester: 'Otoño', year: 2024 } },
    update: {},
    create: { code: 'A', courseId: course2.id, professorId: professor.id, schedule: 'Mar-Jue 14:00-15:30', room: 'Laboratorio B', semester: 'Otoño', year: 2024 },
  });
  console.log('Sections created');

  await prisma.enrollment.upsert({
    where: { studentId_sectionId: { studentId: student1.id, sectionId: section1.id } },
    update: {},
    create: { studentId: student1.id, sectionId: section1.id, status: 'ACTIVE' },
  });

  await prisma.enrollment.upsert({
    where: { studentId_sectionId: { studentId: student2.id, sectionId: section1.id } },
    update: {},
    create: { studentId: student2.id, sectionId: section1.id, status: 'ACTIVE' },
  });
  console.log('Enrollments created');

  console.log('Database seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Admin: admin@eduportal.com / Admin123!');
  console.log('  Professor: jperez@eduportal.com / Prof123!');
  console.log('  Student: mrodriguez@eduportal.com / Estu123!');
}

main().catch((e) => {
  console.error('Error during seed:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});