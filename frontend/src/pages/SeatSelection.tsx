import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, MapPin, Loader2, Users } from 'lucide-react';
import { Show } from '@/types';
import { movieService } from '@/services/movieService';
import { websocketService } from '@/services/websocketService';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import SeatGrid from '@/components/SeatGrid';

const SeatSelection: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [blockedSeats, setBlockedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (showId) {
      fetchShowDetails(parseInt(showId));
      setupWebSocket(parseInt(showId));
    }

    return () => {
      websocketService.disconnect();
    };
  }, [showId]);

  const fetchShowDetails = async (id: number) => {
    try {
      const data = await movieService.getShowDetails(id);
      setShow(data);
    } catch (error) {
      toast.error("Failed to load show details. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = (id: number) => {
    const socket = websocketService.connect(id);

    // New listener to sync state with Redis
    websocketService.onInitialBlockedSeats((blockedSeats: string[]) => {
      setBlockedSeats(blockedSeats);
    });

    websocketService.onSeatBlocked((seatId: string) => {
      setBlockedSeats(prev => [...prev.filter(s => s !== seatId), seatId]);
    });

    websocketService.onSeatUnblocked((seatId: string) => {
      setBlockedSeats(prev => prev.filter(s => s !== seatId));
    });


    websocketService.onSeatAlreadyBlocked((seatId: string) => {
      toast.warning("Seat already blocked", {
        description: `Seat ${seatId} is currently unavailable.`,
      });
    });

    websocketService.onSeatBooked((seats: string[]) => {
      setShow(prevShow => {
        if (!prevShow) {
          return prevShow;
        }
        return {
          ...prevShow,
          otherBookings: [...prevShow.otherBookings, ...seats],
        };
      });
    });

    websocketService.onSeatUnbooked((data: { seatId: string, showId: string }) => {
      console.log("Seat go unbooked");
      setShow(prevShow => {
        if (!prevShow) {
          return prevShow;
        }
        return {
          ...prevShow,
          otherBookings: prevShow.otherBookings.filter((booking) => booking != data.seatId),
        }
      });
    });
  };

  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
      websocketService.deselectSeat(seatId, showId);
    } else {
      if (blockedSeats.includes(seatId)) {
        toast.warning("Seat Blocked", {
          description: "This seat is temporarily unavailable.",
        })
        return;
      }


      if (selectedSeats.length + (show?.userBookings?.length || 0) >= 6) {
        toast.warning("Limit reached", {
          description: "You can only select up to 6 seats.",
        })
        return;
      }

      setSelectedSeats(prev => [...prev, seatId]);
      websocketService.selectSeat(seatId, showId);
    }
  };

  const handleBooking = async () => {
    if (!user || !show || selectedSeats.length === 0) return;

    setBooking(true);
    try {
      await movieService.createBooking({
        userId: user.id,
        showId: show.id,
        seats: selectedSeats,
      });

      navigate('/booking-confirmation', {
        state: {
          seats: selectedSeats,
          show: show,
          totalPrice: parseFloat(show.price) * selectedSeats.length,
        }
      });
    } catch (error: any) {
      toast.error("Booking failed. Please try again.", {
        description: error.response?.data?.message || "Unable to complete booking. Please try again.",
      });
    } finally {
      setBooking(false);
    }
  };

  const formatShowtime = (showtime: string) => {
    return new Date(showtime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPrice = show ? parseFloat(show.price) * selectedSeats.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-xl text-muted-foreground">Show not found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Select Your Seats</h1>
            <p className="text-muted-foreground">Choose up to 6 seats for your booking</p>
          </div>

          <SeatGrid
            selectedSeats={selectedSeats}
            userBookings={show.userBookings || []}
            otherBookings={show.otherBookings || []}
            blockedSeats={blockedSeats}
            onSeatClick={handleSeatClick}
            maxSeats={7}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{show.movie?.title}</CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatShowtime(show.showtime)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {show.screen.name}
                </div>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Selected Seats:</span>
                <span className="font-medium">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price per seat:</span>
                <span>₹{show.price}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-4">
                <span>Total:</span>
                <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || booking}
                className="w-full py-3"
              >
                {booking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {booking ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
