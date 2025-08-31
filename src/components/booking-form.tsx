'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, Users, Moon } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

import { FIVE_IRON_LOCATIONS, getDefaultLocation } from '@/lib/locations';
import { BookingFormData, Location } from '@/types/booking';

interface BookingFormProps {
  onFormChange: (data: BookingFormData) => void;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const PARTY_SIZE_OPTIONS = [1, 2, 3, 4, 5, 6];

export function BookingForm({ onFormChange }: BookingFormProps) {
  const tomorrow = addDays(new Date(), 1);
  
  const [formData, setFormData] = useState<BookingFormData>({
    location: getDefaultLocation(),
    partySize: 2,
    duration: 60,
    date: tomorrow,
    lateNightDeal: true,
  });

  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<'today' | 'next-7-days' | 'next-14-days'>('next-7-days');

  // Set default date range on component mount
  useEffect(() => {
    handleQuickDateSelect('next-7-days');
  }, []);

  const updateFormData = (updates: Partial<BookingFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onFormChange(newData);
  };

  const handleLateNightToggle = (checked: boolean) => {
    updateFormData({ lateNightDeal: checked });
  };

  const handleQuickDateSelect = (type: 'today' | 'next-7-days' | 'next-14-days') => {
    const today = new Date();
    setSelectedDateType(type);
    setHasSelectedDate(true);
    
    switch (type) {
      case 'today':
        updateFormData({ date: today, dateRange: undefined });
        break;
      case 'next-7-days':
        const next7Days = addDays(today, 6); // Today + next 6 days = 7 days total
        updateFormData({ 
          date: today,
          dateRange: { start: today, end: next7Days }
        });
        break;
      case 'next-14-days':
        const next14Days = addDays(today, 13); // Today + next 13 days = 14 days total
        updateFormData({ 
          date: today,
          dateRange: { start: today, end: next14Days }
        });
        break;
    }
  };

  return (
    <Card className="w-full max-w-none sm:max-w-sm">
      <CardHeader className="pb-3 px-4 sm:px-6">
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Location Selection */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
          <Select
            value={formData.location.id}
            onValueChange={(value) => {
              const location = FIVE_IRON_LOCATIONS.find(loc => loc.id === value);
              if (location) updateFormData({ location });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {FIVE_IRON_LOCATIONS.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <span className="block sm:hidden">{location.name}</span>
                  <span className="hidden sm:block">{location.name} - {location.city}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Late Night Deal */}
        <div className="flex items-center justify-between space-x-3 rounded-lg border p-3 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <Moon className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <Label htmlFor="late-night-deal" className="font-medium text-sm leading-tight">$25/hr Late-Night</Label>
              <p className="text-xs text-muted-foreground mt-0.5">9pm to close</p>
            </div>
          </div>
          <Switch 
            id="late-night-deal" 
            checked={formData.lateNightDeal} 
            onCheckedChange={handleLateNightToggle}
            className="flex-shrink-0"
          />
        </div>

        {/* Party Size and Duration - Side by side on mobile */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4 sm:space-y-0">
          {/* Party Size */}
          <div className="space-y-2">
            <Label htmlFor="party-size" className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Party Size</span>
              <span className="sm:hidden">Party</span>
            </Label>
            <Select
              value={formData.partySize.toString()}
              onValueChange={(value) => updateFormData({ partySize: parseInt(value) })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {PARTY_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} {size === 1 ? 'person' : 'people'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Duration
            </Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) => updateFormData({ duration: parseInt(value) })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <span className="block sm:hidden">{option.value}min</span>
                    <span className="hidden sm:block">{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Date Selectors */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <CalendarIcon className="h-4 w-4" />
            Date Selection
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              variant={selectedDateType === 'today' ? 'selected' : 'outline'}
              onClick={() => handleQuickDateSelect('today')}
              className="h-11 sm:px-6"
            >
              Today
            </Button>
            <Button
              variant={selectedDateType === 'next-7-days' ? 'selected' : 'outline'}
              onClick={() => handleQuickDateSelect('next-7-days')}
              className="h-11 sm:px-6"
            >
              Next 7 Days
            </Button>
            <Button
              variant={selectedDateType === 'next-14-days' ? 'selected' : 'outline'}
              onClick={() => handleQuickDateSelect('next-14-days')}
              className="h-11 sm:px-6"
            >
              Next 14 Days
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
