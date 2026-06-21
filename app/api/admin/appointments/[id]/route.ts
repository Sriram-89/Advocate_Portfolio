import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

// PATCH /api/admin/appointments/[id] — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { status, notes } = await req.json();

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection('appointments').doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    const update: Record<string, string> = { updatedAt: new Date().toISOString() };
    if (status) update.status = status;
    if (typeof notes === 'string') update.adminNotes = notes;

    await ref.update(update);
    return NextResponse.json({ success: true, id: params.id, ...update });
  } catch (err) {
    console.error('[admin/appointments PATCH]', err);
    return NextResponse.json({ error: 'Failed to update appointment.' }, { status: 500 });
  }
}

// DELETE /api/admin/appointments/[id] — permanently remove
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection('appointments').doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ success: true, id: params.id });
  } catch (err) {
    console.error('[admin/appointments DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete appointment.' }, { status: 500 });
  }
}
