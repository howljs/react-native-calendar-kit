import { CalendarBody, CalendarContainer } from '@calendar-kit/app';
import { SafeAreaView } from 'react-native';

const minDate = new Date('1979-01-01');
const maxDate = new Date('2100-12-31');

const CalendarApp = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CalendarContainer minDate={minDate} maxDate={maxDate} numberOfDays={7}>
        <CalendarBody />
      </CalendarContainer>
    </SafeAreaView>
  );
};

export default CalendarApp;
