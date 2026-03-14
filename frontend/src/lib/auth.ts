import jwt from 'jsonwebtoken';

export function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string);
    return user as { userId: string };
  } catch (err) {
    return null;
  }
}
