import React from 'react';

export default class OwnReservations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      actions: this.props.reservations
    };
  }

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
        <h1>Мої записи</h1>
        <table className='dark' style={{marginTop: 20 + 'px'}}>
          <thead>
          <tr>
            <th><h1>Майстер</h1></th>
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
