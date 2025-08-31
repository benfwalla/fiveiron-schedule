'use client';

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock, Calendar, Flag } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeSlot, Duration } from '@/types/booking';

interface BookingCardsProps {
  timeSlots: TimeSlot[];
  selectedDuration: number;
  isLoading?: boolean;
}

interface ProcessedSlot {
  time: string;
  formattedTime: string;
  date: string;
  availableSlots: {
    duration: number;
    cost: number;
    count: number;
  }[];
}

export function BookingCards({ timeSlots, selectedDuration, isLoading }: BookingCardsProps) {
  const processedSlots = useMemo(() => {
    const slots: ProcessedSlot[] = [];
    
    
    timeSlots.forEach((slot) => {
      // The API returns times in Eastern Time but marked as UTC (Z)
      // We'll treat them as local time since they're already in ET
      const timeString = slot.time.endsWith('Z') ? slot.time.slice(0, -1) : slot.time;
      const dateTime = new Date(timeString);
      
      // Format dates and times in Eastern Time
      const date = format(dateTime, 'yyyy-MM-dd');
      const formattedTime = format(dateTime, 'h:mm a');
      
      // Group availabilities by duration and cost
      const durationMap = new Map<string, { duration: number; cost: number; count: number }>();
      
      slot.availabilities.forEach((availability) => {
        availability.durations.forEach((duration) => {
          const key = `${duration.duration}-${duration.cost}`;
          const existing = durationMap.get(key);
          
          if (existing) {
            existing.count += 1;
          } else {
            durationMap.set(key, {
              duration: duration.duration,
              cost: duration.cost,
              count: 1
            });
          }
        });
      });
      
      const availableSlots = Array.from(durationMap.values())
        .sort((a, b) => a.duration - b.duration);
      
      // Only add slots that have availability
      if (availableSlots.length > 0) {
        slots.push({
          time: format(dateTime, 'HH:mm'),
          formattedTime,
          date,
          availableSlots
        });
      }
    });
    
    // Group by date
    const groupedByDate = slots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {} as Record<string, ProcessedSlot[]>);
    
    return groupedByDate;
  }, [timeSlots]);

  const getSlotForDuration = (slot: ProcessedSlot, duration: number) => {
    return slot.availableSlots.find(s => s.duration === duration);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No availability found</h3>
        <p className="text-muted-foreground">
          Try selecting a different date or adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {Object.entries(processedSlots).map(([date, slots]) => (
        <div key={date} className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold sticky top-0 bg-background py-2 border-b px-1">
            {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d')}
          </h3>
          
          
          {(() => {
            const filteredSlots = slots.filter(slot => {
              const matchingSlot = getSlotForDuration(slot, selectedDuration);
              return matchingSlot && matchingSlot.count > 0;
            });

            if (filteredSlots.length === 0) {
              return (
                <div className="px-1 py-4 text-left text-sm text-muted-foreground">
                  No availabilities
                </div>
              );
            }

            return (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 px-1">
                {filteredSlots.map((slot) => {
                  const matchingSlot = getSlotForDuration(slot, selectedDuration);
                  return (
                    <Card 
                      key={`${date}-${slot.time}`} 
                      className={`transition-all hover:shadow-md active:scale-95 cursor-pointer touch-manipulation ${
                        parseInt(slot.time.split(':')[0]) >= 21
                          ? 'border-blue-300 bg-blue-100/50'
                          : 'border-input bg-background hover:bg-accent'
                      }`}
                    >
                      <CardContent className="p-3 sm:p-2">
                        <div className="space-y-2 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm md:text-base font-medium leading-tight">{slot.formattedTime}</span>
                          </div>
                          <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                                                                                <div className={`font-medium ${parseInt(slot.time.split(':')[0]) >= 21 ? 'text-blue-800' : 'text-foreground'}`}>${matchingSlot?.cost && (matchingSlot.cost % 1 !== 0 ? matchingSlot.cost.toFixed(2) : matchingSlot.cost)}</div>
                            <div className="flex items-center justify-center sm:justify-start gap-1">
                              <Flag className="h-2 w-2 flex-shrink-0" />
                              <span className="leading-tight">
                                {matchingSlot?.count} bay{matchingSlot?.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
