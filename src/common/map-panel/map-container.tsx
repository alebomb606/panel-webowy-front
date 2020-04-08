import {GoogleMap, Marker, Polyline} from 'react-google-maps';
import React, { createRef, ReactNode } from 'react';

import EventMarkers from './event-markers';
import TrailerMarker from './trailer-marker';
import { Trailer, TrailerId } from '../../trailers/reducer';
import { TrailerEvent } from '../../events/reducer';
import { TrailerPosition } from '../../routes/reducer';
import Tooltip from "react-tooltip-lite";
import TooltipMarker from "./tooltip-marker";
import { useTranslation } from 'react-i18next';

export interface MapContainerProps {
  trailers?: Trailer[];
  loadingEvents?: TrailerEvent[];
  alarmEvents?: TrailerEvent[];
  armedEvents?: TrailerEvent[];
  warningEvents?: TrailerEvent[];
  normalEvents?: TrailerEvent[];
  parkingEvents?: TrailerEvent[];
  unknownEvents?: TrailerEvent[];
  routes?: TrailerPosition[][];
  selectedTrailer?: TrailerId | null;
  children?: ReactNode;
  onMarkerClick?: (id: TrailerId | null) => void;
}

interface MapContainerState {
  center: google.maps.LatLng;
}

class MapContainer extends React.PureComponent<MapContainerProps, MapContainerState> {
  mapRef = createRef<GoogleMap>();

  state = {
    center: new google.maps.LatLng(52, 21),
  };

  static defaultCenter = { lat: 52, lng: 21 };

  static isLatLngLiteral(object: any): object is google.maps.LatLngLiteral {
    return object && typeof object.lat === 'number' && typeof object.lng === 'number';
  }

  static getCenter(props: MapContainerProps, state: MapContainerState) {
    const { trailers = [] } = props;
    if (trailers.length > 1) {
      return state;
    }

    const [trailer] = trailers;
    if (trailer && MapContainer.isLatLngLiteral(trailer.position)) {
      return { center: trailer.position };
    }

    return { center: MapContainer.defaultCenter };
  }

  static getDerivedStateFromProps(props: MapContainerProps, state: MapContainerState) {
    return MapContainer.getCenter(props, state);
  }

  componentDidUpdate(_prevProps: MapContainerProps, prevState: MapContainerState) {
    if (prevState.center !== this.state.center && this.state.center) {
      this.mapRef.current!.panTo(this.state.center);
    }
  }

  render() {
    const {
      trailers = [],
      loadingEvents = [],
      alarmEvents = [],
      armedEvents = [],
      warningEvents = [],
      normalEvents = [],
      parkingEvents = [],
      routes = [],
    } = this.props;
    const { onMarkerClick, children, t } = this.props;

    const trailerMarkers = trailers.map(trailer => <TrailerMarker key={trailer.id} trailer={trailer} />);

    const polylines = [];
    let index = 0;
    const markers = [];

    routes.forEach(points => {

      let previousPoints = [{lat: 0, lng: 0}, {lat: 1, lng: 1}]
      const pointsForPolyline = [];
      let index2 = 0;
      let miss = 0;

      points.forEach( point => {
        let dx1 = previousPoints[0].lat - previousPoints[1].lat;
        let dy1 = previousPoints[0].lng - previousPoints[1].lng;

        let dx2 = previousPoints[1].lat - point.location.lat;
        let dy2 = previousPoints[1].lng - point.location.lng;

        let angle1 = Math.atan(dx1 / dy1);
        let angle2 = Math.atan(dx2 / dy2);

        if ((Math.abs(angle1 - angle2) > 0.04) || miss > 10) {
            previousPoints[0] = previousPoints[1];
            previousPoints[1] = point.location;
            pointsForPolyline.push(point);
            miss = 0;
        }
        else miss++;
      });

      pointsForPolyline.forEach( point => {
        if ( index2 % Math.floor(points.length / 300) == 0 ) {
          markers.push(
              <TooltipMarker id={index2} key={index2} speed={point.speed} time={point.date.toLocaleString()}
                             lat={point.location.lat} lng={point.location.lng} t={t}/>
          );
        }
        index2++;
      });

      polylines.push(<Polyline key={index++} path={pointsForPolyline.map(point => point.location)}/>);
    });

    return (
      <GoogleMap
        ref={this.mapRef}
        options={{
          fullscreenControl: false,
          gestureHandling: 'greedy',
        }}
        onClick={() => onMarkerClick && onMarkerClick(null)}
        defaultCenter={this.state.center}
        defaultZoom={7}
      >
        {trailerMarkers}
        {polylines}
        {markers}
        {children}
        <EventMarkers events={loadingEvents} />
        <EventMarkers events={alarmEvents} />
        <EventMarkers events={armedEvents} />
        <EventMarkers events={warningEvents} />
        <EventMarkers events={parkingEvents} />
        <EventMarkers events={normalEvents} />
      </GoogleMap>
    );
  }
}

export default MapContainer;
