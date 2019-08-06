import createElement from "../service/create-element";
import Component from './Component';

export default class TaskEdit extends Component{
  constructor(data) {
    super();
    this._modelId = data.modelId;
    this._text = data.text;
    this._dueDate = data.dueDate;
    this._id = data.id;
    this._image = data.image;
    this._tags = data.tags;
    this._repeatingDays = data.repeat;
    this._colors = data.colors;
    this._checkColor = Object.entries(this._colors).find((element)=> element[1] && true)[0];
    this._isFavorites = data.isFavorites;
    this._isArchive = data.archive;

    this._element = null;
    this._onSubmit = null;
    this._onReject = null;
    this._onDelete = null;
    this._onFavorites = null;
    this._onArchive = null;

    this._state.isDate = !!data.dueDate;
    this._state.checkedDate = '';
    this._state.isRepeated = this._isRepeating();

    this._onEditButtonClick = this._onEditButtonClick.bind(this);
    this._onSubmitButtonClick = this._onSubmitButtonClick.bind(this);
    this._onDeleteButtonClick = this._onDeleteButtonClick.bind(this);
    this._onChangeDate = this._onChangeDate.bind(this);
    this._onChangeRepeated = this._onChangeRepeated.bind(this);
    this._onInputHashtag = this._onInputHashtag.bind(this);
    this._onDeleteHashtag = this._onDeleteHashtag.bind(this);
    this._onFavoriteButtonClick = this._onFavoriteButtonClick.bind(this);
    this._onArchiveButtonClick = this._onArchiveButtonClick.bind(this);
    this._onClickWithoutTask = this._onClickWithoutTask.bind(this);
    this._onFocusDateInput = this._onFocusDateInput.bind(this);
    this._onCheckedDate = this._onCheckedDate.bind(this);
  }

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

  _isRepeating() {
    return Object.values(this._repeatingDays).some((it) => it === true);
  }

  _setColor() {
    for (let color in this._colors) {
      if (this._colors[color]) {
        return color;
      }
    }
  }

  _onCheckedDate(evt) {
    const date = evt.detail;
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const momentDate = moment({
      year: year,
      month: month,
      day: day
    });
    // console.log(momentDate.format('MMMM D, YYYY'));
    this._state.checkedDate = date.getTime();
  }

  _onSubmitButtonClick(evt) {
    evt.preventDefault();
    const formData = new FormData(this._element.querySelector(`.card__form`));
    const newData = this._processForm(formData);
    typeof this._onSubmit === `function` && this._onSubmit(newData);
    this.update(newData);
  }
  _onEditButtonClick() {
    typeof this._onSubmit === `function` && this._onSubmit();
  }

  _onFavoriteButtonClick() {
    this._isFavorites = !this._isFavorites;
    this.unbind();
    this._partialUpdate();
    this.bind();

    typeof this._onFavorites === `function` && this._onFavorites({isFavorites: this._isFavorites});
  }
  _onArchiveButtonClick() {
    this._isArchive = !this._isArchive;
    this.unbind();
    this._partialUpdate();
    this.bind();

    typeof this._onArchive === `function` && this._onArchive({archive: this._isArchive});
  }

  _onDeleteButtonClick(evt) {
    evt.preventDefault();
    typeof this._onDelete === `function` && this._onDelete(this._modelId);
  }

  _onClickWithoutTask(evt) {
    for (let i = 0; i < evt.path.length; i++) {
      if (evt.path[i].classList.contains('card--repeat') && evt.path[i] === this._element) {
        return 0;
      }
      if (evt.path[i].localName === 'body') {
        evt.stopPropagation();
        break;
      }
    }
    this._onReject();
  }

  _onChangeDate() {
    this._state.isDate = !this._state.isDate;
    this.unbind();
    this._partialUpdate();
    this.bind();
  }

  _onChangeRepeated() {
    this._state.isRepeated = !this._state.isRepeated;
    this.unbind();
    this._partialUpdate();
    this.bind();
  }

  _onInputHashtag(evt) {
    this._tags.add(evt.target.value);
    this.unbind();
    this._partialUpdate();
    this.bind();
  }
  _onDeleteHashtag(evt) {
    const target = evt.target;
    const input = target.parentNode.querySelector(`input`);
    this._tags.forEach((tag) => {
      tag === input.value && this._tags.delete(tag);
    });
    this.unbind();
    this._partialUpdate();
    this.bind();
  }

  _onFocusDateInput() {
    // console.log('dateinput');
    this._element.querySelector(`.js-datepicker`).select();
  }

  _partialUpdate() {
    this._element.innerHTML = this.template;
  }

  _processForm(formData) {
    const entry = {
      text: ``,
      colors: {
        'black': false,
        'yellow': false,
        'blue': false,
        'green': false,
        'pink': false
      },
      tags: new Set(),
      repeat: {
        'mo': false,
        'tu': false,
        'we': false,
        'th': false,
        'fr': false,
        'sa': false,
        'su': false,
      }
    };

    const taskEditMapper = TaskEdit.createMapper(entry);

    for(const pair of formData.entries()) {
      const [property, value] = pair;
      taskEditMapper[property] && taskEditMapper[property](value);
    }
    entry.dueDate = this._state.checkedDate;
    return entry;
  }

  set onSubmit(fn) {
    this._onSubmit = fn;
  }
  set onReject(fn) {
    this._onReject = fn;
  }

  set onDelete(fn) {
    this._onDelete = fn;
  }

  set onFavorites(fn) {
    this._onFavorites = fn;
  }
  set onArchive(fn) {
    this._onArchive = fn;
  }

  get template() {
    return `<article class="card card--${this._checkColor} ${this._state.isRepeated ? `card--repeat` : ``} card--edit">
            <form class="card__form" method="get">
              <div class="card__inner">
                <div class="card__control">
                  <button type="button" class="card__btn card__btn--edit">edit
                  </button>
                  <button type="button" class="card__btn card__btn--archive ${this._isArchive ? '' : 'card__btn--disabled'}">archive
                  </button>
                  <button
                    type="button"
                    class="card__btn card__btn--favorites ${this._isFavorites ? '' : 'card__btn--disabled'}"
                  >favorites
                  </button>
                </div>

                <div class="${this._isRepeating() ? 'card__color-bar-wave' : 'card__color-bar'}">
                  <svg class="${this._isRepeating() ? '' : 'card__color-bar-wave'}" width="100%" height="10">
                    <use xlink:href="#wave"></use>
                  </svg>
                </div>

                <div class="card__textarea-wrap">
                  <label>
                    <textarea
                              class="card__text"
                              placeholder="Start typing your text here..."
                              name="text">${this._text}
                    </textarea>
                  </label>
                </div>

                <div class="card__settings">
                  <div class="card__details">
                    <div class="card__dates">
                      <button class="card__date-deadline-toggle" type="button">
                        date: <span class="card__date-status">${this._state.isDate ? 'yes' : 'no'}</span>
                      </button>

                      <fieldset class="card__date-deadline" ${this._state.isDate ? '' : 'disabled'}>
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
                      </fieldset>

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
                    </div>
                    
                    <div class="card__hashtag">
                      <div class="card__hashtag-list">
                        ${Array.from(this._tags, tag => (`
                          <span class="card__hashtag-inner">
                              <input type="hidden" name="hashtag" value="${tag}" class="card__hashtag-hidden-input"
                              />
                              <button type="button" class="card__hashtag-name">
                              #${tag}
                              </button>
                              <button type="button" class="card__hashtag-delete">
                              delete
                              </button>
                            </span>
                        `.trim())).join(``)
                        }
                      </div>

                      <label>
                        <input
                          type="text"
                          class="card__hashtag-input"
                          name="hashtag-input"
                          placeholder="Type new hashtag here"
                        />
                      </label>
                    </div>
                  </div>

                  <label class="card__img-wrap ${this._image ? `` : `card__img-wrap--empty`}">
                    <input
                      type="file"
                      class="card__img-input visually-hidden"
                      name="img"
                    />
                    <img
                      src="${this._image}"
                      alt="task picture"
                      class="card__img"
                    />
                  </label>

                  <div class="card__colors-inner">
                    <h3 class="card__colors-title">Color</h3>
                    <div class="card__colors-wrap">
                      ${(Object.keys(this._colors).map((color)=>(`
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
                    </div>
                  </div>
                </div>

                <div class="card__status-btns">
                  <button class="card__save" type="submit">save</button>
                  <button class="card__delete" type="button">delete</button>
                </div>
              </div>
            </form>
          </article>`.trim();
  }

  bind() {
    this._element.querySelector(`.card__save`)
      .addEventListener(`click`, this._onSubmitButtonClick);

    this._element.querySelector(`.card__btn--edit`)
      .addEventListener(`click`, this._onReject);

    this._element.querySelector(`.card__btn--favorites`)
      .addEventListener(`click`, this._onFavoriteButtonClick);

    this._element.querySelector(`.card__btn--archive`)
      .addEventListener(`click`, this._onArchiveButtonClick);

    this._element.querySelector(`.card__delete`)
      .addEventListener(`click`, this._onDeleteButtonClick);

    this._element.querySelector(`.card__date-deadline-toggle`)
      .addEventListener(`click`, this._onChangeDate);

    this._element.querySelector(`.card__repeat-toggle`)
      .addEventListener(`click`, this._onChangeRepeated);

    this._element.querySelector(`.card__hashtag-input`)
      .addEventListener(`change`, this._onInputHashtag);

    this._element.querySelectorAll(`.card__hashtag-delete`)
      .forEach((tag) => {tag.addEventListener(`click`, this._onDeleteHashtag)});

    this._element.querySelector(`.js-datepicker`)
      .addEventListener(`change-date`, this._onCheckedDate);


    setTimeout(()=>{
      const datepicker = $(`.js-datepicker`).datepicker({
        language: 'en',
        dateFormat: 'MM d',
        autoClose: true,
        altField: '.js-timepicker',
        timepicker: true,
        timeFormat: ' ',
        altFieldDateFormat: 'hh:ii AA',
        onSelect: function (formattedDate, date, inst) {
          const event = new CustomEvent('change-date', { 'detail': date });
          datepicker[0].dispatchEvent(event);
        }
      });
      // document.body.addEventListener('click', this._onClickWithoutTask);
    }, 500);
  }

  unbind() {
    this._element.querySelector(`.card__save`)
      .removeEventListener(`click`, this._onSubmitButtonClick);

    this._element.querySelector(`.card__btn--edit`)
      .removeEventListener(`click`, this._onReject);

    this._element.querySelector(`.card__btn--favorites`)
      .removeEventListener(`click`, this._onFavoriteButtonClick);

    this._element.querySelector(`.card__btn--archive`)
      .removeEventListener(`click`, this._onArchiveButtonClick);

    this._element.querySelector(`.card__delete`)
      .removeEventListener(`click`, this._onDeleteButtonClick);

    this._element.querySelector(`.card__date-deadline-toggle`)
      .removeEventListener(`click`, this._onChangeDate);

    this._element.querySelector(`.card__repeat-toggle`)
      .removeEventListener(`click`, this._onChangeRepeated);

    this._element.querySelector(`.card__hashtag-input`)
      .removeEventListener(`change`, this._onInputHashtag);

    this._element.querySelectorAll(`.card__hashtag-delete`)
      .forEach((tag) => {tag.removeEventListener(`click`, this._onDeleteHashtag)});

    this._element.querySelector(`.js-datepicker`)
      .removeEventListener(`change-date`, this._onCheckedDate);

    /*document.body.removeEventListener('click', this._onClickWithoutTask);*/
  }

  update(data) {
    this._text = data.text;
    this._dueDate = data.dueDate;
    // this._image = data.image;
    this._tags = data.tags;
    this._repeatingDays = data.repeat;
    this._colors = data.colors;
    this._isFavorites = data.isFavorites;
    this._isArchive = data.archive;
  }

  updateState() {
    console.log(this._dueDate);
    this._state.isDate = !!this.dueDate;
    this._state.isRepeated = this._isRepeating();
  }

  static createMapper(target) {
    return {
      hashtag: (value) => target.tags.add(value),
      text: (value) => target.text = value,
      color: (value) => target.colors[value] = true,
      repeat: (value) => target.repeat[value] = true,
    }
  }

}
