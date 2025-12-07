# Recurring Events Feature - Testing Guide

## Overview
When an organizer creates a recurring event, the system now automatically generates multiple event instances based on the selected pattern.

## Changes Made

### Backend (event.service.ts)
- Added `generateRecurringDates()` method to calculate dates for recurring events
- Modified `createEvent()` to create multiple event instances when `isRecurring` is true
- Generates 12 occurrences by default for:
  - **Weekly**: Events every 7 days
  - **Biweekly**: Events every 14 days
  - **Monthly**: Events on the same day each month

### Frontend Updates
- **EventsPage.tsx**: Added purple "Recurring" badge to recurring events
- **MyEventsPage.tsx**: Added purple "Recurring" badge to recurring events in organizer view

## How to Test

### 1. Create a Recurring Event
1. Sign in as an organizer
2. Navigate to "Create Event" page
3. Fill in all event details
4. On Step 2 (Date & Location):
   - Enable "Make this a recurring event" toggle
   - Select a recurring pattern (Weekly, Biweekly, or Monthly)
5. Complete and publish the event

### 2. Verify Event Creation
1. Navigate to "My Events" page (organizer view)
2. You should see multiple events with the same name but different dates
3. Each event should have a purple "Recurring" badge
4. Verify the dates match the selected pattern:
   - **Weekly**: 7 days apart
   - **Biweekly**: 14 days apart
   - **Monthly**: Same day each month

### 3. Verify User View
1. Sign out and sign in as a regular user
2. Navigate to "Events" page
3. The recurring events should appear in the list
4. Each instance should be joinable independently
5. Users can join individual occurrences

### 4. Verify "My Joined Events"
1. As a user, join one or more occurrences
2. Navigate to "My Joined Events" tab
3. Only the joined occurrences should appear
4. Each occurrence is independent

## Expected Behavior

### Organizer View (My Events)
- ✅ All 12 occurrences appear as separate events
- ✅ Each has a "Recurring" badge
- ✅ Each can be managed independently (cancel, delete)
- ✅ Stats (participants, revenue) are calculated per occurrence

### User View (Events Page)
- ✅ All upcoming occurrences appear in the events list
- ✅ Each occurrence shows the "Recurring" badge
- ✅ Users can join each occurrence independently
- ✅ Joined occurrences appear in "My Joined Events"

## Technical Notes

- Each recurring event instance is stored as a separate database record
- All instances share the same `isRecurring: true` flag and `recurringPattern`
- Instances have different `date` values based on the pattern
- Each instance has its own:
  - Unique event ID
  - Participant list
  - Status (active, cancelled, completed)
  - Current participant count

## Future Enhancements (Optional)

1. **Configurable Occurrences**: Allow organizers to specify how many occurrences to create (currently fixed at 12)
2. **Series Management**: Add ability to update/cancel all occurrences in a series at once
3. **End Date**: Allow organizers to specify an end date for the recurring pattern
4. **Custom Patterns**: Add more patterns (daily, custom intervals, etc.)
5. **Series View**: Group recurring events visually in the UI

