import createElement from "../service/create-element";
import Component from './Component';

/**
 * Базовый класс задачи
 */
export default class Task extends Component{
  constructor(data) {
    super();
    this._text = data.text;
    this._dueDate = data.dueDate;
    this._id = data.id;
    this._image = data.image;
    this._tags = data.tags;
    this._repeatingDays = data.repeat;
    this._colors = data.colors;
    this._isFavorites = data.isFavorites;
    this._isArchive = data.archive;

    this._element = null;
    this._state = {
      // isEdit: false
    };

    this._onEdit = null;
    this._onArchive = null;
    this._onFavorites = null;
    this._onEditButtonClick = this._onEditButtonClick.bind(this);
    this._onArchiveButtonClick = this._onArchiveButtonClick.bind(this);
    this._onFavoriteButtonClick = this._onFavoriteButtonClick.bind(this);
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

  set onEdit(fn) {
    this._onEdit = fn;
  }
  set onArchive(fn) {
    this._onArchive = fn;
  }
  set onFavorites(fn) {
    this._onFavorites = fn;
  }

  _onEditButtonClick() {
    typeof this._onEdit === `function` && this._onEdit();
  }
  _onArchiveButtonClick() {
    this._isArchive = !this._isArchive;
    this.unbind();
    this._partialUpdate();
    this.bind();

    typeof this._onArchive === `function` && this._onArchive({archive: this._isArchive});
  }

  _onFavoriteButtonClick() {
    this._isFavorites = !this._isFavorites;
    this.unbind();
    this._partialUpdate();
    this.bind();

    typeof this._onFavorites === `function` && this._onFavorites({isFavorites: this._isFavorites});
  }

  _partialUpdate() {
    this._element.innerHTML = this.template;
  }

  get template() {
    return `<article class="card card--${this._setColor()} ${this._isRepeating() ? `card--repeat` : ``}">
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
                      <fieldset class="card__date-deadline" ${this._dueDate ? '' : 'disabled'}>
                        <label class="card__input-deadline-wrap">
                          <input
                            class="card__date"
                            type="text"
                            placeholder="${this.dueDate.date}"
                            name="date"
                            value="${this.dueDate.date}"
                          />
                        </label>
                        <label class="card__input-deadline-wrap">
                          <input
                            class="card__time"
                            type="text"
                            placeholder="${this.dueDate.time}"
                            name="time"
                            value="${this.dueDate.time}"
                          />
                        </label>
                      </fieldset>
                    </div>

                    <div class="card__hashtag">
                      <div class="card__hashtag-list">
                        ${(Array.from(this._tags).map((tag) => (`
                          <span class="card__hashtag-inner">
                            <input
                              type="hidden"
                              name="hashtag"
                              value="${tag}"
                              class="card__hashtag-hidden-input"
                            />
                            <button type="button" class="card__hashtag-name">
                              #${tag}
                            </button>
                          </span>
                        `.trim()))).join(``)}
                        
                      </div>
                    </div>
                  </div>

                  <label class="card__img-wrap ${this._image ? `` : `card__img-wrap--empty`}">
                    <img
                      src="${this._image}"
                      alt="task picture"
                      class="card__img"
                    />
                  </label>
                </div>
              </div>
            </form>
          </article>`.trim();
  }

  bind() {
    this._element.querySelector(`.card__btn--edit`)
      .addEventListener(`click`, this._onEditButtonClick);
    this._element.querySelector(`.card__btn--archive`)
      .addEventListener(`click`, this._onArchiveButtonClick);
    this._element.querySelector(`.card__btn--favorites`)
      .addEventListener(`click`, this._onFavoriteButtonClick);
  }

  unbind() {
    this._element.querySelector(`.card__btn--edit`)
      .removeEventListener(`click`, this._onEditButtonClick);
    this._element.querySelector(`.card__btn--archive`)
      .removeEventListener(`click`, this._onArchiveButtonClick);
    this._element.querySelector(`.card__btn--favorites`)
      .removeEventListener(`click`, this._onFavoriteButtonClick);
  }

  update(data) {
    this._text = data.text;
    this._dueDate = data.dueDate;
    this._image = data.image;
    this._tags = data.tags;
    this._repeatingDays = data.repeat;
    this._colors = data.colors;
    this._isFavorites = data.isFavorites;
    this._isArchive = data.archive;
  }

}
