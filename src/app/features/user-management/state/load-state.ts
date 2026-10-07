import { Observable, catchError, map, of, startWith } from 'rxjs';
import { LoadState } from '../models/user-management.models';

/** Catch inside the request so a failed read never terminates its trigger stream. */
export function loadState<T>(
  request: Observable<T>,
  message: string
): Observable<LoadState<T>> {
  return request.pipe(
    map((data) => ({ data, loading: false, error: null })),
    catchError(() =>
      of({ data: null, loading: false, error: message })
    ),
    startWith({ data: null, loading: true, error: null })
  );
}
