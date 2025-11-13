import { Request, Response } from 'express';
import { Student } from './students.model';

let students: Student[] = [];

export const getStudents = (req: Request, res: Response) => {
  res.json(students);
};

export const getStudentById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);
  if (student) res.json(student);
  else res.status(404).json({ message: 'Estudiante no encontrado' });
};

export const createStudent = (req: Request, res: Response) => {
  const { name, email } = req.body;
  const newStudent: Student = {
    id: students.length + 1,
    name,
    email,
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
};

export const updateStudent = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;
  const student = students.find(s => s.id === id);
  if (student) {
    student.name = name;
    student.email = email;
    res.json(student);
  } else {
    res.status(404).json({ message: 'Estudiante no encontrado' });
  }
};

export const deleteStudent = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  students = students.filter(s => s.id !== id);
  res.status(204).send();
};