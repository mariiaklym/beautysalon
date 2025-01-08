import React, {Fragment} from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import Select from "react-select";

export default class Users extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: this.props.users,
      user: this.props.user
    };
  }

  handleUserChange = (user) => {
    $.ajax({
      url: `/users/${user.id}.json`,
      type: 'GET'
    }).then((resp) => {
      if (resp.success) {
        this.setState({
          ...this.state,
          user: resp.user
        });
      } else {
        NotificationManager.error(resp.error, 'Неможливо знайти клієнта');
      }
    })
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

  render() {
    return (
      <div className='container page-content' style={{color: 'black'}}>
        <NotificationContainer/>
        <h1 style={{marginBottom: 20+'px'}}>Клієнти</h1>
        <div className='form-group'>
          <Select options={this.state.users}
                  defaultValue={this.state.user}
                  onChange={this.handleUserChange}
                  placeholder="Вибрати клієнта"
          />
        </div>
        {this.state.user &&
          <Fragment>
            <div className="container wow fadeInUp">
              <div className="row">
                <div className="col-12">
                  <div className="rela-block container">
                    <div className="rela-block profile-card">
                      <div className="rela-block profile-name-container">
                        <div className="rela-block user-name" id="user_name">{this.state.user.name}</div>
                        <div className="rela-block user-desc" id="user_description">
                          <a className='phone' href={`tel:${this.state.user.phone}`}>{this.state.user.phone}</a>
                        </div>
                      </div>
                      <div className="rela-block profile-card-stats">
                        <div className="floated profile-stat spent">{this.state.user.spent} ₴<br/></div>
                        <div className="floated profile-stat visits">{this.state.user.visits}<br/></div>
                        {/*<div className="floated profile-stat following">{user.finals}<br/></div>*/}
                        {/*<div className="floated profile-stat best-laps">{user.best_laps}<br/></div>*/}
                      </div>
                      {/*<div className="rela-block profile-card-stats">*/}
                        {/*<div className="floated profile-stat races-count">{user.races_count}<br/></div>*/}
                        {/*<div className="floated profile-stat best-place">{user.best_place || 0}<br/></div>*/}
                        {/*<div className="floated profile-stat worst-place">{user.worst_place || 0}<br/></div>*/}
                      {/*</div>*/}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <table className='dark' style={{marginTop: 20 + 'px'}}>
              <thead>
              <tr>
                <th><h1>Майстер</h1></th>
                <th><h1>Послуги</h1></th>
                <th><h1>Сума</h1></th>
                <th><h1>Статус</h1></th>
                <th><h1>Нотатки</h1></th>
                <th><h1>Дата</h1></th>
              </tr>
              </thead>
              <tbody>
              {this.state.user.reservations.map((action, i) => {
                return (
                  <tr key={i}>
                    <td>{action.worker}</td>
                    <td>
                      { action.services.map((s, i) => {
                        return (
                          <p key={i}>
                            {s.name}
                          </p>
                        )
                      })}
                    </td>
                    <td>{action.price}<span className='uah'>₴</span></td>
                    <td style={{color: this.status(action.status) && this.status(action.status)['color']}}>{this.status(action.status) && this.status(action.status)['translate']}</td>
                    <td style={{maxWidth: 200+'px', lineBreak: 'anywhere'}}>{action.description}</td>
                    <td>{action.start}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
        </Fragment>}
      </div>
    );
  }
}
