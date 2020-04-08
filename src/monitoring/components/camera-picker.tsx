import React from 'react';

import styled from '../../theme';
import { truck } from '../../assets';
import { useTranslation } from 'react-i18next';
import { MonitoringCameras } from '../types';

interface Props {
  picked?: MonitoringCameras;
  onChange: (camera: MonitoringCameras) => void;
}

export default function({ picked, onChange }: Props) {
  const { t } = useTranslation('monitoring');

  const renderRadio = (camera: MonitoringCameras) => (
    <Radio
      onChange={() => {
        onChange(camera);
      }}
      checked={picked === camera}
    />
  );

  return (
    <>
      <Header>{t`choose_camera`}</Header>
      <CameraPicker>
        <Top>
          {renderRadio(MonitoringCameras.leftTop)}
          {renderRadio(MonitoringCameras.interior)}
          {renderRadio(MonitoringCameras.rightTop)}
        </Top>
        <Bottom>
          {renderRadio(MonitoringCameras.leftBottom)}
          {renderRadio(MonitoringCameras.exterior)}
          {renderRadio(MonitoringCameras.rightBottom)}
        </Bottom>
      </CameraPicker>
    </>
  );
}

const Radio = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <RadioLabel>
    <RadioInput checked={checked} onChange={onChange} />
    <RadioIcon />
  </RadioLabel>
);

const Header = styled.div`
  height: 44px;
  width: 145px;
  font-size: 12px;
  color: #4a4a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f6f8;
  text-transform: capitalize;
`;

const Top = styled.div`
  display: flex;
  flex: 1;
  width: 75%;
  margin: 0 auto;
`;
const Bottom = styled(Top)``;

const RadioContainer = styled.label`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;
  &:nth-of-type(2) {
    padding-top: 60px;
  }
`;

const CameraPicker = styled.div`
  width: 145px;
  height: 220px;
  border-radius: 4px;
  background-color: #f4f6f8;
  display: flex;
  flex-direction: column;
  background-image: url('${truck}');
  background-position: center 10%;
  background-size: auto 85%;
  background-repeat: no-repeat;
`;

const RadioLabel = styled(RadioContainer)`
  cursor: pointer;
  position: relative;
  & :checked + :before {
    position: relative;
    display: block;
    top: 1px;
    left: 1px;
    content: '';
    width: 14px;
    border-radius: 50%;
    height: 14px;
    background-color: #4a90e2;
  }
`;

const RadioInput = styled.input.attrs({
  type: 'radio',
  name: 'camera',
})`
  display: none;
`;

const RadioIcon = styled.div`
  display: block;
  width: 20px;
  height: 20px;
  background-color: #edf4fc;
  border: solid 2px #4a90e2;
  border-radius: 50%;
`;
