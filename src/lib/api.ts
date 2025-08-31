import { BookingParams, TimeSlot } from '@/types/booking';
import { format } from 'date-fns';

export class FiveIronAPI {
  static async getAvailability(params: BookingParams): Promise<TimeSlot[]> {
    const url = new URL('/api/availability', window.location.origin);
    
    url.searchParams.append('locationId', params.locationId);
    url.searchParams.append('partySize', params.partySize.toString());
    url.searchParams.append('startDateTime', params.startDateTime);
    url.searchParams.append('endDateTime', params.endDateTime);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: TimeSlot[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  }

  static async getAvailabilityForDateRange(
    locationId: string,
    partySize: number,
    startDate: Date,
    endDate: Date
  ): Promise<TimeSlot[]> {
    const params: BookingParams = {
      locationId,
      partySize,
      startDateTime: format(startDate, 'yyyy-MM-dd'),
      endDateTime: format(endDate, 'yyyy-MM-dd'),
    };

    return this.getAvailability(params);
  }

  static async getAvailabilityForSingleDay(
    locationId: string,
    partySize: number,
    date: Date
  ): Promise<TimeSlot[]> {
    return this.getAvailabilityForDateRange(locationId, partySize, date, date);
  }
}
