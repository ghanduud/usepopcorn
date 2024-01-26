import { useEffect } from 'react';

export function useKey(key, action) {
	useEffect(addEventToKey, [action, key]);

	function addEventToKey() {
		function callback(e) {
			if (e.code.toLowerCase() === key.toLowerCase()) {
				action();
			}
		}

		document.addEventListener('keydown', callback);
		return () => document.removeEventListener('keydown', callback);
	}
}
