import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, Clock, Loader2 } from 'lucide-react';
import { Booking } from '@/types';
import { movieService } from '@/services/movieService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [refetchData, setRefetchData] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, refetchData]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const data = await movieService.getUserBookings(user.id);
      setBookings(data.sort((a, b) =>
        new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()
      ));
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load booking history. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    try {
      await movieService.cancelBooking(bookingToCancel);
      setBookings(prevBookings => prevBookings.filter(b => (b.id).toString() !== bookingToCancel));
      setRefetchData(!refetchData);
      toast.success("Success", {
        description: "Your booking has been successfully cancelled.",
      })
    } catch (error) {
      toast.error("Cancellation Failed", {
        description: "We couldn't cancel your booking. Please try again later.",
      });
    } finally {
      setIsCancelling(false);
      setIsModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isShowInFuture = (showtime: string) => {
    return new Date(showtime) > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
        <p className="text-xl text-muted-foreground">
          {bookings.length > 0
            ? `You have ${bookings.length} booking${bookings.length > 1 ? 's' : ''}`
            : 'No bookings found'
          }
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          {/* No bookings message */}
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isUpcoming = isShowInFuture(booking.show.showtime);
            const totalPrice = parseFloat(booking.show.price) * booking.seats.length;

            return (
              <Card
                key={booking.id}
                className="hover:shadow-lg transition-all flex flex-col"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full lg:w-1/4 p-4 lg:p-6 flex justify-center">
                    <img
                      src={booking.show.movie?.posterUrl}
                      alt={booking.show.movie?.title}
                      className="w-40 lg:w-full rounded-lg shadow-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop`;
                      }}
                    />
                  </div>

                  <div className="flex-1 lg:w-3/4 p-4 lg:p-6">
                    {/* --- FIX: RESTORED CARD HEADER --- */}
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl mb-2">
                            {booking.show.movie?.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant={isUpcoming ? "default" : "secondary"} className="mb-2">
                              {isUpcoming ? "Upcoming" : "Past"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Total Paid</p>
                        </div>
                      </div>
                    </CardHeader>

                    {/* --- FIX: RESTORED CARD CONTENT --- */}
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium">Show Time</p>
                              <p className="text-muted-foreground text-sm">
                                {formatDate(booking.show.showtime)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium">Cinema & Screen</p>
                              <p className="text-muted-foreground text-sm">
                                {booking.show.screen.cinema?.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {booking.show.screen.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium">Seats</p>
                              <p className="text-muted-foreground text-sm">
                                {booking.seats.join(', ')} ({booking.seats.length} seat{booking.seats.length > 1 ? 's' : ''})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium">Booked On</p>
                              <p className="text-muted-foreground text-sm">
                                {new Date(booking.bookingTime).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>

                {isUpcoming && (
                  <CardFooter className="p-4 lg:p-6 bg-muted/30 border-t mt-auto">
                    <div className="flex justify-end w-full">
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelClick((booking.id).toString())}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your booking
              and process a refund according to our policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingHistory;
