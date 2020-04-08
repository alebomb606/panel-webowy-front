import React, { Component } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import { LoCos_Point } from '../../assets';

class TooltipMarker extends Component {
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
        const { showInfoWindow } = this.state;
        const { speed, time, lat, lng, t, id } = this.props;
        const anchorPoint = { x: 0, y: 134 };
        return (
            <Marker id={id}
                    zIndex={0}
                    position={{ lat, lng }}
                    icon={{
                        url: LoCos_Point,
                        anchor: new google.maps.Point(34, 34),
                    }}
                    onMouseOver=
                {this.handleMouseOver} onMouseOut={this.handleMouseExit}>
                {showInfoWindow && (
                    <InfoWindow anchorPoint = {anchorPoint} >
                        <h4>{t`speed`}: {speed} {t`kmh`}<br/>{t`time`}: {time}</h4>
                    </InfoWindow>
                )}
            </Marker>
        );
    }
}
export default TooltipMarker;