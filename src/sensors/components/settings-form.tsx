import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import camelToSnake from '../../utils/camel-to-snake';
import styled from '../../theme';
import { SensorTypes, SensorSettings } from '../reducer';

interface SettingsFormProps {
  settings?: SensorSettings;
  changeSettings: (name: keyof SensorSettings, value: SensorSettings[typeof name]) => void;
}

export default function SettingsForm({ settings, changeSettings }: SettingsFormProps) {
  const { t } = useTranslation('sensors');

  if (!settings) {
    return <></>;
  }

  const snakecased = camelToSnake(settings.sensorType);
  const isTemperature = settings.sensorType === SensorTypes.trailerTemperature;
  const isCO2 = settings.sensorType === SensorTypes.carbonDioxideLevel;
  const isDataTransfer = settings.sensorType === SensorTypes.dataTransfer;
  const isFloatingPoint = isTemperature || isDataTransfer;
  const sensorUnit = settings.sensorType ? SensorTypes.getSensorUnit(settings.sensorType) : '';

  const step = isFloatingPoint ? 0.1 : 1;
  const maxValue = isTemperature ? 60 : 99;
  const minValue = isTemperature ? -35 : 0;

  const [alarmPrimaryValue, setAlarmPrimaryValue] = useState(`${settings.alarmPrimaryValue}`);
  const [alarmSecondaryValue, setAlarmSecondaryValue] = useState(`${settings.alarmSecondaryValue}`);
  const [warningPrimaryValue, setWarningPrimaryValue] = useState(`${settings.warningPrimaryValue}`);
  const [warningSecondaryValue, setWarningSecondaryValue] = useState(`${settings.warningSecondaryValue}`);

  const valueSetters: { [key in keyof SensorSettings]?: Function } = {
    alarmPrimaryValue: setAlarmPrimaryValue,
    alarmSecondaryValue: setAlarmSecondaryValue,
    warningPrimaryValue: setWarningPrimaryValue,
    warningSecondaryValue: setWarningSecondaryValue,
  };

  const bufferedChangeSettings = (name: keyof SensorSettings, value: string) => {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed)) {
      changeSettings(name, parsed);
    }
    const setter = valueSetters[name];
    if (typeof setter === 'function') {
      setter(value);
    }
  };

  const getMaxWarningPrimaryValue = () => {
    if (isTemperature) {
      return settings.warningSecondaryValue - step;
    } else if (isCO2) {
      return Math.min(settings.alarmPrimaryValue - step, maxValue - step);
    } else {
      return maxValue;
    }
  };

  const getMinWarningPrimaryValue = () => {
    if (isCO2) {
      return minValue;
    } else {
      return Math.max(settings.alarmPrimaryValue + step, minValue + step);
    }
  };

  const getMaxAlarmPrimaryValue = () => {
    if (isTemperature) {
      return settings.warningPrimaryValue - step;
    } else if (isCO2) {
      return maxValue;
    } else {
      return Math.min(settings.warningPrimaryValue - step, maxValue - step);
    }
  };

  const getMinAlarmPrimaryValue = () => {
    if (isCO2) {
      return Math.max(settings.warningPrimaryValue + step, minValue + step);
    } else {
      return minValue;
    }
  };

  return (
    <>
      {isTemperature && (
        <SettingsRow>
          <SettingsLabel>{snakecased && t(`${snakecased}.critical_level_low`)}</SettingsLabel>
          <SettingsInputWrapper>
            <StyledInput
              step={step}
              value={alarmSecondaryValue}
              onChange={({ target }) => bufferedChangeSettings('alarmSecondaryValue', target.value)}
              onBlur={() => setAlarmSecondaryValue(`${alarmSecondaryValue}`)}
              max={maxValue}
              min={settings.warningSecondaryValue + step}
              required
            />
            {sensorUnit}
          </SettingsInputWrapper>
        </SettingsRow>
      )}
      {isTemperature && (
        <SettingsRow>
          <SettingsLabel>{snakecased && t(`${snakecased}.notifications_low`)}</SettingsLabel>
          <SettingsInputWrapper>
            <StyledInput
              step={step}
              value={warningSecondaryValue}
              onChange={({ target }) => bufferedChangeSettings('warningSecondaryValue', target.value)}
              onBlur={() => setWarningSecondaryValue(`${warningSecondaryValue}`)}
              max={Math.min(settings.alarmSecondaryValue - step, maxValue - step)}
              min={settings.warningPrimaryValue + step}
              required
            />
            {sensorUnit}
          </SettingsInputWrapper>
        </SettingsRow>
      )}
      <SettingsRow>
        <SettingsLabel>{snakecased && t(`${snakecased}.notifications_high`)}</SettingsLabel>
        <SettingsInputWrapper>
          <StyledInput
            step={step}
            value={warningPrimaryValue}
            onChange={({ target }) => bufferedChangeSettings('warningPrimaryValue', target.value)}
            onBlur={() => setWarningPrimaryValue(`${warningPrimaryValue}`)}
            max={getMaxWarningPrimaryValue()}
            min={getMinWarningPrimaryValue()}
            required
          />
          {sensorUnit}
        </SettingsInputWrapper>
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel>{snakecased && t(`${snakecased}.critical_level_high`)}</SettingsLabel>
        <SettingsInputWrapper>
          <StyledInput
            step={step}
            value={alarmPrimaryValue}
            onChange={({ target }) => bufferedChangeSettings('alarmPrimaryValue', target.value)}
            onBlur={() => setAlarmPrimaryValue(`${settings.alarmPrimaryValue}`)}
            max={getMaxAlarmPrimaryValue()}
            min={getMinAlarmPrimaryValue()}
            required
          />
          {sensorUnit}
        </SettingsInputWrapper>
      </SettingsRow>
    </>
  );
}

const SettingsRow = styled.div`
  flex: 100%;
  display: flex;
  align-items: baseline;
`;

const SettingsLabel = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #354052;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const SettingsInputWrapper = styled.div`
  padding: 6px;
  min-width: 72px;
  height: 36px;
  background: #ffffff;
`;

const StyledInput = styled.input.attrs({
  type: 'number',
})`
  margin: 0 10px;
  width: 72px;
  height: 100%;
  font-size: 14px;
  color: #354052;
  text-align: center;
  background: #ffffff;
  border: 1px solid #dfe3e9;
  border-radius: 4px;
  outline: none;
  z-index: 1000;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  & {
    -moz-appearance: textfield;
  }
`;
