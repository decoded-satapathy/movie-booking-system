import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Show } from '@/types';
import { movieService } from '@/services/movieService';
import { toast } from 'sonner';

const MovieDetail: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const [shows, setShows] = useState<Show[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (movieId) {
      fetchMovieShows(parseInt(movieId));
    }
  }, [movieId]);

  const fetchMovieShows = async (id: number) => {
    try {
      const data = await movieService.getShowsByMovieId(id);
      if (data && data.length > 0) {
        setShows(data);
      }
    } catch (error) {
      toast.error('Failed to load movie details. Please try again.');
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

  if (!shows || shows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-xl text-muted-foreground">No shows available for this movie.</p>
      </div>
    );
  }

  const showsByCinema = shows.reduce((acc: Record<string, Show[]>, show) => {
    if (show?.screen?.cinema) {
      const cinemaName = show.screen.cinema.name;
      if (!acc[cinemaName]) {
        acc[cinemaName] = [];
      }
      acc[cinemaName].push(show);
    }
    return acc;
  }, {});

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

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Available Showtimes</h1>
        <p className="text-xl text-muted-foreground">at various cinemas</p>
      </div>

      <div className="space-y-6">
        {Object.entries(showsByCinema).map(([cinemaName, cinemaShows]) => (
          <Card key={cinemaName}>
            <CardHeader>
              <CardTitle className="text-2xl">{cinemaName}</CardTitle>
              <CardDescription>{cinemaShows[0]?.screen?.cinema?.location}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cinemaShows.map(show => (
                <div key={show.id}>
                  <Button
                    onClick={() => navigate(`/booking/${show.id}`)}
                    className="w-full flex flex-col h-auto p-4 items-start bg-white dark:bg-black/50 border-2 hover:bg-gray-100 hover:dark:bg-gray-900"
                  >
                    <span className="text-lg font-bold text-black dark:text-white">₹{show.price}</span>
                    <span className="text-xs text-black/70 dark:text-white/70 ">{formatShowtime(show.showtime)}</span>
                    <Badge variant="outline" className="mt-2 text-black dark:text-white ">{show.screen.name}</Badge>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MovieDetail;
