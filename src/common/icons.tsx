import React, { ComponentType } from 'react';
import { MdiReactIconProps } from 'mdi-react';
import styled from '../theme';

import AccountCheckOutline from 'mdi-react/AccountCheckOutlineIcon';
import CalendarBlankOutline from 'mdi-react/CalendarBlankOutlineIcon';
import Check from 'mdi-react/CheckIcon';
import ChevronDown from 'mdi-react/ChevronDownIcon';
import ChevronRight from 'mdi-react/ChevronRightIcon';
import ChevronUp from 'mdi-react/ChevronUpIcon';
import Close from 'mdi-react/CloseIcon';
import CloseBoxOutline from 'mdi-react/CloseBoxOutlineIcon';
import Email from 'mdi-react/EmailIcon';
import EyeOutline from 'mdi-react/EyeOutlineIcon';
import EyeOffOutline from 'mdi-react/EyeOffOutlineIcon';
import FlagOutline from 'mdi-react/FlagOutlineIcon';
import Fullscreen from 'mdi-react/FullscreenIcon';
import InformationOutline from 'mdi-react/InformationOutlineIcon';
import LightbulbOutline from 'mdi-react/LightbulbOutlineIcon';
import Phone from 'mdi-react/PhoneIcon';
import PlayCircle from 'mdi-react/PlayCircleIcon';
import Truck from 'mdi-react/TruckIcon';
import Video from 'mdi-react/VideoIcon';

interface IconProps {
  wrapperSize: number | string;
  color: string;
  backgroundColor: string;
  hoverColor?: string;
  backgroundHoverColor?: string;
  active: boolean;
  onClick?: () => void;
}

interface MdiIconProps {
  iconSize: number | string;
}

type Props = IconProps & MdiIconProps;

const Icon = styled.div<IconProps>`
  width: ${props => props.wrapperSize};
  height: ${props => props.wrapperSize};
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.backgroundColor};

  .mdi-icon {
    path {
      fill: ${props => props.color};
    }
  }

  &:hover {
    cursor: ${props => (props.active ? 'pointer' : 'default')};
    background-color: ${props => props.backgroundHoverColor};

    .mdi-icon {
      path {
        fill: ${props => props.hoverColor};
      }
    }
  }
`;

function createIcon(MdiReactIcon: ComponentType<MdiReactIconProps>) {
  return (props: Props) => {
    const {
      wrapperSize,
      iconSize,
      color,
      backgroundColor,
      active,
      hoverColor,
      backgroundHoverColor,
      onClick,
      ...rest
    } = props;

    return (
      <Icon
        wrapperSize={wrapperSize}
        color={color}
        backgroundColor={backgroundColor}
        active={active}
        hoverColor={hoverColor || color}
        backgroundHoverColor={backgroundHoverColor || backgroundColor}
        onClick={onClick}
        {...rest}
      >
        <MdiReactIcon size={iconSize} />
      </Icon>
    );
  };
}

export const AccountCheckOutlineIcon = createIcon(AccountCheckOutline);
export const CalendarBlankOutlineIcon = createIcon(CalendarBlankOutline);
export const CheckIcon = createIcon(Check);
export const ChevronDownIcon = createIcon(ChevronDown);
export const ChevronRightIcon = createIcon(ChevronRight);
export const ChevronUpIcon = createIcon(ChevronUp);
export const CloseBoxOutlineIcon = createIcon(CloseBoxOutline);
export const CloseIcon = createIcon(Close);
export const EmailIcon = createIcon(Email);
export const EyeOutlineIcon = createIcon(EyeOutline);
export const EyeOffOutlineIcon = createIcon(EyeOffOutline);
export const FlagOutlineIcon = createIcon(FlagOutline);
export const FullscreenIcon = createIcon(Fullscreen);
export const InformationOutlineIcon = createIcon(InformationOutline);
export const LightbulbOutlineIcon = createIcon(LightbulbOutline);
export const PhoneIcon = createIcon(Phone);
export const PlayCircleIcon = createIcon(PlayCircle);
export const TruckIcon = createIcon(Truck);
export const VideoIcon = createIcon(Video);
