import * as isEqual from 'fast-deep-equal';
import {
  Observable,
  combineLatest,
  debounceTime,
  filter,
  map,
  startWith,
} from 'rxjs';

export const formHasChanges = <U extends Record<string, unknown> | undefined>(
  source: Observable<U>
) => {
  return function <T extends Record<string, unknown>>(
    valueChanges: Observable<T>
  ): Observable<boolean> {
    return combineLatest([source, valueChanges]).pipe(
      debounceTime(100),
      filter((a) => a[0] !== undefined && a[1] !== undefined),
      map(([source, valueChanges]) => {
        // Strip out any properties that are not in the source object
        // This is to handle the case where the source object has more properties than the form
        const sourceAsserted = source as Record<string, unknown>;
        const sourceKeys = Object.keys(sourceAsserted);
        const valueChangesKeys = Object.keys(valueChanges);
        const keys = sourceKeys.filter((x) => valueChangesKeys.includes(x));
        const sourceStripped = keys.reduce(
          (acc, key) => ({ ...acc, [key]: sourceAsserted[key] }),
          {}
        ) as T;
        return [sourceStripped, valueChanges];
      }),
      map(([source, valueChanges]) => isEqual(source, valueChanges) === false),
      startWith(false)
    );
  };
};
