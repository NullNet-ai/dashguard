'use client';

import { useCalendarContext } from '~/components/ui/calendar/views/CalendarProvider';
import React from 'react';

interface FlightInfo {
  airline: string;
  flightNumber: string;
  confirmation: string;
  status: string;
  departure: {
    airport: string;
    code: string;
    city: string;
    time: string;
    date: string;
    terminal: string;
    gate: string;
  };
  arrival: {
    airport: string;
    code: string;
    city: string;
    time: string;
    date: string;
    terminal: string;
  };
  passengers: Array<{
    name: string;
    seat: string;
    class: string;
  }>;
}

interface Lounge {
  name: string;
  terminal: string;
  hours: string;
  status: 'open' | 'closed';
  image: string;
}

const CustomSidebar = () => {
  const { isSidebarCollapsed, selectedEvent } = useCalendarContext();

  const flightInfo: FlightInfo = {
    airline: 'Virgin Airlines',
    flightNumber: 'VS8 - Airbus A350',
    confirmation: '6CG04G3',
    status: 'On Time',
    departure: {
      airport: 'Los Angeles International',
      code: 'LAX',
      city: 'Los Angeles',
      time: '3:45 PM',
      date: 'Fri, Nov 22',
      terminal: '3',
      gate: '22'
    },
    arrival: {
      airport: 'Heathrow International',
      code: 'LHR',
      city: 'London',
      time: '9:45 AM',
      date: 'Sat, Nov 23',
      terminal: '3'
    },
    passengers: [
      { name: 'Tom Smith', seat: '4A', class: 'Business' },
      { name: 'Marsha Smith', seat: '4B', class: 'Business' },
      { name: 'Marc Smith', seat: '4C', class: 'Business' }
    ]
  };

  const lounges: Lounge[] = [
    {
      name: 'Virgin Atlantic Clubhouse',
      terminal: 'Terminal 3',
      hours: '1:00am pst - 11:30pm pst',
      status: 'open',
      image: '/api/placeholder/80/60'
    },
    {
      name: 'American Express Centurion Lounge',
      terminal: 'Terminal 3',
      hours: '1:00am pst - 11:30pm pst',
      status: 'open',
      image: '/api/placeholder/80/60'
    }
  ];

  if(!selectedEvent) return null

  return (
    <div
      className={`h-full bg-white transition-all duration-300 ease-in-out border-l border-gray-200 ${
        isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-[600px]'
      }`}
    >
      <div className="p-6 h-full overflow-y-auto">
        {/* Header with map */}
        <div className="mb-6">
          <div className="relative h-32 bg-blue-50 rounded-lg mb-4 overflow-hidden">
            {/* Simplified map representation */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200">
              <div className="absolute top-4 left-4 w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="absolute top-6 right-8 w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                </svg>
              </div>
              <div className="absolute bottom-2 left-4 right-4 h-px border-t-2 border-dashed border-gray-400"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Label</span>
            <span className="text-sm text-blue-600">Archived</span>
          </div>
        </div>

        {/* Flight Information */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VA</span>
            </div>
            <div>
              <div className="font-medium text-sm">{flightInfo.airline}</div>
              <div className="text-xs text-gray-500">{flightInfo.flightNumber}</div>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-green-600 font-medium">{flightInfo.status}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            Confirmation No {flightInfo.confirmation}
          </div>

          {/* Flight Route */}
          <div className="space-y-4">
            {/* Departure */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">US</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{flightInfo.departure.code}</div>
                <div className="text-sm text-gray-600">{flightInfo.departure.airport}</div>
                <div className="text-xs text-gray-500">
                  Term. {flightInfo.departure.terminal} • Gate {flightInfo.departure.gate}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{flightInfo.departure.time}</div>
                <div className="text-xs text-gray-500">{flightInfo.departure.date}</div>
                <div className="text-xs text-gray-500">PST</div>
              </div>
            </div>

            {/* Flight duration line */}
            <div className="ml-4 pl-4 border-l-2 border-gray-200 h-8"></div>

            {/* Arrival */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">UK</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{flightInfo.arrival.code}</div>
                <div className="text-sm text-gray-600">{flightInfo.arrival.airport}</div>
                <div className="text-xs text-gray-500">
                  Term. {flightInfo.arrival.terminal}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{flightInfo.arrival.time}</div>
                <div className="text-xs text-gray-500">{flightInfo.arrival.date}</div>
                <div className="text-xs text-gray-500">GMT</div>
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="mt-6 space-y-2">
            {flightInfo.passengers.map((passenger, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{passenger.name}</span>
                <div className="flex gap-4 text-gray-500">
                  <span>{passenger.seat} - {passenger.class}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lounges Section */}
        <div>
          <h3 className="font-medium text-gray-700 mb-4">Lounges</h3>
          
          <div className="space-y-4">
            {lounges.map((lounge, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{lounge.name}</h4>
                    <p className="text-xs text-gray-500 mb-1">{lounge.terminal}</p>
                    <p className="text-xs text-green-600">
                      open now: {lounge.hours}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    Directions
                  </button>
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

CustomSidebar.displayName = 'CustomSidebar'

export default CustomSidebar;
