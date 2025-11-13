import { Request, Response } from 'express';
import { Payment } from './Payments.model';

let payments: Payment[] = [];

export const getPayments = (req: Request, res: Response) => {
  res.json(payments);
};

export const getPaymentById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const payment = payments.find(p => p.id === id);
  if (payment) res.json(payment);
  else res.status(404).json({ message: 'Pago no encontrado' });
};

export const createPayment = (req: Request, res: Response) => {
  const { studentId, amount, date } = req.body;
  const newPayment: Payment = {
    id: payments.length + 1,
    studentId,
    amount,
    date,
  };
  payments.push(newPayment);
  res.status(201).json(newPayment);
};

export const updatePayment = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { studentId, amount, date } = req.body;
  const payment = payments.find(p => p.id === id);
  if (payment) {
    payment.studentId = studentId;
    payment.amount = amount;
    payment.date = date;
    res.json(payment);
  } else {
    res.status(404).json({ message: 'Pago no encontrado' });
  }
};

export const deletePayment = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  payments = payments.filter(p => p.id !== id);
  res.status(204).send();
};