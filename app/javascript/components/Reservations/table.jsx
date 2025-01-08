import React, {Fragment} from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import AirBnbPicker from '../common/AirBnbPicker';
import moment from "moment";

export default class Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      actions: this.props.reservations,
      startDate: moment().clone().startOf('month').format('DD.MM.YYYY'),
      endDate: moment().clone().endOf('month').format('DD.MM.YYYY')
    };
  }

  handleDateChange = ({startDate, endDate}) => {
    $.ajax({
      url: '/table.json',
      type: 'GET',
      data: {
        status: this.state.status,
        start_date: startDate.format('DD.MM.YYYY'),
        end_date: endDate.format('DD.MM.YYYY')
      },
      success: (resp) => {
        this.setState({
          ...this.state,
          actions: resp.reservations,
          startDate: startDate ? startDate.format('DD.MM.YYYY') : null,
          endDate: endDate ? endDate.format('DD.MM.YYYY') : null
        });
      }
    });
  };

  summary = () => {
    let sumArray = [];
    this.state.actions.map((action, index) => {
      return sumArray.push(parseFloat(action.price))
    });
    return (sumArray.reduce((a, b) => a + b, 0)).toFixed(2)
  };

  status = (status) => {
    const translations = {
      paid: {translate: 'Оплачено', color: '#0daf46'},
      not_paid: {translate: 'Не оплачено', color: '#bf1515'},
      partialy_paid: {translate: 'Частково оплачено', color: '#e4b60d'},
      free: {translate: 'Безкоштовно', color: 'white'},
    };
    const merged = Object.assign(this.props.statuses, translations);
    return merged[status] || '';
  };

  handleStatusChange = (status) => {
    $.ajax({
      url: '/table.json',
      type: 'GET',
      data: {
        status: status,
        start_date: this.state.startDate,
        end_date: this.state.endDate
      },
      success: (resp) => {
        this.setState({
          ...this.state,
          actions: resp.reservations,
          status: status
        });
      }
    });
  };

  render() {
    return (
      <div className='container page-content' style={{color: 'black'}}>
        <NotificationContainer/>
        <div className="row">
          <div className="col-6">
            <h1>Записи</h1>
          </div>
          <div className="col-6">
            <FormGroup className='mt-3'>
              <Input type="select" name="status" id="status" onChange={(e) => this.handleStatusChange(e.target.value)}>
                <option value=''>Всі записи</option>
                { Object.keys(this.props.statuses).map((status, i) => {
                  return (
                    <option key={i} value={status}>{this.status(status) && this.status(status)['translate']}</option>
                  )}
                )}
              </Input>
            </FormGroup>
          </div>
        </div>
        <hr/>
        <div className='date-header'>
          <h1>{this.summary()}<span className='uah'>₴</span></h1>
          <AirBnbPicker
            single={false}
            pastDates={true}
            oneDay={true}
            onPickerApply={this.handleDateChange}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
          />
        </div>
        <table className='dark' style={{marginTop: 20 + 'px'}}>
          <thead>
          <tr>
            <th><h1>Майстер</h1></th>
            <th><h1>Клієнт</h1></th>
            <th><h1>Сума</h1></th>
            <th><h1>Статус</h1></th>
            <th><h1>Послуги</h1></th>
            <th><h1>Нотатки</h1></th>
            <th><h1>Дата</h1></th>
          </tr>
          </thead>
          <tbody>
          { this.state.actions.map((action, i) => {
            return (
              <tr key={i}>
                <td><a style={{color: '#FB667A'}} href={`/users?id=${action.worker.id}`}>{action.worker.name}</a></td>
                <td><a style={{color: '#FB667A'}} href={`/users?id=${action.user.id}`}>{action.user.name}</a></td>
                <td>{action.price}<span className='uah'>₴</span></td>
                <td style={{color: this.status(action.status) && this.status(action.status)['color']}}>{this.status(action.status) && this.status(action.status)['translate']}</td>
                <td>
                  { action.services.map((s, i) => {
                    return (
                      <p style={{color: '#FB667A'}} key={i}>
                        {s.name}
                      </p>
                    )
                  })}
                </td>
                <td style={{maxWidth: 200+'px', lineBreak: 'anywhere'}}>{action.description}</td>
                <td>{action.created_at}</td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>
    );
  }
}
