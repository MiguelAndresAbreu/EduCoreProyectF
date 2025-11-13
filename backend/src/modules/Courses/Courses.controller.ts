import { Request, Response } from 'express';
import { Course } from './Courses.model';

let courses: Course[] = [];

export const getCourses = (req: Request, res: Response) => {
  res.json(courses);
};

export const getCourseById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const course = courses.find(c => c.id === id);
  if (course) res.json(course);
  else res.status(404).json({ message: 'Curso no encontrado' });
};

export const createCourse = (req: Request, res: Response) => {
  const { name, description } = req.body;
  const newCourse: Course = {
    id: courses.length + 1,
    name,
    description,
  };
  courses.push(newCourse);
  res.status(201).json(newCourse);
};

export const updateCourse = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  const course = courses.find(c => c.id === id);
  if (course) {
    course.name = name;
    course.description = description;
    res.json(course);
  } else {
    res.status(404).json({ message: 'Curso no encontrado' });
  }
};

export const deleteCourse = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  courses = courses.filter(c => c.id !== id);
  res.status(204).send();
};