import React from 'react';
import { WithGoogleMapProps, withGoogleMap } from 'react-google-maps';

import MapContainer, { MapContainerProps } from './map-container';
import {useTranslation} from "react-i18next";

export type MapPanelProps = Partial<WithGoogleMapProps> & MapContainerProps;

const EnhancedMap = withGoogleMap(MapContainer);

export default function MapPanel(props: MapPanelProps) {
  const {
    containerElement = <div className="container-element" style={{ height: `245px` }} />,
    mapElement = <div className="map-element" style={{ height: `100%` }} />,
    ...rest
  } = props;

  const { t } = useTranslation();

  return <EnhancedMap containerElement={containerElement} mapElement={mapElement} t={t} {...rest} />;
}
