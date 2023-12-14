import { Observable, map } from 'rxjs';

export const stripProperty = <T, K extends keyof T>(property: K) => {
  return function (source: Observable<T>): Observable<Omit<T, K>> {
    return source.pipe(
      map((value) => {
        const { [property]: _, ...rest } = value;
        return rest;
      })
    );
  };
};
