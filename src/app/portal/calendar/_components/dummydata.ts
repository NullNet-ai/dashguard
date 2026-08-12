import moment from 'moment-timezone';
import { EventType } from '~/components/ui/calendar/_components/views/_common/types';


export const dummyData: EventType[] = [
    {
      id: '1',
      title: 'Departure from LAX to LHR',
      subTitle: 'VS8 (Virgin Atlantic) • Airbus A350',
      pairId:'1234',
      start: '2025-08-12T17:00:00+08:00', // Changed from 14:45:00 to 08:45:00
      color: 'blue',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor:'warning',
        lineType:'solid',
        status: 'departure',
        delayed: true,
        delayText: 'Delayed 1hr',
        additionalTime: moment().add(1, 'day').format('YYYY-MM-DD') + 'T06:42:00', // Changed from
        component: 'DepartureEvent'
      }
    },
    {
      id: '2',
      pairId:'1234',
      title: 'Arrival from LAX to LHR',
      subTitle: 'VS8 (Virgin Atlantic) • Airbus A350',
      start: '2025-08-15T23:00:00+08:00', // 10:00 PM August 11 GMT+8
      end: '2025-08-13T00:00:00+08:00', // 11:00 PM August 11 GMT+8
      color: 'orange',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType:'dashed',
        duration: 'IOH 14M',
        status: 'arrival',
        delayed: true,
        delayText: 'Delayed 44 min',
        additionalTime: moment().add(1, 'day').format('YYYY-MM-DD') + 'T10:29:00',
        component: 'ArrivalEvent'
      }
    },
    {
      id: '4',
      title: 'Arrival at Claridge Hotel',
      subTitle: 'Hotel',
      start: '2025-08-11T21:30:00-07:00', // 9:30 PM August 11 PDT
      color: 'gray',
      timezone: 'America/Los_Angeles',
      showTime: true,
      metadata: {
        lineColor:'warning',
        iconColor:'secondary',
        component: 'defaultEvent',
        lineType:'dashed',
        status: 'hotel',
        duration: '48 Min',
      }
    },
    // September 2025 Events
    {
      id: '5',
      title: 'Business Meeting',
      subTitle: 'Conference Room A • Downtown Office',
      start: '2025-09-02T09:00:00+08:00',
      color: 'green',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'meeting',
        duration: '2H 30M',
        component: 'defaultEvent'
      }
    },
    {
      id: '6',
      title: 'Flight to Tokyo',
      subTitle: 'PR432 (Philippine Airlines) • Boeing 777',
      start: '2025-09-05T14:15:00+08:00',
      color: 'blue',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'departure',
        delayed: false,
        component: 'DepartureEvent'
      }
    },
    {
      id: '7',
      title: 'Arrival in Tokyo',
      subTitle: 'PR432 (Philippine Airlines) • Boeing 777',
      start: '2025-09-05T19:45:00+09:00',
      color: 'orange',
      timezone: 'Asia/Tokyo',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'arrival',
        duration: '4H 30M',
        component: 'ArrivalEvent'
      }
    },
    {
      id: '8',
      title: 'Hotel Check-in',
      subTitle: 'Tokyo Grand Hotel • Shibuya',
      start: '2025-09-05T21:00:00+09:00',
      color: 'gray',
      timezone: 'Asia/Tokyo',
      showTime: true,
      metadata: {
        lineColor: 'secondary',
        lineType: 'dashed',
        status: 'hotel',
        component: 'defaultEvent'
      }
    },
    {
      id: '9',
      title: 'Client Presentation',
      subTitle: 'Zoom Meeting • Q2 Results Review',
      start: '2025-09-10T10:30:00+08:00',
      color: 'purple',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'dashed',
        status: 'meeting',
        duration: '1H 45M',
        component: 'defaultEvent'
      }
    },
    {
      id: '91',
      title: 'Client Presentation 2',
      subTitle: 'Zoom Meeting • Q2 Results Review',
      start: '2025-09-10T10:50:00+08:00',
      color: 'purple',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'dashed',
        status: 'meeting',
        duration: '1H 45M',
        component: 'defaultEvent',
        additionalTime: '2025-09-10T10:56:00+08:00',
      }
    },
    {
      id: '10',
      title: 'Team Lunch',
      subTitle: 'Italian Restaurant • Team Building',
      start: '2025-09-12T12:00:00+08:00',
      color: 'yellow',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'dashed',
        status: 'meal',
        duration: '1H 30M',
        component: 'defaultEvent'
      }
    },
    {
      id: '11',
      title: 'Airport Transfer',
      subTitle: 'Hotel to NAIA Terminal 3',
      start: '2025-09-15T16:00:00+08:00',
      color: 'gray',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'secondary',
        lineType: 'dashed',
        status: 'pickup',
        duration: '45M',
        component: 'PickupEvent',
        passengerInfo: {
          name: 'John Larry',
          phone: '+44 33 0563 8709'
        },
        vehicleInfo: {
          model: '2023 Toyota Hiace',
          plate: 'ABC 1234'
        }
      }
    },
    {
      id: '12',
      title: 'Flight to Singapore',
      subTitle: 'SQ918 (Singapore Airlines) • Airbus A330',
      start: '2025-09-15T18:30:00+08:00',
      color: 'blue',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'departure',
        delayed: false,
        component: 'DepartureEvent'
      }
    },
    {
      id: '13',
      title: 'Arrival in Singapore',
      subTitle: 'SQ918 (Singapore Airlines) • Airbus A330',
      start: '2025-09-15T22:15:00+08:00',
      color: 'orange',
      timezone: 'Asia/Singapore',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'arrival',
        duration: '3H 45M',
        component: 'ArrivalEvent',
        delayed: true,
        delayText: 'Delayed 1hr',
        additionalTime: '2025-09-15T22:55:00+08:00'
      }
    },
    {
      id: '14',
      title: 'Conference Day 1',
      subTitle: 'Tech Summit 2025 • Marina Bay Sands',
      start: '2025-09-20T08:00:00+08:00',
      color: 'green',
      timezone: 'Asia/Singapore',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'conference',
        duration: '8H',
        component: 'defaultEvent'
      }
    },
    {
      id: '15',
      title: 'Networking Dinner',
      subTitle: 'Rooftop Restaurant • Industry Leaders',
      start: '2025-09-20T19:00:00+08:00',
      color: 'red',
      timezone: 'Asia/Singapore',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'dashed',
        status: 'dinner',
        duration: '3H',
        component: 'defaultEvent'
      }
    },
    {
      id: '16',
      title: 'Return Flight to Manila',
      subTitle: 'SQ917 (Singapore Airlines) • Airbus A330',
      start: '2025-09-25T23:55:00+08:00',
      color: 'blue',
      timezone: 'Asia/Singapore',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'departure',
        delayed: false,
        component: 'DepartureEvent'
      }
    },
    {
      id: '17',
      title: 'Arrival in Manila',
      subTitle: 'SQ917 (Singapore Airlines) • Airbus A330',
      start: '2025-09-26T03:40:00+08:00',
      color: 'orange',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'arrival',
        duration: '3H 45M',
        component: 'ArrivalEvent'
      }
    },

    {
      id: '20',
      pairId: '18',
      title: 'Arrival at LAX from Manila',
      subTitle: 'PR102 (Philippine Airlines) • Boeing 777-300ER',
      start: '2025-08-10T18:45:00-07:00',
      color: 'orange',
      timezone: 'America/Los_Angeles',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'arrival',
        duration: '15H 15M',
        component: 'ArrivalEvent'
      }
    },
    {
      id: '21',
      pairId: 'aug18-19',
      title: 'Departure to Cebu',
      subTitle: 'PR1863 (Philippine Airlines) • Airbus A321',
      start: '2025-08-18T14:30:00+08:00',
      color: 'blue',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'departure',
        delayed: false,
        component: 'DepartureEvent'
      }
    },
    {
      id: '22',
      pairId: 'aug18-19',
      title: 'Arrival in Cebu',
      subTitle: 'PR1863 (Philippine Airlines) • Airbus A321',
      start: '2025-08-19T16:15:00+08:00',
      color: 'orange',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'arrival',
        duration: '1H 45M',
        component: 'ArrivalEvent'
      }
    },
    {
      id: '23',
      pairId: 'aug20-same-day',
      title: 'Departure to Davao',
      subTitle: 'PR2971 (Philippine Airlines) • Boeing 737',
      start: '2025-08-20T08:00:00+08:00',
      color: 'blue',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'departure',
        delayed: false,
        component: 'DepartureEvent'
      }
    },
    {
      id: '24',
      pairId: 'aug20-same-day',
      title: 'Arrival in Davao',
      subTitle: 'PR2971 (Philippine Airlines) • Boeing 737',
      start: '2025-08-20T14:00:00+08:00',
      color: 'orange',
      timezone: 'Asia/Manila',
      showTime: true,
      metadata: {
        lineColor: 'warning',
        lineType: 'solid',
        status: 'arrival',
        duration: '6H',
        component: 'ArrivalEvent'
      }
    }
  ];