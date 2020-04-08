import { Alert, ArmAlert } from '../header/components/arm-alert';
import { AlarmAlert } from '../header/components/alarm-alert';
import { ModalActions } from './actions';
import styled from '../theme';

import Monitoring from '../monitoring/container';
import {MediaWarning} from "../monitoring/components/media-warning";

export enum ModalComponentTypes {
  imagePreview = 'imagePreview',
  monitoring = 'monitoring',
  alert = 'alert',
  armAlert = 'armAlert',
  alarmAlert = 'alarmAlert',
  mediaWarning = 'mediaWarning',
}

export type ModalProps = any;

const ImagePreview = styled.img`
  height: 90%;
  width: auto;
`;

export const ModalComponents: { [key in ModalComponentTypes]: React.ComponentType<any> } = {
  imagePreview: ImagePreview,
  monitoring: Monitoring,
  armAlert: ArmAlert,
  alarmAlert: AlarmAlert,
  alert: Alert,
  mediaWarning: MediaWarning,
};

export interface UiState {
  modal: {
    open: boolean;
    type: ModalComponentTypes | null;
    props?: ModalProps;
  };
}

const initialState: UiState = {
  modal: {
    open: false,
    type: null,
  },
};

export default function reducer(state: UiState = initialState, action: Action): UiState {
  switch (action.type) {
    case ModalActions.openModal:
      return {
        ...state,
        modal: { open: true, type: action.payload.type, props: action.payload.props },
      };
    case ModalActions.closeModal:
      return {
        ...state,
        modal: { open: false, type: null },
      };
    default:
      return state;
  }
}
