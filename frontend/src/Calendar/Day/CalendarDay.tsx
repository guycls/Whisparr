import Box from '@mui/material/Box';
import moment from 'moment';
import React from 'react';
import * as calendarViews from 'Calendar/calendarViews';
import CalendarEventConnector from 'Calendar/Events/CalendarEventConnector';
import CalendarEventGroupConnector from 'Calendar/Events/CalendarEventGroupConnector';
import Series from 'Series/Series';
import CalendarEventGroup, { CalendarEvent } from 'typings/CalendarEventGroup';

interface CalendarDayProps {
  date: string;
  time: string;
  isTodaysDate: boolean;
  events: (CalendarEvent | CalendarEventGroup)[];
  view: string;
  onEventModalOpenToggle(...args: unknown[]): unknown;
}

function CalendarDay(props: CalendarDayProps) {
  const { date, time, isTodaysDate, events, view, onEventModalOpenToggle } =
    props;

  const ref = React.useRef<HTMLDivElement>(null);
  const isDifferentMonth = !moment(date).isSame(moment(time), 'month');

  React.useEffect(() => {
    if (isTodaysDate && view === calendarViews.MONTH && ref.current) {
      ref.current.scrollIntoView();
    }
  }, [time, isTodaysDate, view]);

  return (
    <Box
      ref={ref}
      sx={{
        flex: '1 0 14.28%',
        width: view === calendarViews.DAY ? '100%' : undefined,
        overflow: 'hidden',
        minHeight: 70,
        borderBottom: '1px solid var(--calendarBorderColor)',
        borderLeft: '1px solid var(--calendarBorderColor)',
      }}
    >
      {view === calendarViews.MONTH && (
        <Box
          sx={{
            pr: '5px',
            borderBottom: '1px solid var(--calendarBorderColor)',
            textAlign: 'right',
            backgroundColor: isTodaysDate
              ? 'var(--calendarTodayBackgroundColor)'
              : undefined,
            color: isDifferentMonth ? 'var(--disabledColor)' : undefined,
          }}
        >
          {moment(date).date()}
        </Box>
      )}
      <div>
        {events.map((event) => {
          if (event.isGroup) {
            return (
              <CalendarEventGroupConnector
                key={event.seriesId}
                {...event}
                onEventModalOpenToggle={onEventModalOpenToggle}
              />
            );
          }

          return (
            <CalendarEventConnector
              key={event.id}
              {...event}
              episodeId={event.id}
              series={event.series as Series}
              releaseDate={event.releaseDate as string}
              onEventModalOpenToggle={onEventModalOpenToggle}
            />
          );
        })}
      </div>
    </Box>
  );
}

export default CalendarDay;
