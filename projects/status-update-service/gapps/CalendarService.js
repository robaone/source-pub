class CalendarService {
  constructor(calendar,logger,default_calendar) {
    this.logger = logger ?? {log:function(){}};
    this.calendar = calendar;
    this.default_calendar = default_calendar;
  }
  addEvent(event){
    this.logger.log(`addEvent(event:${JSON.stringify(event)})`);
    const start_date = event.content?.action?.date;
    const event_title = event.title;
    const event_description = event.content?.action?.data?.text;
    if(start_date == undefined || event_title == undefined || event_description == undefined){
      return;
    }
    const start_dateTime = new Date(start_date);
    const intersecting_events = this.getIntersectingEvents(start_dateTime);
    const existing_intersecting_event = intersecting_events.filter((existing_event) => {
      const existing_title = existing_event.getTitle();
      return event_title === existing_title;
    })[0];
    const other_intersecting_events = intersecting_events.filter((existing_event) => {
      return event_title !== existing_event.getTitle()
    });
    this.logger.log(`There are ${other_intersecting_events.length} other intersecting events`);
    other_intersecting_events.forEach((other_event) => {
      const start_time = other_event.getStartTime();
      this.logger.log(`Setting the event ${other_event.getTitle()} end time to ${start_dateTime}`);
      other_event.setTime(start_time,start_dateTime);
    });
    const end_dateTime = this.getEventEndDate(start_dateTime);
    this.logger.log(`Create event for ${event_title} starting at ${start_dateTime} and ending at ${end_dateTime}`);
    const calendar_event = existing_intersecting_event ?? this.calendar.createEvent(event_title,start_dateTime,end_dateTime);
    const existing_description = calendar_event.getDescription();
    const description_prefix = existing_description === '' ? '' : `${existing_description}\n`;
    calendar_event.setDescription(`${description_prefix}${event_description}`);
  }
  getIntersectingEvents(start_dateTime){
    return this.calendar.getEventsForDay(start_dateTime).filter((event) =>{
      const eventStartTime = event.getStartTime();
      const eventEndTime = event.getEndTime();
      const reference_time = Math.round(start_dateTime.getTime() / 1000) * 1000;
      this.logger.log(`${event.getTitle()}: eventStartTime = ${eventStartTime.getTime()}, eventEndTime = ${eventEndTime.getTime()}, reference time = ${reference_time}`);
      const is_intersecting = reference_time >= eventStartTime.getTime() && reference_time <= eventEndTime.getTime();
      this.logger.log(`is intersecting = ${is_intersecting}`);
      return is_intersecting;
    });
  }
  getEventEndDate(start_date) {
    const next_event_date = this.getNextEventDate(start_date);
    const end_of_work_day = new Date(start_date);
    end_of_work_day.setHours(17);
    end_of_work_day.setMinutes(0);
    end_of_work_day.setSeconds(0);
    end_of_work_day.setMilliseconds(0);
    const end_limit_date = next_event_date === undefined
      ? end_of_work_day
      : next_event_date;
    const end_date = this.isWithinWorkHours(start_date)
      ? end_limit_date
      : this.getOutsideWorkhoursEndDate(start_date,next_event_date)
    return end_date;
  }
  isWithinWorkHours(start_date) {
    const start_hour = start_date.getHours();
    const start_day_of_week = start_date.getDay();
    const isWeekday = start_day_of_week >= 1 && start_day_of_week <= 5;
    const isWorkingHour = start_hour >= 9 && start_hour < 17;
    return isWeekday && isWorkingHour;
  }
  getOutsideWorkhoursEndDate(start_date,next_event_date) {
    const default_duration_minutes = DEFAULT_EVENT_DURATION_MIN;
    const default_end_date = new Date(start_date.getTime() + (default_duration_minutes * 1000 * 60));
    if (next_event_date === undefined){
      return default_end_date;
    }
    const calculated_end_date = next_event_date.getTime() < default_end_date.getTime()
      ? next_event_date
      : default_end_date;
    return calculated_end_date;
  }
  getNextEventDate(event_date) {
    const right_now = event_date ?? new Date();
    const event_calendar = this.default_calendar ?? this.calendar;
    const next_event = event_calendar.getEventsForDay(right_now).filter(event => {
      return event.getStartTime().getTime() > right_now.getTime();
    }).reduce((accumulator, event) => {
      const event_start_time = event.getStartTime();
      if(accumulator.date === undefined) {
        accumulator.date = event_start_time;
      }else if(accumulator.date.getTime() > event_start_time.getTime()){
        accumulator.date = event_start_time;
      }
      return accumulator;
    },{date: undefined});
    return next_event.date;
  }
}

function CalendarServiceTest (){
  this.before = function() {
    const calendar = {
      createEvent: function(title, start_date, end_date) {
        Logger.log(`createEvent(${title},${start_date},${end_date})`);
        return {
          setDescription: function(description) {
            Logger.log(`setDescription(${description})`);
          },
          getDescription: function() {
            return 'Existing description';
          }
        }
      },
      getEventsForDay: function(event_date) {
        return [];
      }
    };
    this.service = new CalendarService(calendar, Logger);
  }
  this.test_addEvent = function() {
    // Given
    const event = {
      title: 'The event title',
      content: {
        action: {
          date: '2023-06-13T16:17:00.000Z',
          data: {
            text: 'This is the description'
          }
        }
      }
    };

    // When
    this.service.addEvent(event);

    // Then

  }
  this.test_getOutsideWorkHoursEndDate_no_next_event = function() {
    // Given
    const start_date = new Date('2023-07-01T00:00:00.000');
    const next_event_date = undefined;
    
    // When
    const end_date = this.service.getOutsideWorkhoursEndDate(start_date,next_event_date);

    // Then
    Logger.log(`Calculated end date = ${end_date.toString()}`);
    test_assertTrue(end_date.getMinutes() === 30);
  }

  this.test_getOutsideWorkHoursEndDate_next_event = function() {
    // Given
    const start_date = new Date('2023-07-01T00:00:00.000');
    const next_event_date = new Date('2023-07-01T00:05:00.000');
    
    // When
    const end_date = this.service.getOutsideWorkhoursEndDate(start_date,next_event_date);

    // Then
    Logger.log(`Calculated end date = ${end_date.toString()}`);
    test_assertTrue(end_date.getMinutes() === 5);
  }
}

function test_calendarService() {
  new Test(new CalendarServiceTest()).run();
}