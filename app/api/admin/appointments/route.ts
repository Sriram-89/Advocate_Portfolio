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

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // pending | confirmed | cancelled | all

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection('appointments')
      .orderBy('createdAt', 'desc')
      .limit(200);

    if (statusFilter && statusFilter !== 'all') {
      query = db.collection('appointments')
        .where('status', '==', statusFilter)
        .limit(200);
    }

    const snapshot = await query.get();
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ appointments });
  } catch (err) {
    console.error('[admin/appointments GET]', err);
    return NextResponse.json(
      { error: 'Failed to fetch appointments.' },
      { status: 500 }
    );
  }
}
