import { Request, Response } from 'express';
import { Attendance } from './Attendance.model';

let attendances: Attendance[] = [];

export const getAttendances = (req: Request, res: Response) => {
  res.json(attendances);
};

export const getAttendanceById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const attendance = attendances.find(a => a.id === id);
  if (attendance) res.json(attendance);
  else res.status(404).json({ message: 'Asistencia no encontrada' });
};

export const createAttendance = (req: Request, res: Response) => {
  const { studentId, date, status } = req.body;
  const newAttendance: Attendance = {
    id: attendances.length + 1,
    studentId,
    date,
    status,
  };
  attendances.push(newAttendance);
  res.status(201).json(newAttendance);
};

export const updateAttendance = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { studentId, date, status } = req.body;
  const attendance = attendances.find(a => a.id === id);
  if (attendance) {
    attendance.studentId = studentId;
    attendance.date = date;
    attendance.status = status;
    res.json(attendance);
  } else {
    res.status(404).json({ message: 'Asistencia no encontrada' });
  }
};

export const deleteAttendance = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  attendances = attendances.filter(a => a.id !== id);
  res.status(204).send();
};