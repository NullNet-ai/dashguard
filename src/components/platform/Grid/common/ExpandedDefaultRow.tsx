'use client'

import { Row } from '@tanstack/react-table'
import { IRowExpansionOptions } from '../types'

const ExpandedDefaultRow = ({row, expandOptions}: {
    row: Row<any>
    expandOptions: IRowExpansionOptions 
} ) => {

    const visibleCells = row.getVisibleCells()

    const excludedColumns = ['select', 'expand', 'action']
    const filteredRow =   visibleCells.filter((cell) => {
        return !excludedColumns.includes(cell.column.id)
    })

    //dummy data
    const bookingDetails: any = {
        bookingId: '12345',
        bookingDate: '2021-01-01',
        bookingTime: '12:00',
        bookingStatus: 'Pending',
        bookingAmount: '100',
        bookingPaymentMethod: 'Credit Card',
        estimatedDeliveryDate: '2021-01-01',
        estimatedDeliveryTime: '12:00',
        estimatedDeliveryAddress: '123 Main St',
    }

    const guestDetails: any = {
        guestName: 'John Doe',
        guestEmail: 'estDetails',
        guestPhone: '123-456-7890',
        guestAddress: '123 Main St',
        guestCity: 'Anytown',
        guestState: 'CA',
        guestZip: '12345',
        guestCountry: 'USA',
    }

    const vehicleDetails: any = {
        vehicleMake: 'Toyota',
        vehicleModel: 'Corolla',
        vehicleYear: '2019',
        vehicleColor: 'Red',
        vehicleLicensePlate: '12345',
    }

    //this function will format like this bookingId to Booking Id, bookingDate to Booking Date, etc
    const  formatKey =  (key: string) => {
        return key.replace(/([A-Z])/g, ' $1')
            .split(/[^a-zA-Z0-9]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .trim()
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-4">
            <div>
                <h2 className='text-primary text-sm font-semibold mb-2'>Booking Details:</h2>
                {/* map here */}
               <div className='flex flex-col gap-y-2'>
                {Object.keys(bookingDetails).map((key, index) => {
                        return (
                            <div key={index} className="flex items-center text-sm">
                                <span className="font-semibold mr-2">{formatKey(key)}:</span>
                                <span>{bookingDetails[key]}</span>
                            </div>
                        )
                    })}
               </div>
            </div>

            <div>
                <h2 className='text-primary text-sm font-semibold mb-2'>Guest Details:</h2>
                {/* map here */}
               <div className='flex flex-col gap-y-2'>
                {Object.keys(guestDetails).map((key, index) => {
                    
                        return (
                            <div key={index} className="flex items-center text-sm">
                                <span className="font-semibold mr-2">{formatKey(key)}:</span>
                                <span>{guestDetails[key]}</span>
                            </div>
                        )
                    })}
               </div>
            </div>

            <div>
                <h2 className='text-primary text-sm font-semibold mb-2'>Vehicle Details:</h2>
                {/* map here */}
               <div className='flex flex-col gap-y-2'>
                {Object.keys(vehicleDetails).map((key, index) => {
                    
                        return (
                            <div key={index} className="flex items-center text-sm">
                                <span className="font-semibold mr-2">{formatKey(key)}:</span>
                                <span>{vehicleDetails[key]}</span>
                            </div>
                        )
                    })}
               </div>
            </div>
        </div>
    )
}

export default ExpandedDefaultRow