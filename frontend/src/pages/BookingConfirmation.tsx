import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, Users, CreditCard } from 'lucide-react';

interface LocationState {
  seats: string[];
  show: any;
  totalPrice: number;
}

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { seats, show, totalPrice } = location.state as LocationState;

  const formatShowtime = (showtime: string) => {
    return new Date(showtime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-xl text-muted-foreground">
          Your tickets have been successfully booked
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{show.movie?.title}</CardTitle>
          <CardDescription className="text-lg">
            Booking Details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Show Time</p>
                  <p className="text-muted-foreground">{formatShowtime(show.showtime)}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{show.screen.name}</p>
                  <p className="text-muted-foreground text-sm">{show.screen.cinema?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Seats</p>
                  <p className="text-muted-foreground">{seats.join(', ')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Total Paid</p>
                  <p className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-primary text-sm font-medium mb-2">Important Reminders:</p>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• Please arrive at least 15 minutes before show time</li>
                <li>• Carry a valid ID for verification</li>
                <li>• This booking confirmation serves as your ticket</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => navigate('/bookings')}
        >
          View My Bookings
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
        >
          Book More Tickets
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;