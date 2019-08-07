import Component from '../Component';

export default class TaskTextarea extends Component{
  constructor(data) {
    super();
    this.__copyData = {
      text: data.text,
    };
    this._text = data.text;

    this._element = null;
    this._state = {
      // isEdit: false
    };
  }

  get initData() {
    return this.__copyData;
  }

  set text(value) {
    this._text = value;
  }

  get template() {
    return `<label>
              <textarea
                        class="card__text"
                        placeholder="Start typing your text here..."
                        name="text">${this._text}
              </textarea>
            </label>`.trim();
  }

  update(data) {
    this._text = data.text;
  }

}
