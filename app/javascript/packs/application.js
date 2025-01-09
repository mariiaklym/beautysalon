import ReactOnRails from 'react-on-rails';
import SystemButtons from '../components/SystemButtons';
import Reservations from '../components/Reservations';
import OwnReservations from '../components/Reservations/ownResevations';
import Table from '../components/Reservations/table';
import Users from '../components/Users';
import ServiceRequests from '../components/ServiceRequests';

// This is how react_on_rails can see the HelloWorld in the browser.
ReactOnRails.register({
  SystemButtons,
  Reservations,
  OwnReservations,
  Table,
  Users,
  ServiceRequests
});
