import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeatGridProps {
  selectedSeats: string[];
  userBookings: string[];
  otherBookings: string[];
  blockedSeats: string[];
  onSeatClick: (seatId: string) => void;
  maxSeats?: number;
}

const SeatGrid: React.FC<SeatGridProps> = ({
  selectedSeats,
  userBookings,
  otherBookings,
  blockedSeats,
  onSeatClick,
  maxSeats = 6,
}) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 10;

  const getSeatStatus = (seatId: string) => {
    if (userBookings.includes(seatId)) return 'user-booked';
    if (otherBookings.includes(seatId)) return 'other-booked';
    if (blockedSeats.includes(seatId)) return 'blocked';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const handleSeatClick = (seatId: string) => {
    const status = getSeatStatus(seatId);
    if (status === 'user-booked' || status === 'other-booked' || status === 'blocked') return;

    if (status === 'available' && selectedSeats.length >= maxSeats) {
      return; // Max seats reached
    }

    onSeatClick(seatId);
  };

  const getSeatClassName = (status: string) => {
    // UPDATED: Default sizes are for mobile, sm: prefixes for desktop
    const baseClasses = "w-6 h-6 text-[10px] sm:w-8 sm:h-8 sm:text-xs font-medium rounded-t-lg border-2 transition-all duration-200 hover:scale-105";

    switch (status) {
      case 'other-booked':
        return cn(baseClasses, "bg-[#616161] text-destructive-foreground cursor-not-allowed hover:scale-100");
      case 'user-booked':
        return cn(baseClasses, "bg-[#004F8C] text-destructive-foreground cursor-not-allowed hover:scale-100");
      case 'blocked':
        return cn(baseClasses, "bg-[#FFC107]/50 dark:bg-[#FFC107] border-yellow-600 text-black cursor-not-allowed scale-80");
      case 'selected':
        return cn(baseClasses, "bg-primary border-primary text-primary-foreground cursor-pointer");
      default:
        return cn(baseClasses, "bg-green-500 border-green-600 text-white cursor-pointer hover:bg-green-400");
    }
  };

  return (
    // The padding `px-2` is added to prevent the grid from touching screen edges on mobile
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      {/* Screen */}
      <div className="mb-8">
        <div className="h-2 bg-gradient-to-r from-transparent via-foreground to-transparent rounded-full mb-2"></div>
        <p className="text-center text-muted-foreground text-sm">SCREEN</p>
      </div>

      {/* Seat Grid */}
      <div className="space-y-1 sm:space-y-2">
        {rows.map((row) => (
          // UPDATED: Reduced space between seats on mobile (space-x-1)
          <div key={row} className="flex items-center justify-center space-x-1 sm:space-x-2">
            {/* UPDATED: Reduced width for the row label on mobile */}
            <span className="w-4 text-center font-medium text-sm sm:w-6 sm:text-base">{row}</span>
            {Array.from({ length: seatsPerRow }, (_, index) => {
              const seatNumber = index + 1;
              const seatId = `${row}${seatNumber}`;
              const status = getSeatStatus(seatId);

              return (
                <Button
                  key={seatId}
                  className={getSeatClassName(status)}
                  onClick={() => handleSeatClick(seatId)}
                  // Use a minimal padding for the small mobile buttons
                  size="icon"
                >
                  {seatNumber}
                </Button>
              );
            })}
            {/* UPDATED: Reduced width for the row label on mobile */}
            <span className="w-4 text-center font-medium text-sm sm:w-6 sm:text-base">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center items-center mt-8 gap-x-4 gap-y-2 sm:gap-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 border-green-600 border-2 rounded-t"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary border-primary border-2 rounded-t"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#FFC107] border-yellow-600 border-2 rounded-t"></div>
          <span>Temporarily unavailable</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#004F8C] border-blue-600 border-2 rounded-t"></div>
          <span>Booked by you</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#616161] border-gray-600 border-2 rounded-t"></div>
          <span>Booked by others</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
