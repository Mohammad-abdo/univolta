import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function requireAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    console.error('Error in requireAuth:', error);
    return null;
  }
}

export function requireAdmin(request: NextRequest) {
  const user = requireAuth(request);
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}







