'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Clock, Users, Calendar as CalendarIcon } from 'lucide-react';

import { BookingForm } from '@/components/booking-form';
import { BookingCards } from '@/components/booking-cards';
import { FiveIronAPI } from '@/lib/api';
import { BookingFormData, TimeSlot } from '@/types/booking';

export default function Home() {
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async (data: BookingFormData) => {
    setIsLoading(true);
    setError(null);
    setTimeSlots([]); // Clear existing data immediately
    
    try {
      let slots: TimeSlot[];
      
      if (data.dateRange) {
        // Fetch each day in parallel for better performance
        const startDate = data.dateRange.start;
        const endDate = data.dateRange.end;
        const dates: Date[] = [];
        
        // Generate array of dates
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d));
        }
        
        // Fetch all dates in parallel
        const promises = dates.map(date => 
          FiveIronAPI.getAvailabilityForSingleDay(
            data.location.id,
            data.partySize,
            date
          )
        );
        
        const results = await Promise.all(promises);
        slots = results.flat(); // Combine all results
      } else {
        // Fetch for single day
        slots = await FiveIronAPI.getAvailabilityForSingleDay(
          data.location.id,
          data.partySize,
          data.date
        );
      }
      
      setTimeSlots(slots);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to fetch availability. Please try again.');
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (data: BookingFormData) => {
    setFormData(data);
  };

  const filteredTimeSlots = useMemo(() => {
    if (!formData?.lateNightDeal) {
      return timeSlots;
    }
    return timeSlots.filter(slot => {
      const timeString = slot.time;
      const timePart = timeString.split('T')[1];
      const hour = parseInt(timePart.split(':')[0]);
      return hour >= 21;
    });
  }, [timeSlots, formData?.lateNightDeal]);

  // Fetch availability when form data changes
  useEffect(() => {
    if (formData && (formData.dateRange || formData.date)) {
      const timeoutId = setTimeout(() => {
        fetchAvailability(formData);
      }, 100); // Debounce API calls

      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Five Iron Schedule</h1>
          <p className="text-muted-foreground mt-2">
            It's way easier to find availabilities this way.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingForm onFormChange={handleFormChange} />
            </div>
          </div>

          {/* Right Side - Booking Cards */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Available Time Slots</h2>
                {formData && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{formData.partySize}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formData.duration}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {formData.dateRange
                          ? `${format(formData.dateRange.start, 'M/d')} - ${format(formData.dateRange.end, 'M/d')}`
                          : format(formData.date, 'M/d')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="min-h-[400px]">
                {formData && (formData.dateRange || formData.date) ? (
                  <BookingCards 
                    timeSlots={filteredTimeSlots}
                    selectedDuration={formData.duration}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a date option to view availability
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
