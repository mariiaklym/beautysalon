import React, {Fragment, Children} from 'react';
import { Modal, ModalHeader, ModalFooter, FormGroup, Label, Input, ButtonToggle, Tooltip } from 'reactstrap';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import Select from 'react-select'
import AirBnbPicker from "../common/AirBnbPicker";
import Notice from "../common/Notice";
import TimeRange from 'react-time-range';

export default class Reservations extends React.Component {
  constructor(props) {
    super(props);

    moment.locale('uk');

    this.state = {
      current_user: this.props.current_user,
      users: this.props.users,
      workers: this.props.workers,
      reservations: this.props.reservations,
      openedModal: '',
      selectedDate: new Date(),
      notices: {},
      notices_dates: this.props.notices_counts,
      view: 'month',
      holidays: this.props.holidays,
      selectedReservation: {
        user: {},
        worker: {},
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
    $.ajax({
      url: `users.json`,
      type: 'GET',
      dataType: 'JSON',
      success: (resp) => {
        this.setState({
          ...this.state,
          users: resp.users
        })
      }
    });
  }

  handleModal = (modal) => {
    if (modal.length > 0) {
      this.setState({openedModal: modal})
    } else {
      this.setState({
        ...this.state,
        openedModal: modal,
        selectedReservation: {
          id: '',
          user: {},
          worker: {},
          status: '',
          description: '',
          date: '',
          startTime: moment("08:00", "HH:mm"),
          endTime: moment("09:00", "HH:mm"),
          price: '',
          services: this.props.services.reduce((obj, item) => (obj[item.id] = false, obj), {})
        }
      })
    }
  };

  handleMonthChange = (dates) => {
    $.ajax({
      url: `reservations.json`,
      type: 'GET',
      dataType: 'JSON',
      data: {
        start_date: dates.start ? moment(dates.start).format('DD.MM.YYYY HH:mm') : moment(dates[0]).format('DD.MM.YYYY HH:mm'),
        end_date: dates.end ? moment(dates.end).format('DD.MM.YYYY HH:mm') : moment(dates[0]).format('DD.MM.YYYY HH:mm')
      },
      success: (resp) => {
        this.setState({
          ...this.state,
          reservations: resp.reservations,
          holidays: resp.holidays
        })
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
    const url = this.state.selectedReservation.id ? `/reservations/${this.state.selectedReservation.id}.json` : `reservations.json`;
    const action = this.state.selectedReservation.id ? 'PATCH' : 'POST';
    if (this.state.selectedReservation.date.length === 0) {
      NotificationManager.error('Дата не може бути пустою', 'Неможливо зробити дію');
    } else {
      $.ajax({
        url: url,
        type: action,
        data: {
          reservation: {
            user_id: this.state.selectedReservation.user.value,
            worker_id: this.state.selectedReservation.worker.value || this.state.current_user.id,
            status: this.state.selectedReservation.status,
            description: this.state.selectedReservation.description,
            start_date: this.state.selectedReservation.date + ' ' + moment(this.state.selectedReservation.startTime).format('HH:mm'),
            end_date: this.state.selectedReservation.date + ' ' + moment(this.state.selectedReservation.endTime).format('HH:mm'),
            price: this.state.selectedReservation.price,
            service_ids: services.length === 0 ? [' '] : services
          }
        }
      }).then((resp) => {
        if (resp.success) {
          this.setState({
            ...this.state,
            reservations: resp.reservations,
            openedModal: '',
            selectedReservation: {
              id: '',
              user: {},
              worker: {},
              status: '',
              description: '',
              date: '',
              startTime: moment("08:00", "HH:mm"),
              endTime: moment("09:00", "HH:mm"),
              price: '',
              services: this.props.services.reduce((obj, item) => (obj[item.id] = false, obj), {})
            }
          });
          NotificationManager.success(resp.update ? 'Запис відредаговано' : 'Запис створено');
        } else {
          NotificationManager.error(resp.error, resp.update ? 'Неможливо відредагувати' : 'Неможливо створити');
        }
      });
    }
  };

  handleSelectEvent = (reservation) => {
    this.setState({
      openedModal: 'editModal',
      selectedReservation: {
        id: reservation.id,
        user: reservation.user,
        worker: reservation.worker,
        status: reservation.status,
        description: reservation.description,
        date: moment(reservation.start).format('DD.MM.YYYY'),
        startTime: moment(reservation.start, "HH:mm"),
        endTime: moment(reservation.end, "HH:mm"),
        price: reservation.price,
        services: reservation.services.reduce((obj, item) => (obj[item.id] = true, obj), {})
      }
    })
  };

  handleReservationUserChange = (user) => {
    this.setState({
      ...this.state,
      selectedReservation: {
        ...this.state.selectedReservation,
        user: user
      }
    });
  };

  handleReservationWorkerChange = (worker) => {
    this.setState({
      ...this.state,
      selectedReservation: {
        ...this.state.selectedReservation,
        worker: worker
      }
    });
  };

  handleDeleteReservation = () => {
    if (confirm('Видалити запис?')) {
      $.ajax({
        url: `/reservations/${this.state.selectedReservation.id}.json`,
        type: 'DELETE'
      }).then((resp) => {
        if (resp.success) {
          this.setState({
            ...this.state,
            reservations: resp.reservations,
            openedModal: '',
            selectedReservation: {
              id: '',
              user: {},
              worker: {},
              status: '',
              description: '',
              date: '',
              startTime: moment("08:00", "HH:mm"),
              endTime: moment("09:00", "HH:mm"),
              price: '',
              services: this.props.services.reduce((obj, item) => (obj[item.id] = false, obj), {})
            }
          });
          NotificationManager.success('Запис видалено');
        } else {
          NotificationManager.error(resp.error, 'Неможливо видалити');
        }
      })
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

  eventStyleGetter(event, start, end, isSelected) {
    let hexColor = '';
    if (event.status === 'paid') {
      hexColor = '#0daf46'
    } else if (event.status === 'not_paid') {
      hexColor = '#bf1515'
    } else if (event.status === 'partialy_paid') {
      hexColor = '#e4b60d'
    }
    const style = { backgroundColor: hexColor };
    return { style: style };
  }

  changeDay = (date) => {
    this.setState({ selectedDate: date })
  };

  changeView = (view) => {
    this.setState({ view: view })
  };

  handleNotices = () => {
    $.ajax({
      url: `notices.json`,
      type: 'GET',
      dataType: 'JSON',
      data: {
        date: moment(this.state.selectedDate).format('DD.MM.YYYY'),
      },
      success: (resp) => {
        this.setState({
          ...this.state,
          notices: resp.notices,
          openedModal: 'noticeModal'
        })
      }
    });
  };

  render() {
    const localizer = momentLocalizer(moment);
    const dates = this.state.reservations.map((r,i) => {
      r.start = new Date(r.start),
      r.end   = new Date(r.end)
      return r;
    });

    const ColoredDateCellWrapper = ({children, value}) => {
      const hasNotices = this.state.notices_dates.includes(moment(value).format('DD.MM.YYYY'));
      return React.cloneElement(Children.only(children), {
        style: {
          ...children.style,
          backgroundColor: this.state.holidays.includes(moment(value).format('DD.MM.YYYY')) ? 'rgb(222 19 19 / 15%)' : '',
          border: hasNotices ? '1px solid green' : ''
        },
      });
    };

    console.log('state', this.state)

    return (
      <div style={{marginTop: '150'+'px', padding: 10+'px'}}>
        <NotificationContainer/>
        <Calendar
          views={['month', 'day']}
          onRangeChange={(dates) => this.handleMonthChange(dates)}
          onSelectEvent={(r) => this.handleSelectEvent(r)}
          localizer={localizer}
          events={dates}
          selectable
          scrollToTime={moment().set({ h: 8, m: 0 }).toDate()}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 1100 }}
          eventPropGetter={this.eventStyleGetter}
          components={{ dateCellWrapper: ColoredDateCellWrapper }}
          onView={this.changeView}
          onNavigate={this.changeDay}
        />
        <i className="fa fa-plus-circle" onClick={() => this.handleModal('createModal')} style={{position: 'fixed', bottom: 50, right: 50, fontSize: 200+'px', zIndex: 2}}/>
        { this.state.view === 'day' && <i className="fa fa-clipboard" onClick={() => this.handleNotices()} style={{position: 'fixed', bottom: 50, left: 50, fontSize: 200+'px', zIndex: 2}}/>}
        <Modal isOpen={['createModal', 'editModal'].includes(this.state.openedModal)} toggle={() => this.handleModal('')}>
          <div className="container">
            <ModalHeader toggle={() => this.handleModal('')}>
              <span style={{width: 555+'px'}}><strong>Запис на прийом</strong></span>
              <i className="fa fa-times" onClick={() => this.handleModal('')}/>
            </ModalHeader>
            <div className='reservation-form'>
              { this.state.current_user.role === 'admin' &&
                <div className='form-group'>
                  <label><strong>Майстер</strong></label>
                  <Select options={this.state.workers}
                          defaultValue={this.state.selectedReservation.worker}
                          onChange={this.handleReservationWorkerChange}
                          placeholder="Вибрати майстра"
                  />
                </div>}
              <div className='form-group'>
                <label><strong>Клієнт</strong></label>
                <Select options={this.state.users}
                        defaultValue={this.state.selectedReservation.user}
                        onChange={this.handleReservationUserChange}
                        placeholder="Вибрати клієнта"
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
                <label><strong>Статус</strong></label>
                <hr/>
                <FormGroup tag="fieldset">
                  <FormGroup style={this.state.selectedReservation.status === 'paid' ? {backgroundColor: '#0daf46'} : {}} check>
                    <Label check>
                      <Input type="radio" name="status" value='paid' checked={this.state.selectedReservation.status === 'paid'} onChange={(e) => this.handleReservationChange('status', e.target.value)} />{' '}
                      Оплачено
                    </Label>
                  </FormGroup>
                  <hr/>
                  <FormGroup style={this.state.selectedReservation.status === 'not_paid' ? {backgroundColor: '#bf1515'} : {}} check>
                    <Label check>
                      <Input type="radio" name="status" value='not_paid' checked={this.state.selectedReservation.status === 'not_paid'} onChange={(e) => this.handleReservationChange('status', e.target.value)}/>{' '}
                      Не оплачено
                    </Label>
                  </FormGroup>
                  <hr/>
                  <FormGroup style={this.state.selectedReservation.status === 'partialy_paid' ? {backgroundColor: '#e4b60d'} : {}} check>
                    <Label check>
                      <Input type="radio" name="status" value='partialy_paid' checked={this.state.selectedReservation.status === 'partialy_paid'} onChange={(e) => this.handleReservationChange('status', e.target.value)}/>{' '}
                      Частково оплачено
                    </Label>
                  </FormGroup>
                  <hr/>
                  <FormGroup className={this.state.selectedReservation.status === 'free' ? 'checked-service' : ''} check>
                    <Label check>
                      <Input type="radio" name="status" value='free' checked={this.state.selectedReservation.status === 'free'} onChange={(e) => this.handleReservationChange('status', e.target.value)}/>{' '}
                      Безкоштовно
                    </Label>
                  </FormGroup>
                </FormGroup>
                <hr/>
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
              <div className='form-group'>
                <label><strong>Ціна</strong></label>
                <FormGroup tag="fieldset">
                  <FormGroup>
                    <Label check>
                      <Input value={this.state.selectedReservation.price} onChange={(e) => this.handleReservationChange('price', e.target.value)}/>
                    </Label>
                  </FormGroup>
                </FormGroup>
              </div>
            </div>
            <ModalFooter>
              { this.state.openedModal === 'editModal' &&
                <button className='btn btn-block btn-danger reservation-btn' onClick={this.handleDeleteReservation}>
                  Видалити
                </button>}
              <button className='btn btn-block btn-info reservation-btn' onClick={this.handleSubmitReservation}>{this.state.openedModal === 'createModal' ? 'Створити' : 'Редагувати'}</button>
            </ModalFooter>
          </div>
        </Modal>
        { this.state.view === 'day' &&
          <Modal isOpen={this.state.openedModal === 'noticeModal'} toggle={() => this.handleModal('')}>
            <div className="container">
              <ModalHeader toggle={() => this.handleModal('')}>
                <span><strong>Нотатки ({moment(this.state.selectedDate).format('DD.MM.YYYY')})</strong></span>
                <i className="fa fa-times" onClick={() => this.handleModal('')}/>
              </ModalHeader>
              <Notice notices={this.state.notices} date={this.state.selectedDate}/>
            </div>
          </Modal>}
      </div>
    );
  }
}
