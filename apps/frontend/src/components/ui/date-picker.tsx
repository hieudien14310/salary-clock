'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DatePickerProps = Pick<
  React.ComponentProps<typeof Button>,
  'id' | 'ref' | 'onBlur' | 'disabled' | 'aria-invalid' | 'aria-describedby'
> & {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
};

export function DatePicker({ value, onChange, ...props }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            data-empty={!value}
            className="h-10 w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
            {...props}
          >
            {value ? format(value, 'dd/MM/yyyy') : <span>Chọn ngày nhận lương</span>}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent className="p-0" align="start">
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
      </PopoverContent>
    </Popover>
  );
}
