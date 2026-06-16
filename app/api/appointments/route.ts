import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, date, time, caseType } = body;

    // Validate required fields
    if (!name || !phone || !date || !time || !caseType) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }

    // Basic phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 });
    }

    const db = getAdminDb();

    const appointment = {
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      preferredDate: date,
      preferredTime: time,
      caseType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('appointments').add(appointment);

    return NextResponse.json({
      success: true,
      appointmentId: docRef.id,
      message: 'Your appointment request has been received. We will contact you within 24 hours to confirm.',
    });
  } catch (err) {
  console.error('Appointment booking error FULL:', err);

  return NextResponse.json(
    {
      error: String(err),
    },
    { status: 500 }
  );
}
}
