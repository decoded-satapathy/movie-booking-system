import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import { Movie } from '@/types';
import { movieService } from '@/services/movieService';
import { useToast } from '@/hooks/use-toast';

const CinemaDetail: React.FC = () => {
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (cinemaId) {
      fetchMovies(parseInt(cinemaId));
    }
  }, [cinemaId]);

  const fetchMovies = async (id: number) => {
    try {
      const data = await movieService.getMoviesByCinema(id);
      setMovies(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatShowtime = (showtime: string) => {
    return new Date(showtime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cinemas
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Now Showing</h1>
        <p className="text-xl text-muted-foreground">Choose your movie and showtime</p>
      </div>

      <div className="space-y-8">
        {movies.map((movie) => (
          <Card key={movie.id}>
            <div className="flex flex-col md:flex-row md:justify-center md:items-center">
              <div className="md:w-1/4 p-6">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop`;
                  }}
                />
              </div>
              <div className="md:w-3/4 p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl">{movie.title}</CardTitle>
                  <CardDescription className="text-base">
                    {movie.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Available Showtimes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {movie.shows?.map((show) => (
                      <Card
                        key={show.id}
                        className="hover:shadow-md transition-all cursor-pointer group border"
                        onClick={() => navigate(`/booking/${show.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">
                              {show.screen.name}
                            </Badge>
                            <span className="text-lg font-bold">₹{show.price}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatShowtime(show.showtime)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No movies currently showing at this cinema.</p>
        </div>
      )}
    </div>
  );
};

export default CinemaDetail;
