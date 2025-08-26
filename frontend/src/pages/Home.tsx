import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Cinema } from '@/types';
import { movieService } from '@/services/movieService';
import { useToast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (cityFilter) {
      const filtered = cinemas.filter(cinema =>
        cinema.location.toLowerCase().includes(cityFilter.toLowerCase())
      );
      setFilteredCinemas(filtered);
    } else {
      setFilteredCinemas(cinemas);
    }
  }, [cinemas, cityFilter]);

  const fetchCinemas = async () => {
    try {
      const data = await movieService.getCinemas();
      setCinemas(data);
      setFilteredCinemas(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cinemas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          Find Your Perfect Cinema
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the best movie experiences in your city. Book tickets for the latest blockbusters.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8 flex flex-col justify-center items-center w-full gap-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => navigate('/search/movie')}
        >
          Search by movie
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCinemas.map((cinema) => (
          <Card
            key={cinema.id}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(`/cinema/${cinema.id}`)}
          >
            <CardHeader>
              <CardTitle className="group-hover:text-primary transition-colors">
                {cinema.name}
              </CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {cinema.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                View Movies
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCinemas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No cinemas found in "{cityFilter}". Try searching for a different city.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
