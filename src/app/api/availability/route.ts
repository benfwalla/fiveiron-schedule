import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.booking.fiveirongolf.com';

const DEFAULT_HEADERS = {
  'accept': 'application/json',
  'content-type': 'application/json',
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'origin': 'https://booking.fiveirongolf.com',
  'referer': 'https://booking.fiveirongolf.com/'
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const locationId = searchParams.get('locationId');
  const partySize = searchParams.get('partySize');
  const startDateTime = searchParams.get('startDateTime');
  const endDateTime = searchParams.get('endDateTime');

  if (!locationId || !partySize || !startDateTime || !endDateTime) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const url = new URL(`${API_BASE_URL}/appointments/available/simulator`);
  url.searchParams.append('locationId', locationId);
  url.searchParams.append('partySize', partySize);
  url.searchParams.append('startDateTime', startDateTime);
  url.searchParams.append('endDateTime', endDateTime);

  try {
    console.log('Fetching from Five Iron API:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    console.log('Five Iron API response status:', response.status);

    if (!response.ok) {
      console.error('Five Iron API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Five Iron API response data length:', Array.isArray(data) ? data.length : 'not array');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Five Iron API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
