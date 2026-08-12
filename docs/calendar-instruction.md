# Calendar - Ability to Remove Hours Between Events with Same PairId

## Overview

This feature allows the calendar to intelligently hide time slots between paired events that share the same `pairId`. This is particularly useful for travel itineraries where you want to hide the time between departure and arrival events, showing only relevant time periods.

## How It Works

### Basic Concept

- Events with the same `pairId` are considered "paired events"
- The calendar will hide all hours between the first and last event of each pair
- Date headers remain visible to maintain timeline context
- Only the time slots (hours) are filtered, not entire dates

### Filtering Logic

For each date group, the system:

1. **Identifies Paired Events**: Finds all events with a `pairId`
2. **Groups by PairId**: Organizes events by their shared `pairId`
3. **Sorts by Time**: Orders events within each pair by start time
4. **Calculates Exclusions**: Determines which hours to hide based on event timing
5. **Filters Timeline**: Removes excluded hours from the timeline display
6. **Filters Events**: Removes events that fall within excluded hours

### Multi-Day Pair Scenarios

The system handles different scenarios for paired events:

#### Same Day Events
- **Behavior**: Hide hours between start and end events
- **Example**: Event at 2 PM and 8 PM → Hide 3 PM to 7 PM

#### Multi-Day Events
- **Start Day**: Hide hours after the start event
- **Middle Days**: Hide all hours (but keep date header)
- **End Day**: Hide hours before the end event

### Timezone Handling for Paired Events

The calendar properly handles paired events across different timezones:

#### Cross-Timezone Event Processing
- **Event Timezone Conversion**: Each event's date and time are converted to its respective timezone before comparison
- **Date Group Timezone**: The current date group's timezone is used for accurate date matching
- **Hour Calculation**: Hours are calculated in the event's local timezone, not UTC

#### Example: International Flight
```typescript
// Departure: Los Angeles (PST) to London (GMT)
{
  id: '1',
  title: 'Departure LAX to LHR',
  pairId: 'flight-123',
  start: '2025-08-12T17:00:00-08:00', // 5:00 PM PST
  timezone: 'America/Los_Angeles'
},
{
  id: '2',
  title: 'Arrival LAX to LHR', 
  pairId: 'flight-123',
  start: '2025-08-13T13:00:00+00:00', // 1:00 PM GMT (next day)
  timezone: 'Europe/London'
}
```

**Result**: 
- **Aug 12 (PST group)**: Hide hours after 5:00 PM PST
- **Aug 13 (GMT group)**: Hide hours before 1:00 PM GMT
- **Accurate filtering**: Each timezone group processes hours in its local time

## Example Implementation

### Sample Data

```typescript
// Events with pairId '1234'
{
  id: '1',
  title: 'Departure from LAX to LHR',
  pairId: '1234',
  start: '2025-08-12T17:00:00+08:00', // Aug 12, 5:00 PM
  // ... other properties
},
{
  id: '2', 
  pairId: '1234',
  title: 'Arrival from LAX to LHR',
  start: '2025-08-15T23:00:00+08:00', // Aug 15, 11:00 PM
  // ... other properties
}
```

### Expected Timeline Display

For the date range Aug 8-21 with the above paired events:

**Aug 8-11**: 
- Display all hours (12:00 AM - 11:00 PM)
- No paired events affect these dates

**Aug 12** (Start Date):
- Display hours: 12:00 AM - 5:00 PM
- Hide hours after 5:00 PM (departure time)

**Aug 13-14** (Middle Dates):
- Display date header only
- Hide all hours (between paired events)

**Aug 15** (End Date):
- Display hours: 11:00 PM only
- Hide hours before 11:00 PM (arrival time)

**Aug 16-21**:
- Display all hours (12:00 AM - 11:00 PM)
- No paired events affect these dates

## Configuration

### Number of Days

The calendar supports configurable date ranges via the `numberOfDays` prop:

```typescript
// In calendar-view.tsx
numberOfDays={config?.headerNumberOfDays}
```

### Date Header Preservation

Date headers are always preserved to maintain timeline context:

```typescript
// In DateGroup.tsx
<DateHeader
  group={group}
  calendarType={calendarType}
  previousGroup={previousGroup}
  groupIndex={groupIndex}
/>
```

## Technical Implementation

### Core Function: `filterHoursBetweenPairedEvents`

Location: `src/components/ui/calendar/_components/views/components/Timeline/TimelineContainer.tsx`

This function:
1. Maps through each date group
2. Identifies paired events for each date
3. Calculates excluded hours based on pair timing
4. Returns filtered timeline and events

### Key Features

- **Timezone Aware**: Properly handles events across different timezones by converting dates and times to respective event timezones for accurate filtering
- **Multi-Timezone Date Groups**: Correctly processes paired events even when they appear in different timezone-specific date groups
- **Multi-Pair Support**: Can handle multiple pairs within the same date range
- **Cross-Timezone Pairs**: Supports paired events that span different timezones (e.g., departure in PST, arrival in GMT)
- **Non-Paired Event Preservation**: Events without `pairId` are always shown
- **Performance Optimized**: Filters at the data level before rendering

## Use Cases

### Travel Itineraries
- Hide flight duration between departure and arrival
- Show only relevant check-in/check-out times
- Maintain timeline context for multi-day trips

### Event Scheduling
- Hide gaps between related events
- Focus on active time periods
- Reduce visual clutter in long timelines

### Project Management
- Hide inactive periods between project phases
- Show only milestone events
- Maintain project timeline overview

## Benefits

1. **Improved Readability**: Reduces visual clutter by hiding irrelevant time periods
2. **Better Focus**: Highlights only active/relevant time slots
3. **Flexible Configuration**: Works with any number of days and timezone combinations
4. **Maintains Context**: Date headers preserve timeline understanding
5. **Performance**: Efficient filtering at the data level

This feature enhances the calendar's usability for scenarios where continuous time display is not necessary, making it ideal for travel planning, event management, and project scheduling applications.