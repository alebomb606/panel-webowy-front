import React from 'react';
import Datepicker from '../common/datepicker';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';

import Checkbox from './checkbox';
import styled from '../theme';
import { TrailerEventsState } from '../events/reducer';
import { TrailerStates } from '../trailers/types';
import { TrailerEventTypeCategory } from '../events/types';

interface MapFiltersProps {
  container: React.ComponentType;
  description?: string;

  filters: TrailerEventsState['filters'];
  minDate: TrailerEventsState['minDate'];
  maxDate: TrailerEventsState['maxDate'];

  onFilterChange: (filter: TrailerStates, value: boolean) => void;
  onMinDateChange: (date: Date | Moment) => void;
  onMaxDateChange: (date: Date | Moment) => void;
}

interface FilterProps {
  text: string;
  name: string;
  value: boolean;
  onFilterChange: (value: boolean) => void;
  color: string;
  tooltipInfo: string;
  children?: React.ReactNode;
}

const filterGroups: { [key in TrailerEventTypeCategory]: TrailerStates[] } = {
  [TrailerEventTypeCategory.armed]: [TrailerStates.armed, TrailerStates.disarmed],
  [TrailerEventTypeCategory.loading]: [TrailerStates.startLoading, TrailerStates.endLoading],
  [TrailerEventTypeCategory.alarm]: [
    TrailerStates.alarm,
    TrailerStates.silenced,
    TrailerStates.off,
    TrailerStates.resolved,
    TrailerStates.quiet,
    TrailerStates.emergency,
    TrailerStates.shutdownImmediate
  ],
  [TrailerEventTypeCategory.parking]: [
    TrailerStates.truckParkingOn,
  ],
  [TrailerEventTypeCategory.normal]: [
    TrailerStates.truckConnected,
    TrailerStates.truckBatteryNormal,
    TrailerStates.truckEngineOff,
    TrailerStates.truckEngineOn,
    TrailerStates.truckParkingOff,
  ],
  [TrailerEventTypeCategory.warning]: [
      TrailerStates.warning,
      TrailerStates.truckDisconnected,
      TrailerStates.shutdownPending,
      TrailerStates.truckBatteryLow
  ],
  [TrailerEventTypeCategory.unknown]: [],
};

function Filter(props: FilterProps) {
  const { text, name, value, onFilterChange, color, tooltipInfo } = props;
  return (
    <Checkbox
      id={name}
      text={text}
      name={name}
      value={value}
      onChange={onFilterChange}
      checkboxSize={14}
      checkboxColor={color}
      labelColor={color}
      isTooltipEnabled={false}
      tooltipSize={14}
      tooltipColor={'#9b9b9b'}
      tooltipInfo={tooltipInfo}
    />
  );
}

const filterColors: { [key in TrailerEventTypeCategory]: string } = {
  [TrailerEventTypeCategory.alarm]: '#d0021b',
  [TrailerEventTypeCategory.loading]: '#4a90e2',
  [TrailerEventTypeCategory.parking]: '#2a40c2',
  [TrailerEventTypeCategory.armed]: '#64be00',
  [TrailerEventTypeCategory.warning]: '#FFD700',
  [TrailerEventTypeCategory.normal]: '#b0b0b0',
  [TrailerEventTypeCategory.unknown]: '#9b9b9b',
};

export default function EventFilters(props: MapFiltersProps) {
  const { t } = useTranslation('enum');
  const filters = Object.entries(filterGroups)
    .filter(
      ([category]) =>
        TrailerEventTypeCategory.isTrailerEventCategory(category) && category !== TrailerEventTypeCategory.unknown,
    )
    .map(([category, filters]) => {
      const value = filters.every(filter => props.filters[filter]);
      const onFilterChange = (value: boolean) => filters.forEach(filter => props.onFilterChange(filter, value));
      return (
        <Filter
          key={category}
          name={category}
          value={value}
          text={t(TrailerEventTypeCategory.toReadableName(category as TrailerEventTypeCategory))}
          tooltipInfo={t(TrailerEventTypeCategory.toReadableInfo(category as TrailerEventTypeCategory))}
          onFilterChange={onFilterChange}
          color={filterColors[category as TrailerEventTypeCategory]}
        />
      );
    });

  const today = moment().endOf('day');
  const minDate = moment(today)
    .subtract(1, 'month')
    .startOf('day');
  const maxDate = today;
  const Container = props.container || React.Fragment;

  const validMinDate = (date: Moment) => {
    const isValid = date.isValid();
    const isBetween = date.isSameOrAfter(minDate) && date.isBefore(maxDate);
    return isValid && isBetween;
  };

  const validMaxDate = (date: Moment) => {
    const isValid = date.isValid();
    const isBetween = date.isAfter(minDate) && date.isSameOrBefore(maxDate);
    return isValid && isBetween;
  };

  return (
    <Container>
      <FiltersDescription>{props.description}</FiltersDescription>
      {filters}
      <FilterContainer>
        <StyledDatepicker
          pickerType="minDate"
          date={props.minDate}
          onPickerChange={props.onMinDateChange}
          selectsStart={true}
          startDate={props.minDate}
          endDate={props.maxDate}
          minDate={minDate.toDate()}
          maxDate={props.maxDate}
          highlightDates={[new Date()]}
          validDate={validMinDate}
        />
      </FilterContainer>
      <FilterContainer>
        <StyledDatepicker
          pickerType="maxDate"
          date={props.maxDate}
          onPickerChange={props.onMaxDateChange}
          selectsEnd={true}
          startDate={props.minDate}
          endDate={props.maxDate}
          minDate={props.minDate}
          maxDate={maxDate.toDate()}
          highlightDates={[new Date(Date.now())]}
          validDate={validMaxDate}
        />
      </FilterContainer>
    </Container>
  );
}

const FiltersDescription = styled.span`
  margin-right: 25px;
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: #9b9b9b;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const FilterContainer = styled.label`
  flex: 1 0 auto;
  display: inline-flex;
  justify-content: center;
  color: #354052;
  &::first-letter {
    text-transform: uppercase;
  }
`;

const StyledDatepicker = styled(Datepicker)`
  width: 100px;
  height: 30px;
  font-size: 12px;
  color: #b0b0b0;
  text-align: center;
  border: 1px solid #dfe3e9;
  border-radius: 4px;
  outline: none !important;
`;
