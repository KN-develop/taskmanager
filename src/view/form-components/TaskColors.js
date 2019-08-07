import Component from '../Component';

export default class TaskColors extends Component{
  constructor(data) {
    super();
    this.__copyData = {
      colors: data.colors,
    };
    this._colors = data.colors;

    this._element = null;
    this._state = {
      // isEdit: false
    };
  }

  get initData() {
    return this.__copyData;
  }


  get template() {
    return `<div class="card__colors-wrap">
              ${(Object.keys(this._colors).map((color) => (`
              <input
                type="radio"
                id="color-${color}-1"
                class="card__color-input card__color-input--${color} visually-hidden"
                name="color"
                value="${color}"
                ${this._colors[color] ? `checked` : ``}
              />
              <label
                for="color-${color}-1"
                class="card__color card__color--${color}">${color}</label>
              `.trim()))).join(``)}
            </div>`.trim();
  }

  update(data) {
    this._colors = data.colors;
  }

}
