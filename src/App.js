import { useEffect, useRef, useState } from 'react';
import StarRating from './StarRating';
import { useMovies } from './useMovies';
import { useLocalStorageState } from './useLocalStorageState';
import { useKey } from './useKey';

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '93a19eec';
//apikey=93a19eec

export default function App() {
	const [query, setQuery] = useState('');
	const [selectedID, setSelectedID] = useState(null);

	const { movies, isLoading, error } = useMovies(query);

	const [watched, setWatched] = useLocalStorageState([], 'watched');

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	function handleSelectMovie(movieID) {
		setSelectedID(movieID);
	}

	function handleCloseMovie() {
		setSelectedID(null);
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((m) => m.imdbID !== id));
	}

	return (
		<>
			<NavBar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>

			<Main>
				<Box>
					{isLoading && <Loader />}
					{!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
					{error && <ErrorMessage message={error} />}
				</Box>

				<Box>
					{selectedID ? (
						<MovieDetails
							onCloseMovie={handleCloseMovie}
							selectedID={selectedID}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummery watched={watched} />
							<WatchedList watched={watched} onDeleteWatched={handleDeleteWatched} />
						</>
					)}
				</Box>
			</Main>
		</>
	);
}

function Loader() {
	return <p className='loader'>LOADING...</p>;
}

function ErrorMessage({ message }) {
	return (
		<p className='error'>
			<span>🛑</span> {message}
		</p>
	);
}

function NavBar({ children }) {
	return (
		<nav className='nav-bar'>
			<Logo />
			{children}
		</nav>
	);
}

function Logo() {
	return (
		<div className='logo'>
			<span role='img'>🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function Search({ query, setQuery }) {
	const inputEl = useRef(null);

	useKey('Enter', () => {
		if (document.activeElement === inputEl.current) return;
		inputEl.current.focus();
		setQuery('');
	});

	return (
		<input
			className='search'
			type='text'
			placeholder='Search movies...'
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
		/>
	);
}

function NumResults({ movies }) {
	return (
		<p className='num-results'>
			Found <strong>{movies.length}</strong> results
		</p>
	);
}

function Main({ children }) {
	return <main className='main'>{children}</main>;
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);
	function onSetIsOpen() {
		setIsOpen((s) => !s);
	}

	return (
		<div className='box'>
			<IsOpenBtn onClick={onSetIsOpen}>{isOpen ? '–' : '+'}</IsOpenBtn>
			{isOpen && children}
		</div>
	);
}

function IsOpenBtn({ children, onClick }) {
	return (
		<button className='btn-toggle' onClick={onClick}>
			{children}
		</button>
	);
}

function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className='list list-movies'>
			{movies?.map((movie) => (
				<Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
			))}
		</ul>
	);
}

function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

function WatchedSummery({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));

	return (
		<div className='summary'>
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating.toFixed(1)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(1)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime.toFixed(0)} min</span>
				</p>
			</div>
		</div>
	);
}

function WatchedList({ watched, onDeleteWatched }) {
	return (
		<ul className='list'>
			{watched.map((movie) => (
				<WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
			))}
		</ul>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>

				<button className='btn-delete' onClick={() => onDeleteWatched(movie.imdbID)}>
					&times;
				</button>
			</div>
		</li>
	);
}

function MovieDetails({ selectedID, onCloseMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState('');

	const countRef = useRef(0);

	const isWatched = watched.find((movie) => movie.imdbID === selectedID);
	const watchedUserRating = watched.find((movie) => movie.imdbID === selectedID)?.userRating;

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedID,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(' ').at(0)),
			userRating,
			countRatingDecisions: countRef.current,
		};

		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	async function getMovieDetails(id) {
		try {
			setIsLoading(true);
			const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${id}`);
			if (!res.ok) throw new Error('Somthing went wrong with fetching movies');
			const data = await res.json();
			setMovie(data);
			setIsLoading(false);
		} catch (e) {
			console.log(e);
		}
	}

	useEffect(
		function () {
			if (userRating) countRef.current = countRef.current + 1;
		},
		[userRating]
	);

	useEffect(() => {
		getMovieDetails(selectedID);
	}, [selectedID]);

	function changeTitle() {
		if (!title) return;
		document.title = `Movie | ${title}`;
		return () => (document.title = 'usePopcorn');
	}

	useEffect(changeTitle, [title]);

	useKey('Escape', onCloseMovie);

	return isLoading ? (
		<Loader />
	) : (
		<div className='details'>
			<header>
				<button className='btn-back' onClick={onCloseMovie}>
					&larr;
				</button>
				<img src={poster} alt={`poster of the ${title} movie`} />
				<div className='details-overview'>
					<h2>{title}</h2>
					<p>
						{released} &bull; {runtime}
					</p>
					<p>{genre}</p>
					<p>
						<span>⭐</span> {imdbRating} IMDB Rating
					</p>
				</div>
			</header>
			<section>
				{isWatched ? (
					<div className='rating'>You rated that movie with {watchedUserRating}⭐</div>
				) : (
					<div className='rating'>
						<StarRating maxRating={10} size={24} onSetRating={setUserRating} />
						{userRating > 0 && (
							<button className='btn-add' onClick={handleAdd}>
								+ Add to the list
							</button>
						)}
					</div>
				)}
				<p>
					<em>{plot}</em>
				</p>
				<p>Starring {actors}</p>
				<p>Directed by {director} </p>
			</section>
		</div>
	);
}
