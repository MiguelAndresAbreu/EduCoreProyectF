export interface Attendance {
  id: number;
  studentId: number;
  date: string;
  status: 'present' | 'absent';
}