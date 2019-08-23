import Component from '../Component';

export default class TaskRepeat extends Component{
  constructor(data) {
    super();
    this.__copyData = {
      repeat: data.repeat,
      // state: {
      //   isRepeated: data.state.isRepeated,
      // }
    };

    this._repeatingDays = data.repeat;
    // this._state.isRepeated = data.state.isRepeated;

    this._element = null;
    this._state = {
      isRepeated: this._isRepeating()
    };
  }

  get initData() {
    return this.__copyData;
  }

  set isRepeat(value) {
    this._state.isRepeated = value;
  }

  get isRepeat() {
    return this._state.isRepeated;
  }

  /**
   * Проверяет, задача повторяющаяся или нет
   * @returns {boolean}
   * @private
   */
  _isRepeating() {
    return Object.values(this._repeatingDays).some((it) => it === true);
  }

  get template() {
    return `<div>
              <button class="card__repeat-toggle" type="button">
                repeat:<span class="card__repeat-status">${this._state.isRepeated ? 'yes' : 'no'}</span>
              </button>
            <fieldset class="card__repeat-days" ${this._state.isRepeated ? `` : `disabled`}>
              <div class="card__repeat-days-inner">
                ${(Object.keys(this._repeatingDays).map((day) => (`
                <input
                      class="visually-hidden card__repeat-day-input"
                      type="checkbox"
                      id="repeat-${day}-1"
                      name="repeat"
                      value="${day}"
                      ${this._repeatingDays[day] ? 'checked' : ''}/>
                <label class="card__repeat-day" for="repeat-${day}-1">${day}</label>
                `.trim()))).join(``)}
              </div>
            </fieldset>
            </div>`.trim();
  }

  update(data) {
    this._repeatingDays = data.repeat;
    this.__copyData.repeat = data.repeat;
    // this.__copyData.state.isRepeated = data.state.isRepeated;
  }

}
