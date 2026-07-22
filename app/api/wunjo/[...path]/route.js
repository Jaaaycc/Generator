import { NextResponse } from 'next/server';

const WUNJO_API = process.env.WUNJO_API_URL || 'http://localhost:48000';
const WUNJO_SESSION = process.env.WUNJO_SESSION || '';

export async function GET(request, { params }) {
  const { path } = await params;
  const pathStr = path.join('/');
  const url = `${WUNJO_API}/${pathStr}${request.nextUrl.search}`;
  
  const res = await fetch(url, {
    headers: {
      'Cookie': WUNJO_SESSION,
    },
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    return NextResponse.json(
      { error: 'Wunjo CE returned HTML (check your session cookie)', status: res.status },
      { status: 401 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request, { params }) {
  const { path } = await params;
  const pathStr = path.join('/');
  const url = `${WUNJO_API}/${pathStr}`;
  const body = await request.json();
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': WUNJO_SESSION,
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    return NextResponse.json(
      { error: 'Wunjo CE returned HTML (check your session cookie)', status: res.status },
      { status: 401 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
