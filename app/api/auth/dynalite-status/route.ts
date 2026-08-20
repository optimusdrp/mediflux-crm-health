import { NextRequest, NextResponse } from 'next/server';
import { getDynaliteStatus, listDynaliteUsers } from '@/lib/db/dynalite';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const status = await getDynaliteStatus();
    const users = await listDynaliteUsers();

    // Map users without sensitive password hashes
    const sanitizedUsers = users.map((u) => ({
      email: u.email,
      name: u.name,
      role: u.role,
      clinicId: u.clinicId,
      specialty: u.specialty,
      active: u.active,
      registeredAt: u.registeredAt,
      lastLoginAt: u.lastLoginAt,
      authSource: u.authSource,
    }));

    return NextResponse.json({
      status,
      totalRegisteredUsers: sanitizedUsers.length,
      users: sanitizedUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Erro ao consultar status do Dynalite: ' + err.message },
      { status: 500 }
    );
  }
}
