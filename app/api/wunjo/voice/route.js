// app/api/wunjo/face/route.js
import { NextResponse } from 'next/server';

const WUNJO_API = process.env.WUNJO_API_URL || 'http://localhost:48000';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const response = await fetch(`${WUNJO_API}/api/face/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}