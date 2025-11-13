import { Router } from 'express';
import {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from './Grades.controller';

const router = Router();

router.get('/', getGrades);
router.get('/:id', getGradeById);
router.post('/', createGrade);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

export default router;