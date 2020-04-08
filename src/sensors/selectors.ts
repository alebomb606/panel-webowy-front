import { createSelector } from 'reselect';
import { State } from '../store';
import { getTrailer } from '../trailers/selectors';

const getSensors = ({ sensors }: State) => sensors.sensors;

export const getTrailerSensors = createSelector(
  [getTrailer, getSensors],
  (trailer, sensors) => {
    if (trailer && trailer in sensors) {
      return sensors[trailer] || null;
    }
    return null;
  },
);
