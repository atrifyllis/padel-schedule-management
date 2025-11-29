declare module 'react-big-calendar' {
  import * as React from 'react';

  export interface SlotInfo {
    start: Date;
    end: Date;
  }

  export interface CalendarEvent {
    start: Date;
    end: Date;
    title?: string;
    id?: string;
    allDay?: boolean;
    resource?: unknown;
    [key: string]: any;
  }

  export interface NavigateAction {
    action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE';
    date: Date;
    view: string;
  }

  export interface CalendarProps<TEvent = CalendarEvent> extends React.HTMLAttributes<HTMLDivElement> {
    events?: TEvent[];
    date?: Date;
    view?: string;
    defaultView?: string;
    views?: string[];
    localizer: any;
    selectable?: boolean;
    popup?: boolean;
    style?: React.CSSProperties;
    onSelectSlot?: (slotInfo: SlotInfo) => void;
    onSelectEvent?: (event: TEvent) => void;
    onNavigate?: (newDate: Date, view?: string, action?: string) => void;
    onView?: (view: string) => void;
    eventPropGetter?: (event: TEvent) => { className?: string; style?: React.CSSProperties } | undefined;
    components?: Record<string, any>;
    toolbar?: boolean;
  }

  export const Calendar: React.ComponentType<CalendarProps>;
  export function dateFnsLocalizer(config: any): any;
}
