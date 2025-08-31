export interface Duration {
  duration: number;
  cost: number;
}

export interface Availability {
  staffLetter: string;
  staffId: number;
  durations: Duration[];
}

export interface TimeSlot {
  time: string;
  availabilities: Availability[];
}

export interface Location {
  id: string;
  name: string;
  city: string;
}

export interface BookingParams {
  locationId: string;
  partySize: number;
  startDateTime: string;
  endDateTime: string;
}

export interface BookingFormData {
  location: Location;
  partySize: number;
  duration: number;
  date: Date;
  lateNightDeal: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
