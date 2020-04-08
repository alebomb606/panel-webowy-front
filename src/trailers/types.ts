import {TrailerEventTypeCategory} from '../events/types';

export enum TrailerStates {
  startLoading = 'TrailerStates.startLoading',
  endLoading = 'TrailerStates.endLoading',
  alarm = 'TrailerStates.alarm',
  silenced = 'TrailerStates.silenced',
  off = 'TrailerStates.off',
  resolved = 'TrailerStates.resolved',
  armed = 'TrailerStates.armed',
  disarmed = 'TrailerStates.disarmed',
  quiet = 'TrailerStates.quiet',
  emergency = 'TrailerStates.emergency',
  warning = 'TrailerStates.warning',
  ok = 'TrailerStates.ok',
  unknown = 'TrailerStates.unknown',
  truckEngineOn = 'TrailerStates.truckEngineOn',                      // ADDED https://www.wrike.com/open.htm?id=445612989
  truckEngineOff = 'TrailerStates.truckEngineOff',                    // END
  truckParkingOn = 'TrailerStates.truckParkingOn',                      // ADDED https://www.wrike.com/open.htm?id=485426010
  truckParkingOff = 'TrailerStates.truckParkingOff',                    // END
  networkOn = 'TrailerStates.networkOn',
  networkOff = 'TrailerStates.networkOff',
  truckDisconnected = 'TrailerStates.truckDisconnected',    // ADDED https://www.wrike.com/open.htm?id=450195737
  truckConnected = 'TrailerStates.truckConnected',          //
  shutdownPending = 'TrailerStates.shutdownPending',        //
  shutdownImmediate = 'TrailerStates.shutdownImmediate',    //
  truckBatteryLow = 'TrailerStates.truckBatteryLow',        //
  truckBatteryNormal = 'TrailerStates.truckBatteryNormal',  // END
}

export enum TrailerPermissions {
  alarmControl = 'alarmControl', //kontrola alarmu
  alarmResolveControl = 'alarmResolveControl', //kontrola rozwiązywania alarmów
  currentPosition = 'currentPosition', //aktualna pozycja
  eventLogAccess = 'eventLogAccess', //dziennik zdarzeń
  loadInModeControl = 'loadInModeControl', //kontrola trybu ładowania
  monitoringAccess = 'monitoringAccess', //dostęp do monitoringu
  photoDownload = 'photoDownload', //pobieranie zdjęć
  routeAccess = 'routeAccess', //dostęp do tras
  sensorAccess = 'sensorAccess', //czujniki
  systemArmControl = 'systemArmControl', //kontrola uzbrajania systemu
  videoDownload = 'videoDownload', //pobieranie wideo
}

export namespace TrailerStates {
  export function isTrailerState(value: any): value is TrailerStates {
    if (!value) {
      return false;
    }
    return Object.values(TrailerStates).includes(value);
  }

  export function toReadableName(name: TrailerStates = TrailerStates.unknown) {
    switch (name) {
      case TrailerStates.startLoading:
        return 'TrailerStates.startLoading';
      case TrailerStates.endLoading:
        return 'TrailerStates.endLoading';
      case TrailerStates.resolved:
        return 'TrailerStates.resolved';
      case TrailerStates.alarm:
        return 'TrailerStates.alarm';
      case TrailerStates.silenced:
        return 'TrailerStates.silenced';
      case TrailerStates.off:
        return 'TrailerStates.off';
      case TrailerStates.armed:
        return 'TrailerStates.armed';
      case TrailerStates.disarmed:
        return 'TrailerStates.disarmed';
      case TrailerStates.quiet:
        return 'TrailerStates.quiet';
      case TrailerStates.emergency:
        return 'TrailerStates.emergency';
      case TrailerStates.warning:
        return 'TrailerStates.warning';
      case TrailerStates.ok:
        return 'TrailerStates.ok';
      case TrailerStates.truckEngineOn:
        return 'TrailerStates.truckEngineOn';                // ADDED https://www.wrike.com/open.htm?id=445612989
      case TrailerStates.truckEngineOff:
        return 'TrailerStates.truckEngineOff';               // END
      case TrailerStates.truckParkingOn:
        return 'TrailerStates.truckParkingOn';                // ADDED https://www.wrike.com/open.htm?id=445612989
      case TrailerStates.truckParkingOff:
        return 'TrailerStates.truckParkingOff';               // END
      case TrailerStates.networkOn:
        return 'TrailerStates.networkOn';
      case TrailerStates.networkOff:
        return 'TrailerStates.networkOff';
      case TrailerStates.truckDisconnected:
        return 'TrailerStates.truckDisconnected';       // ADDED https://www.wrike.com/open.htm?id=450195737
      case TrailerStates.truckConnected:
        return 'TrailerStates.truckConnected';          //
      case TrailerStates.shutdownPending:
        return  'TrailerStates.shutdownPending';        //
      case TrailerStates.shutdownImmediate:
        return 'TrailerStates.shutdownImmediate';       //
      case TrailerStates.truckBatteryLow:
        return 'TrailerStates.truckBatteryLow';         //
      case TrailerStates.truckBatteryNormal:
        return 'TrailerStates.truckBatteryNormal';      // END

      default:
        return 'TrailerStates.unknown';
    }
  }

  export function toCategory(name: TrailerStates = TrailerStates.unknown): TrailerEventTypeCategory {
    switch (name) {
      case TrailerStates.startLoading:
      case TrailerStates.endLoading:
        return TrailerEventTypeCategory.loading;
      case TrailerStates.alarm:
      case TrailerStates.silenced:
      case TrailerStates.off:
      case TrailerStates.resolved:
      case TrailerStates.quiet:
      case TrailerStates.emergency:
      case TrailerStates.shutdownImmediate:
        return TrailerEventTypeCategory.alarm;
      case TrailerStates.armed:
      case TrailerStates.disarmed:
        return TrailerEventTypeCategory.armed;
      case TrailerStates.warning:
      case TrailerStates.shutdownPending:
      case TrailerStates.truckBatteryLow:
      case TrailerStates.truckDisconnected:
        return TrailerEventTypeCategory.warning;
      case TrailerStates.networkOff:
      case TrailerStates.networkOn:
        return TrailerEventTypeCategory.network;
      case TrailerStates.truckParkingOff:
      case TrailerStates.truckParkingOn:
        return TrailerEventTypeCategory.parking;
      case TrailerStates.truckEngineOff:
      case TrailerStates.truckEngineOn:
      case TrailerStates.truckConnected:
      case TrailerStates.truckBatteryNormal:
        return TrailerEventTypeCategory.normal;
      case TrailerStates.ok:
      default:
        return TrailerEventTypeCategory.unknown;
    }
  }

  export function toTrailerMarkerCategory(name: TrailerStates = TrailerStates.unknown): TrailerEventTypeCategory {
    switch (name) {
      case TrailerStates.startLoading:
      case TrailerStates.endLoading:
        return TrailerEventTypeCategory.loading;
      case TrailerStates.alarm:
      case TrailerStates.silenced:
      case TrailerStates.off:
      case TrailerStates.resolved:
      case TrailerStates.quiet:
      case TrailerStates.emergency:
      case TrailerStates.shutdownImmediate:
        return TrailerEventTypeCategory.alarm;
      case TrailerStates.armed:
      case TrailerStates.disarmed:
        return TrailerEventTypeCategory.armed;
      case TrailerStates.warning:
      case TrailerStates.shutdownPending:
      case TrailerStates.truckBatteryLow:
      case TrailerStates.truckDisconnected:
        return TrailerEventTypeCategory.warning;
      case TrailerStates.truckParkingOff:
      case TrailerStates.truckParkingOn:
        return TrailerEventTypeCategory.parking;
      case TrailerStates.truckEngineOff:
      case TrailerStates.truckEngineOn:
      case TrailerStates.truckConnected:
      case TrailerStates.truckBatteryNormal:
        return TrailerEventTypeCategory.normal;
      case TrailerStates.ok:
      default:
        return TrailerEventTypeCategory.unknown;
    }
  }

  export function toColor(name: TrailerStates = TrailerStates.unknown) {
    switch (name) {
      case TrailerStates.startLoading:
      case TrailerStates.endLoading:
        return '#606f91';
      case TrailerStates.shutdownImmediate:
      case TrailerStates.alarm:
      case TrailerStates.silenced:
      case TrailerStates.off:
      case TrailerStates.resolved:
      case TrailerStates.quiet:
      case TrailerStates.emergency:
        return '#d0021b';
      case TrailerStates.armed:
      case TrailerStates.disarmed:
        return '#7ed321';
      case TrailerStates.truckParkingOff:
      case TrailerStates.truckParkingOn:
        return '#2a40c2';
      case TrailerStates.shutdownPending:
      case TrailerStates.truckBatteryLow:
      case TrailerStates.truckDisconnected:
      case TrailerStates.warning:
        return '#dccd0a';
      case TrailerStates.ok:
      case TrailerStates.truckEngineOff:
      case TrailerStates.truckEngineOn:
      case TrailerStates.truckConnected:
      case TrailerStates.truckBatteryNormal:
      default:
        return '#a0a0a0';
    }
  }

  export function from(object: any) {
    switch (object) {
      case 'start_loading':
      case 0:
        return TrailerStates.startLoading;
      case 'end_loading':
      case 1:
        return TrailerStates.endLoading;
      case 'alarm':
      case 2:
        return TrailerStates.alarm;
      case 'alarm_silenced':
      case 3:
        return TrailerStates.silenced;
      case 'alarm_resolved':
        return TrailerStates.resolved;
      case 'alarm_off':
      case 4:
        return TrailerStates.off;
      case 'armed':
      case 5:
        return TrailerStates.armed;
      case 'disarmed':
      case 6:
        return TrailerStates.disarmed;
      case 'quiet_alarm':
      case 9:
        return TrailerStates.quiet;
      case 'emergency_call':
      case 8:
        return TrailerStates.emergency;
      case 'warning':
      case 7:
        return TrailerStates.warning;
      case 'truck_disconnected':
      case 11:
        return TrailerStates.truckDisconnected;
      case 'truck_connected':
      case 12:
        return TrailerStates.truckConnected;
      case 'shutdown_pending':
      case 13:
        return TrailerStates.shutdownPending;
      case 'shutdown_immediate':
      case 14:
        return TrailerStates.shutdownImmediate;
      case 'truck_battery_low':
      case 15:
        return TrailerStates.truckBatteryLow;
      case 'ok':
        return TrailerStates.ok;
      case 'truck_battery_normal':
      case 16:
        return TrailerStates.truckBatteryNormal;
      case 'engine_off':
      case 17:
        return TrailerStates.truckEngineOff;
      case 'engine_on':
      case 18:
        return TrailerStates.truckEngineOn;
      case 'parking_on':
      case 19:
        return TrailerStates.truckParkingOn;
      case 'parking_off':
      case 20:
        return TrailerStates.truckParkingOff;
      default:
        return TrailerStates.unknown;
    }
  }

  export function toApiParam(state: TrailerStates = TrailerStates.unknown) {
    switch (state) {
      case TrailerStates.startLoading:
        return 'start_loading';
      case TrailerStates.endLoading:
        return 'end_loading';
      case TrailerStates.alarm:
        return 'alarm';
      case TrailerStates.silenced:
        return 'alarm_silenced';
      case TrailerStates.off:
        return 'alarm_off';
      case TrailerStates.resolved:
        return 'alarm_resolved';
      case TrailerStates.armed:
        return 'armed';
      case TrailerStates.disarmed:
        return 'disarmed';
      case TrailerStates.quiet:
        return 'quiet_alarm';
      case TrailerStates.emergency:
        return 'emergency_call';
      case TrailerStates.warning:
        return 'warning';
      case TrailerStates.truckEngineOn:
        return 'engine_on';
      case TrailerStates.truckEngineOff:
        return 'engine_off';
      case TrailerStates.truckParkingOn:
        return 'parking_on';
      case TrailerStates.truckParkingOff:
        return 'parking_off';
      case TrailerStates.shutdownImmediate:
        return 'shutdown_immediate';
      case TrailerStates.shutdownPending:
        return 'shutdown_pending';
      case TrailerStates.truckBatteryLow:
        return 'truck_battery_low';
      case TrailerStates.truckBatteryNormal:
        return 'truck_battery_normal';
      case TrailerStates.truckDisconnected:
        return 'truck_disconnected';
      case TrailerStates.truckConnected:
        return 'truck_connected';
      default:
      case TrailerStates.ok:
      case TrailerStates.unknown:
        return 'ok';
    }
  }
}
