'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarDays, ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';

const Calendar = React.lazy(() => import('@/components/ui/calendar').then((module) => ({ default: module.Calendar })));

type DatePickerProps = Pick<
  React.ComponentProps<typeof Button>,
  'id' | 'ref' | 'onBlur' | 'disabled' | 'aria-invalid' | 'aria-describedby'
> & {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
};

export function DatePicker({ value, onChange, placeholder = 'Chọn ngày', ...props }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            data-empty={!value}
            className="h-11 w-full justify-between rounded-[12px] border-[1.5px] border-cozy-border-cocoa bg-cozy-surface px-3.5 text-left font-semibold text-cozy-espresso hover:bg-cozy-canvas data-[empty=true]:font-medium data-[empty=true]:text-muted-foreground"
            {...props}
          >
            <span className="flex items-center gap-2.5">
              <CalendarDays className="size-4 text-cozy-burgundy" aria-hidden="true" />
              <span className="tabular-nums">{value ? format(value, 'dd/MM/yyyy') : placeholder}</span>
            </span>
            <ChevronDownIcon data-icon="inline-end" className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </Button>
        }
      />
      <PopoverContent className="w-76 p-2.5" align="start">
        <React.Suspense
          fallback={
            <div className="flex h-72 items-center justify-center">
              <Spinner aria-label="Đang tải lịch" />
            </div>
          }
        >
          <Calendar
            className="w-full"
            mode="single"
            locale={vi}
            selected={value}
            defaultMonth={value}
            onSelect={(date) => {
              onChange(date);
              if (date) setOpen(false);
            }}
          />
        </React.Suspense>
      </PopoverContent>
    </Popover>
  );
}
