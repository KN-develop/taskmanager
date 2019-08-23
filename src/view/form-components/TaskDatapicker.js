import Component from '../Component';

export default class TaskDatapicker extends Component{
  constructor(data) {
    super();
    this.__copyData = {
      dueDate: data.dueDate,
    };

    this._dueDate = data.dueDate;

    this._element = null;
    this._state = {
      // isEdit: false
    };
  }

  get initData() {
    return this.__copyData;
  }


  /*set tags(tag) {
    this._tags.add(tag);
  }*/

  get dueDate() {
    if (this._dueDate) {
      const date = new Date(this._dueDate);
      const timeFormater = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      const monthFormatter = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
      });

      return {
        date: monthFormatter.format(date),
        time: timeFormater.format(date),
      };
    } else {
      return {
        date: '',
        time: '',
      };
    }
  }


  get template() {
    return `<div>
              <label class="card__input-deadline-wrap">
                <input
                  class="card__date js-datepicker"
                  type="text"
                  placeholder="${this.dueDate.date}"
                  name="date"
                  value="${this.dueDate.date}"
                  readonly
                />
              </label>
              <label class="card__input-deadline-wrap">
                <input
                  class="card__time js-timepicker"
                  type="text"
                  placeholder="${this.dueDate.time}"
                  name="time"
                  readonly
                />
              </label>
            </div>`.trim();
  }

  update(data) {
    this._dueDate = data.dueDate;
    this.__copyData.dueDate = data.dueDate;
  }

}
