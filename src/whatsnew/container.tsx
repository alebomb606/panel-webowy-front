import React from "react";
import {connect} from "react-redux";
import styled from "../theme";
import {Trans} from "react-i18next";


function WhatsnewRoute() {

    return (
        <Container>
            <Trans i18nKey={"whatsnew_20200221"}>
                <h1>Version 20200221</h1>
                <h2>UI Improvements</h2>
                <ul>
                    <li>Trailer OFFLINE indicator is extended by an informative message</li>
                    <li>Map contains markers with time and speed of a trailer - appear when hovering over</li>
                    <li>If image or video from camera is unavailable, the eye icon turns to red with a message</li>
                    <li>Parking events are displayed on the Map (Parking icon)</li>
                    <ul>
                        <li>Trailer is "parked" if engine is switched off.</li>
                    </ul>
                    <li>Engine ON/OFF events are available on Events Pane, Events Detail Pane and Map:
                    </li>
                    <li>Battery level indicator is calculated using physical discharge curve.</li>
                    <li>14-days recording history is made available.</li>
                    <li>Trailer reconnects regularly if looses network coverage.</li>
                </ul>
                <h2>Technical improvements</h2>
                <ul>
                    <li>Invalid GPS points from the device are filtered to prevent route disturbance.</li>
                    <li>Regular reconnect is implemented if trailer goes out of network temporarily.</li>
                    <li>DB searches are optimised, cleanup procedure is implemented.</li>
                </ul>
            </Trans>
            <Trans i18nKey={"whatsnew_20200202"}>
                <h1>Version 20200202</h1>
                <h2>UI Improvements</h2>
                <ul>
                    <li>"What's New" panel, that highlights all updates and fixes since last version</li>
                    <li>Now last time when the Panel has got an update from the trailer is displayed ("Last login")</li>
                    <li>Trailer engine ON/OFF indicator in Navigation Pane and in Details Pane.</li>
                    <li>Trailer ONLINE/OFFLINE indicator in Navigation Pane and in Details Pane.</li>
                        <ul>
                            <li>Trailer is "online" if status update has come during last 30 seconds.</li>
                        </ul>
                    <li>New Trailer events are available on Events Pane, Events Detail Pane and Map:
                        <ul>
                            <li>Truck disconnected from / connected to trailer</li>
                            <li>Truck battery is low / is Ok</li>
                            <li>System shutdown is approaching (5 min to shutdown)</li>
                            <li>System shutdown is in progress</li>
                        </ul>
                    </li>
                    <li>GPS route is made much smoother and fault-proof:
                        <ul>
                            <li>GPS points are recorded every 2 seconds</li>
                            <li>GPS points are delivered to the server every 30 seconds</li>
                            <li>If the Trailer goes offline, GPS points are stacked on the device and delivered when network connects.</li>
                        </ul>
                    </li>
                    <li>Fixed screen glitches (login screen error message, language resources)</li>
                    <li>h.264 parameters optimized for all cameras</li>
                    <li>All cameras are set up to use GPS time to synchronize the internal clock.</li>
                </ul>
                <h2>Technical improvements</h2>
                <ul>
                    <li>Web Panel performance is optimised in production.</li>
                    <li>Resolved all code issues from RSpec, tests run without warnings.</li>
                    <li>DB structure and Backend performance is optimised</li>
                </ul>
            </Trans>
        </Container>
    );
}

export default connect(
)(WhatsnewRoute);

const Container = styled.div`
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: 1920px;
  min-height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;