import { Request, Response } from 'express';
import { Grade } from './Grades.model';

let grades: Grade[] = [];

export const getGrades = (req: Request, res: Response) => {
  res.json(grades);
};

export const getGradeById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const grade = grades.find(g => g.id === id);
  if (grade) res.json(grade);
  else res.status(404).json({ message: 'Nota no encontrada' });
};

export const createGrade = (req: Request, res: Response) => {
  const { studentId, courseId, value } = req.body;
  const newGrade: Grade = {
    id: grades.length + 1,
    studentId,
    courseId,
    value,
  };
  grades.push(newGrade);
  res.status(201).json(newGrade);
};

export const updateGrade = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { studentId, courseId, value } = req.body;
  const grade = grades.find(g => g.id === id);
  if (grade) {
    grade.studentId = studentId;
    grade.courseId = courseId;
    grade.value = value;
    res.json(grade);
  } else {
    res.status(404).json({ message: 'Nota no encontrada' });
  }
};

export const deleteGrade = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  grades = grades.filter(g => g.id !== id);
  res.status(204).send();
};