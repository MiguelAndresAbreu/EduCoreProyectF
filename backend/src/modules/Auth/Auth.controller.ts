import { Request, Response } from 'express';

const users = [
  { id: 1, username: 'admin', password: 'admin123' },
];

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ message: 'Login exitoso', userId: user.id });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
};