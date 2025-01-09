import React from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import moment from 'moment'
import Select from 'react-select'
import AirBnbPicker from "./common/AirBnbPicker";
import TimeRange from 'react-time-range';

export default class ServiceRequests extends React.Component {
  constructor(props) {
    super(props);

    moment.locale('uk');

    this.state = {
      services: this.props.services.reduce((obj, item) => (obj[item.id] = false, obj), {}),
      workers: this.props.workers,
      selectedReservation: {
        user: {},
        worker_id: '',
        status: '',
        description: '',
        date: '',
        startTime: moment("08:00", "HH:mm"),
        endTime: moment("09:00", "HH:mm"),
        price: '',
        services: this.props.services.reduce((obj, item) => (obj[item.id] = false, obj), {})
      }
    };
  }

  componentDidMount() {

  }

  handleReservationUserChange = (field, value) => {
    this.setState({
      ...this.state,
      selectedReservation: {
        ...this.state.selectedReservation,
        user: {
          ...this.state.selectedReservation.user,
          [field]: value.currentTarget.value
        }
      }
    });
  };

  handleReservationChange = (field, value) => {
    this.setState({
      ...this.state,
      selectedReservation: {
        ...this.state.selectedReservation,
        [field]: value
      }
    })
  }
;
  handleDateChange = ({date}) => {
    this.setState({
      ...this.state,
      selectedReservation: {
        ...this.state.selectedReservation,
        date: date ? date.format('DD.MM.YYYY') : null
      }
    });
  };

  handleTimeChange = (time) => {
    this.setState({
      ...this.state,
      selectedReservation: {
        ...this.state.selectedReservation,
        startTime: time.startTime,
        endTime: time.endTime

      }
    });
  };

  handleSubmitReservation = () => {
    const services = Object.entries(this.state.selectedReservation.services).filter(([, v]) => v === true).map(([k]) => k);
    if (this.state.selectedReservation.date.length === 0) {
      NotificationManager.error('Дата не може бути пустою', 'Неможливо зробити дію');
    } else {
      $.ajax({
        url: '/service_requests.json',
        type: 'POST',
        data: {
          reservation: {
            user: {
              email: this.state.selectedReservation.user.email,
              name: this.state.selectedReservation.user.name,
              phone: this.state.selectedReservation.user.phone,
              password: this.state.selectedReservation.user.password,
            },
            worker_id: this.state.selectedReservation.worker_id,
            description: this.state.selectedReservation.description,
            start_date: this.state.selectedReservation.date + ' ' + moment(this.state.selectedReservation.startTime).format('HH:mm'),
            end_date: this.state.selectedReservation.date + ' ' + moment(this.state.selectedReservation.endTime).format('HH:mm'),
            price: this.state.selectedReservation.price,
            service_ids: services.length === 0 ? [' '] : services
          }
        }
      }).then((resp) => {
        if (resp.success) {
          window.location.href = '/service_requests';
          NotificationManager.success('Запис створено');
        } else {
          NotificationManager.error(resp.error, 'Неможливо створити');
        }
      });
    }
  };

  handleServicesChange = (price, value) => {
    this.setState(prevState => {
      const prevPrice = prevState.selectedReservation.price ? parseInt(prevState.selectedReservation.price) : 0;
      const prevCheck = prevState.selectedReservation.services[value];
      let newPrice = 0;
      if (prevCheck) {
        newPrice = prevPrice - parseInt(price);
      } else {
        newPrice = prevPrice + parseInt(price);
      }
      return {
        ...this.state,
        selectedReservation: {
          ...this.state.selectedReservation,
          price: newPrice,
          services: {
            ...this.state.selectedReservation.services,
            [value]: !this.state.selectedReservation.services[value]
          }
        }
      }
    })
  };

  render() {

    console.log('state', this.state)

    return (
      <div style={{marginTop: '150'+'px', padding: 10+'px'}}>
        <NotificationContainer/>
        <div className="container">
            <h1 className='mb-5'><strong>Запис на прийом</strong></h1>
          <div className='reservation-form'>
            <div className='card mb-5'>
              <div className='card-body'>
                <h1 className='mb-5'>Ваші дані</h1>
                <FormGroup>
                  <div className='service-block'>
                    <Label>Email</Label>
                    <Input value={this.state.selectedReservation.user.email}
                           onChange={(v) => this.handleReservationUserChange('email', v)}
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <div className='service-block'>
                    <Label>Ім'я</Label>
                    <Input value={this.state.selectedReservation.user.name}
                           onChange={(v) => this.handleReservationUserChange('name', v)}
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <div className='service-block'>
                    <Label>Телефон</Label>
                    <Input value={this.state.selectedReservation.user.phone}
                           onChange={(v) => this.handleReservationUserChange('phone', v)}
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <div className='service-block'>
                    <Label>Пароль</Label>
                    <Input value={this.state.selectedReservation.user.password} type='password'
                           onChange={(v) => this.handleReservationUserChange('password', v)}
                    />
                  </div>
                </FormGroup>
              </div>
            </div>
            <div className='card mb-5'>
              <div className='card-body'>
                <h1 className='mb-5'>Дані резервування</h1>
                <div className='form-group'>
                  <label><strong>Майстер</strong></label>
                  <Select options={this.state.workers}
                          defaultValue={this.state.selectedReservation.worker}
                          onChange={(v) => this.handleReservationChange('worker_id', v.value)}
                          placeholder="Вибрати майстра"
                  />
                </div>
                <div className='form-group'>
                  <div className="row">
                    <div className="col-6">
                      <label><strong>Дата</strong></label>
                      <AirBnbPicker
                        single={true}
                        pastDates={true}
                        onPickerApply={this.handleDateChange}
                        date={this.state.selectedReservation.date}
                      />
                    </div>
                    <div className="col-6">
                      <label><strong>Час</strong></label>
                      <TimeRange
                        showErrors={false}
                        use24Hours
                        startLabel=''
                        endLabel='-'
                        startMoment={this.state.selectedReservation.startTime}
                        endMoment={this.state.selectedReservation.endTime}
                        onChange={(e) => this.handleTimeChange(e)}
                      />
                    </div>
                  </div>
                </div>
                <div className='form-group'>
                  <label><strong>Додаткова інформація</strong></label>
                  <textarea rows="3" type='text' className='form-control' value={this.state.selectedReservation.description} onChange={(e) => this.handleReservationChange('description', e.target.value)} />
                </div>
                <div className='form-group'>
                  <label><strong>Послуги</strong></label>
                  <FormGroup tag="fieldset">
                    { this.props.services.map((s,i) => {
                      return (
                        <div className={this.state.selectedReservation.services[s.id] ? 'checked-service' : ''} key={i}>
                          <hr/>
                          <FormGroup key={i} check>
                            <div className='service-block'>
                              <Label check>
                                <Input type="checkbox" value={s.id} checked={this.state.selectedReservation.services[s.id]} onChange={(e) => this.handleServicesChange(s.price, e.target.value)}/>{' '}
                                {s.name}
                              </Label>
                              <Input className="service-price" value={s.price} disabled/>
                            </div>
                          </FormGroup>
                        </div>
                      )
                    })}
                  </FormGroup>
                </div>
                <hr/>
                { !!this.state.selectedReservation.price &&
                  <div className='form-group'>
                    <label><strong>Ціна</strong></label>
                    <h1><b>{this.state.selectedReservation.price}<span className='uah'>₴</span></b></h1>
                  </div>}
              </div>
            </div>
          </div>
          <button className='btn btn-block btn-info reservation-btn' onClick={this.handleSubmitReservation}>
            Замовити
          </button>
        </div>
      </div>
    );
  }
}
