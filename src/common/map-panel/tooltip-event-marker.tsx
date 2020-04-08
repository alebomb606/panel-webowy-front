import React, {Component, memo} from 'react';
import {InfoWindow, Marker} from 'react-google-maps';

import {eventmarkerblue, eventmarkergray, eventmarkergreen, eventmarkerred, eventparkingblue, eventmarkeryellow} from '../../assets';
import {TrailerEvent} from '../../events/reducer';
import {TrailerStates} from '../../trailers/types';
import {TrailerEventTypeCategory} from '../../events/types';

const getEventMarker = (event: TrailerEvent) => {
  const category = TrailerStates.toCategory(event.type);

  switch (category) {
    case TrailerEventTypeCategory.armed:
      return eventmarkergreen;
    case TrailerEventTypeCategory.loading:
      return eventmarkerblue;
    case TrailerEventTypeCategory.alarm:
      return eventmarkerred;
    case TrailerEventTypeCategory.parking:
      return eventparkingblue;
    case TrailerEventTypeCategory.warning:
      return eventmarkeryellow;
    case TrailerEventTypeCategory.normal:
    default:
      return eventmarkergray;
  }
};

const getEventOrder = (event: TrailerEvent) => {
    const category = TrailerStates.toCategory(event.type);

    switch (category) {
        case TrailerEventTypeCategory.armed:
            return 4;
        case TrailerEventTypeCategory.loading:
            return 8;
        case TrailerEventTypeCategory.alarm:
            return 32;
        case TrailerEventTypeCategory.parking:
            return 1;
        case TrailerEventTypeCategory.warning:
            return 16;
        case TrailerEventTypeCategory.normal:
        default:
            return 2;
    }
};

const getEventPosition = (event: TrailerEvent) => {
    const category = TrailerStates.toCategory(event.type);

    let x = 16, y = 24;
    let a = 0, b = 0;

    switch (category) {
        case TrailerEventTypeCategory.armed:
            a = 1; b = 1; break;
        case TrailerEventTypeCategory.loading:
            a = 1; b = -1; break;
        case TrailerEventTypeCategory.alarm:
            a = -1; b = -1; break;
        case TrailerEventTypeCategory.normal:
            a = 1; b = -1; break;
        case TrailerEventTypeCategory.warning:
            a = -1; b = 1; break;
        case TrailerEventTypeCategory.parking:
        default:
            a = 0; b = 0;
    }

    return new google.maps.Point( x + a * 8, y + b * 12)
};

class TooltipEventMarker extends Component {
    state = {
        showInfoWindow: false
    };
    handleMouseOver = e => {
        this.setState({
            showInfoWindow: true
        });
    };
    handleMouseExit = e => {
        this.setState({
            showInfoWindow: false
        });
    };

    render() {
        const {showInfoWindow} = this.state;
        const {event, t} = this.props;

        if (!event.location || (event.location.lat === 0 && event.location.lng === 0)) return <></>;
        return (
            <Marker
                id={event.id}
                zIndex={getEventOrder(event)}
                icon={{
                    anchor: getEventPosition(event),
                    url: getEventMarker(event),
                    size: new google.maps.Size(32, 48),
                }}
                options={{
                    position: event.location,
                }}
                onMouseOver=
                    {this.handleMouseOver} onMouseOut={this.handleMouseExit}>
                {showInfoWindow && (
                    <InfoWindow>
                        <h4>{t(TrailerStates.toReadableName(event.type))}<br/>{t`time`}: {event.date.toLocaleString()}</h4>
                    </InfoWindow>
                )}
            </Marker>
        );
    }
}

export default TooltipEventMarker;