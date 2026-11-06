import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "resumes");

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function resumePathForStudent(studentId: string) {
  return path.join(UPLOAD_ROOT, `${studentId}.pdf`);
}

export async function saveResume(studentId: string, buffer: Buffer) {
  await mkdir(UPLOAD_ROOT, { recursive: true });
  const filePath = resumePathForStudent(studentId);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function deleteResume(studentId: string) {
  try {
    await unlink(resumePathForStudent(studentId));
  } catch {
    // file may not exist, ignore
  }
}
