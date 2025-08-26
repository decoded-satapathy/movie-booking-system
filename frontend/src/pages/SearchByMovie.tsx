import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



import { movieService } from "../services/movieService";
import { Movie } from "../types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const SearchByMovie = () => {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await movieService.getMovies();
        setAllMovies(fetchedMovies);
        setFilteredMovies(fetchedMovies);
      } catch (error) {
        console.error("Movie fetching failed:", error);
        toast.error("Movie fetching failed");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8">
      <form className="flex w-full max-w-lg items-center space-x-2 mb-8">
        <Input
          type="text"
          placeholder="Search by movie title"
          value={movieTitle}
          onChange={(e) => {
            setMovieTitle(e.target.value);
            const searchTerm = e.target.value.trim().toLowerCase();
            const filtered = allMovies.filter(movie =>
              movie.title.toLowerCase().includes(searchTerm)
            );
            setFilteredMovies(filtered);
          }}
        />
      </form>

      <div className="my-8 w-full flex flex-col justify-center items-center max-w-lg overflow-y-auto">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <button
              onClick={() => navigate(`/movie/${movie.id}`)}
              key={movie.id}
              className="w-9/12 my-2 flex flex-row items-center border-2 rounded-lg p-4 space-x-4 cursor-pointer"
            >
              <img
                className="w-[70px] h-[105px] rounded-lg object-cover"
                src={movie.posterUrl}
                alt={movie.title}
              />
              <p
                className="w-full text-left font-semibold">
                {movie.title}
              </p>
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500">No movies found.</p>
        )}
      </div>
    </div >
  );
};

export default SearchByMovie;
