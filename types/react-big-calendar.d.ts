declare module 'react-big-calendar' {
  import * as React from 'react';
  export interface CalendarProps<TEvent = any> extends React.HTMLAttributes<HTMLDivElement> {
    events?: TEvent[];
    date?: Date;
    view?: string;
    defaultView?: string;
    views?: string[];
    localizer: any;
    selectable?: boolean;
    popup?: boolean;
    onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
    onSelectEvent?: (event: TEvent) => void;
    onNavigate?: (newDate: Date) => void;
    onView?: (view: string) => void;
    style?: React.CSSProperties;
    eventPropGetter?: (event: TEvent) => { className?: string; style?: React.CSSProperties } | undefined;
  }
  export const Calendar: React.ComponentType<CalendarProps>;
  export function dateFnsLocalizer(config: any): any;
}

