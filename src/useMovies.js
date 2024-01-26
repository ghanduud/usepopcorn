import { useState, useEffect } from 'react';

const KEY = '93a19eec';
//apikey=93a19eec

export function useMovies(query) {
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(
		function () {
			const controller = new AbortController();
			fetchMovies(query, controller);
			return () => controller.abort();
		},
		[query]
	);

	async function fetchMovies(query, controller) {
		try {
			if (query.length < 3) {
				setMovies([]);
				setError('');
				return;
			}
			setIsLoading(true);
			setError('');
			const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {
				signal: controller.signal,
			});
			if (!res.ok) throw new Error('Somthing went wrong with fetching movies');
			const data = await res.json();
			if (data.Response === 'False') throw new Error('Movie not found ...');
			setMovies(data.Search);
			setError('');
		} catch (e) {
			if (e.name !== 'AbortError') setError(e.message);
		} finally {
			setIsLoading(false);
		}
	}

	return { movies, isLoading, error };
}
