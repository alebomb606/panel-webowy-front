import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, EmailIcon, PhoneIcon } from '../../common/icons';
import { SensorSettings } from '../reducer';
import SettingsForm from './settings-form';
import styled from '../../theme';
import { Link } from 'react-router-dom';

interface SettingsProps {
  settings: SensorSettings;
  onCancelGoBackToTrailer: string | false;
  updateSensorSettings: (settings: SensorSettings) => void;
  cancel: () => void;
  save: () => void;
}

export default function Settings(props: SettingsProps) {
  const { settings, updateSensorSettings, onCancelGoBackToTrailer, cancel, save } = props;

  const changeSettings = (name: keyof SensorSettings, value: SensorSettings[typeof name]) => {
    if (!settings) {
      return;
    }
    if (name === 'phoneNumbers' || name === 'emailAddresses') {
      const filtered = (value as Array<any>).filter((val, index, array) => val || index === array.length - 1);
      updateSensorSettings({ ...settings, [name]: filtered });
    } else {
      updateSensorSettings({ ...settings, [name]: value });
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  const { t } = useTranslation('sensors');

  return (
    <SensorSettings ref={formRef} onSubmit={(event: React.FormEvent<HTMLFormElement>) => event.preventDefault()}>
      <SettingsHeadline>{t`settings`}</SettingsHeadline>
      <SettingsForm settings={settings} changeSettings={changeSettings} />
      <SettingsHeadline>{t`notifications`}</SettingsHeadline>
      <CheckboxWrapper>
        <CheckboxLabel>
          <Checkbox
            checked={Boolean(settings && settings.sendEmail)}
            onChange={event => changeSettings('sendEmail', event.currentTarget.checked)}
          />
          {t`notifications_emails`}
        </CheckboxLabel>
      </CheckboxWrapper>
      <InputContainer>
        <Label>{t`email_address`}</Label>
        {settings &&
          settings.emailAddresses.map((address, index) => (
            <InputWrapper key={index}>
              <InputElement>
                <EmailIcon
                  color={'#dfe3e9'}
                  backgroundColor={'transparent'}
                  active={false}
                  wrapperSize={33}
                  iconSize={17}
                />
                <EmailInput
                  value={address}
                  required={settings.sendEmail}
                  type="email"
                  onChange={({ target }) =>
                    changeSettings('emailAddresses', [
                      ...settings.emailAddresses.slice(0, index),
                      target.value,
                      ...settings.emailAddresses.slice(index + 1),
                    ])
                  }
                />
              </InputElement>
              {settings.emailAddresses.length > 1 && (
                <CloseIcon
                  wrapperSize={20}
                  iconSize={20}
                  color={'#dfe3e9'}
                  backgroundColor={'transparent'}
                  active={true}
                  onClick={() =>
                    changeSettings('emailAddresses', [
                      ...settings.emailAddresses.slice(0, index),
                      ...settings.emailAddresses.slice(index + 1),
                    ])
                  }
                />
              )}
            </InputWrapper>
          ))}
        {settings.emailAddresses[settings.emailAddresses.length - 1].length > 0 && (
          <AdditionalEmail
            onClick={() =>
              settings && settings.emailAddresses && changeSettings('emailAddresses', [...settings.emailAddresses, ''])
            }
          >{t`email_add`}</AdditionalEmail>
        )}
      </InputContainer>
      <CheckboxWrapper>
        <CheckboxLabel>
          <Checkbox
            checked={Boolean(settings && settings.sendSms)}
            onChange={event => changeSettings('sendSms', event.currentTarget.checked)}
          />
          {t`sms_notification`}
        </CheckboxLabel>
      </CheckboxWrapper>
      <InputContainer>
        <Label>{t`phone_number`}</Label>
        {settings &&
          settings.phoneNumbers.map((number, index) => (
            <InputWrapper key={index}>
              <InputElement>
                <PhoneIcon
                  color={'#dfe3e9'}
                  backgroundColor={'transparent'}
                  active={false}
                  wrapperSize={33}
                  iconSize={17}
                />
                <PhoneInput
                  required={settings.sendSms}
                  pattern="[0-9+* ]*"
                  type="tel"
                  value={number}
                  onChange={({ target }) =>
                    changeSettings('phoneNumbers', [
                      ...settings.phoneNumbers.slice(0, index),
                      target.value,
                      ...settings.phoneNumbers.slice(index + 1),
                    ])
                  }
                />
              </InputElement>
              {settings.phoneNumbers.length > 1 && (
                <CloseIcon
                  wrapperSize={20}
                  iconSize={20}
                  color={'#dfe3e9'}
                  backgroundColor={'transparent'}
                  active={true}
                  onClick={() =>
                    changeSettings('phoneNumbers', [
                      ...settings.phoneNumbers.slice(0, index),
                      ...settings.phoneNumbers.slice(index + 1),
                    ])
                  }
                />
              )}
            </InputWrapper>
          ))}
        {settings.phoneNumbers[settings.phoneNumbers.length - 1].length > 0 && (
          <AdditionalEmail
            onClick={() =>
              settings && settings.phoneNumbers && changeSettings('phoneNumbers', [...settings.phoneNumbers, ''])
            }
          >{t`phone_number_add`}</AdditionalEmail>
        )}
      </InputContainer>
      <ButtonsWrapper>
        <SaveButton onClick={() => formRef.current!.checkValidity() && save()}>{t`save`}</SaveButton>
        <Link to={`/trailers/${onCancelGoBackToTrailer}`}>
          <CancelButton onClick={() => cancel()}>{t`cancel`}</CancelButton>
        </Link>
      </ButtonsWrapper>
    </SensorSettings>
  );
}

const SensorSettings = styled.form`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
`;

const SettingsHeadline = styled.div`
  &::first-letter {
    text-transform: capitalize;
  }
  margin-top: 25px;
  margin-bottom: 5px;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.25;
  flex: 100%;
`;

const CheckboxWrapper = styled.div`
  margin: 25px 0 10px 0;
`;

const Checkbox = styled.input.attrs({
  type: 'checkbox',
})`
  width: 18px;
  height: 18px;
  border-radius: 2px;
  z-index: 1000;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: #354052;
  display: flex;
  align-items: center;
  z-index: 1000;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const InputContainer = styled.div`
  padding-left: 50px;
  flex: 100%;
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: baseline;
`;

const InputElement = styled.div`
  margin-top: 5px;
  width: 100%;
  max-width: 320px;
  display: flex;
  align-items: center;
  border: 1px solid #dfe3e9;
  border-radius: 2px;
`;

const Label = styled.label`
  font-size: 14px;
  line-height: 1.5;
  color: #354052;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const EmailInput = styled.input`
  padding: 6px 8px 6px 0;
  width: 100%;
  font-size: 14px;
  line-height: 1.5;
  color: #354052;
  border: none;
  outline: none;
  border-radius: 2px;
  z-index: 1000;

  &::placeholder {
    color: #dfe3e9;
  }
`;

const AdditionalEmail = styled.a`
  text-transform: uppercase;
  margin-top: 10px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 2.2;
  text-decoration: none;
  color: #4390e5;
  cursor: pointer;
`;

const PhoneInput = styled.input`
  padding: 6px 8px 6px 0;
  width: 100%;
  font-size: 14px;
  line-height: 1.5;
  color: #354052;
  border: none;
  outline: none;
  border-radius: 2px;
  z-index: 1000;

  &::placeholder {
    color: #dfe3e9;
  }
`;

const ButtonsWrapper = styled.div`
  margin-top: 20px;
  flex: 100%;
  display: flex;
`;

const SaveButton = styled.button`
  margin: 5px;
  padding: 8px 52px;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: #ffffff;
  background-color: #4a90e2;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const CancelButton = styled.button`
  margin: 5px;
  padding: 8px 52px;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: #ffffff;
  background-color: #cccccc;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  &::first-letter {
    text-transform: capitalize;
  }
`;
