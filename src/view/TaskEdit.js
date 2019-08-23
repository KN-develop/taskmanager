import createElement from "../service/create-element";
import Component from './Component';
import TaskTextarea from './form-components/TaskTexarea';
import TaskColors from './form-components/TaskColors';
import TaskTags from './form-components/TaskTags';
import TaskDatapicker from './form-components/TaskDatapicker';
import TaskRepeat from './form-components/TaskRepeat';

export default class TaskEdit extends Component {
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
    this._checkColor = Object.entries(this._colors).find((element) => element[1] && true)[0];
    this._isFavorites = data.isFavorites;
    this._isArchive = data.archive;

    this._components = {
      taskTextarea: new TaskTextarea({text: this._text}),
      taskColors: new TaskColors({colors: this._colors}),
      taskTags: new TaskTags({tags: this._tags}),
      taskDatapicker: new TaskDatapicker({dueDate: this._dueDate}),
      taskRepeat: new TaskRepeat({
        repeat: this._repeatingDays,
        state: {
          isRepeated: this._isRepeating()
        }
      }),
    };

    this._element = null;
    this._onEdit = null;
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
    this._onFavoriteButtonClick = this._onFavoriteButtonClick.bind(this);
    this._onArchiveButtonClick = this._onArchiveButtonClick.bind(this);
    this._onClickWithoutTask = this._onClickWithoutTask.bind(this);
    this._onCheckedDate = this._onCheckedDate.bind(this);

    // Обработчики событий компонентов
    this._onInputHashtag = this._onInputHashtag.bind(this);
    this._onDeleteHashtag = this._onDeleteHashtag.bind(this);
    this._onSetText = this._onSetText.bind(this);
    this._partialUpdate = this._partialUpdate.bind(this);
  }

  get components() {
    return this._components;
  }

  get initData() {
    return this.__copyData;
  }
/*
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
  }*/
  /**
   * Проверяет, задача повторяющаяся или нет
   * @returns {boolean}
   * @private
   */
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

  /**
   * Обрабатывает событие нажатия на кнопку сохранения задачи
   * @param evt
   * @private
   */
  _onSubmitButtonClick(evt) {
    evt.preventDefault();
    const formData = new FormData(this._element.querySelector(`.card__form`));
    const newData = this._processForm(formData);
    typeof this._onSubmit === `function` && this._onSubmit(newData);
    this.update(newData);

    for (let key in this.components) {
      this.components[key].update(newData);
    }
  }

  /**
   * Обрабатывает событие нажатия на кнопку Edit. Сбрасывает состояние и закрывает карточку редактирования
   * @private
   */
  _onEditButtonClick() {
    if (typeof this._onEdit === `function`) {
      // console.log('edit');
      // this.update(this.initData);
      this._onEdit();
      for (let key in this.components) {
        this.components[key].unrender();
        // this.components[key]._element = null;
        this.components[key].update(this.components[key].initData);
      }
    }
  }

  /**
   * Обрабатывает событие нажатия на кнопку Favorite
   * Добавляет в Favorite
   * @private
   */
  _onFavoriteButtonClick() {
    this._isFavorites = !this._isFavorites;
    this.unbind();
    this._partialUpdate();
    this.bind();

    typeof this._onFavorites === `function` && this._onFavorites({isFavorites: this._isFavorites});
  }

  /**
   * Обрабатывает нажате на кнопку Archive. Отправляет задачу в архив.
   * @private
   */
  _onArchiveButtonClick() {
    this._isArchive = !this._isArchive;
    this.unbind();
    this._partialUpdate();
    this.bind();

    typeof this._onArchive === `function` && this._onArchive({archive: this._isArchive});
  }

  /**
   * Обрабатывает клик на кнопку удаления. Вызывает метод удвляющий задачу
   * @param evt
   * @private
   */
  _onDeleteButtonClick(evt) {
    evt.preventDefault();
    typeof this._onDelete === `function` && this._onDelete(this._modelId);
  }

  /**
   * Проверяет произошел ли клик мимо открытой задачи
   * Если клик прошел за пределами открытой задачи, то вызывается метод this._onReject закрывающий карточку задачи без сохранения
   * @param evt
   * @returns {number}
   * @private
   */
  _onClickWithoutTask(evt) {
    for (let i = 0; i < evt.path.length; i++) {
      if ((evt.path[i].classList.contains('card--edit') && evt.path[i] === this._element) || evt.path[i].classList.contains('datepickers-container')) {
        return 0;
      }
      if (evt.path[i].localName === 'body') {
        evt.stopPropagation();
        break;
      }
    }
    this._onReject();
  }

  /**
   * Частичное обновление при включении / отключении даты
   * @private
   */
  _onChangeDate() {
    this._state.isDate = !this._state.isDate;
    this.components.taskDatapicker.isDate = !this.components.taskDatapicker.isDate;
    this.unbind();
    this._partialUpdate('taskDatapicker');
    this.bind();
  }

  /**
   * Чачтичное обновление при включении / отключении повторяемости задачи
   * @private
   */
  _onChangeRepeated() {
    this._state.isRepeated = !this._state.isRepeated;
    this.components.taskRepeat.isRepeat = !this.components.taskRepeat.isRepeat;
    this.unbind();
    this._partialUpdate('taskRepeat');
    this.bind();
  }

  /**
   * Обрабатывает событие добавления хэштега. Делает частичное обновление элемента
   * @param evt
   * @private
   */
  _onInputHashtag(evt) {
    this._tags.add(evt.target.value);
    this.components.taskTags.tags = evt.target.value;
    this.unbind();
    this._partialUpdate('taskTags');
    this.bind();
  }

  /**
   * Обрабатывает событие уаления хэштега
   * @param evt
   * @private
   */
  _onDeleteHashtag(evt) {
    const target = evt.target;
    const input = target.parentNode.querySelector(`input`);
    this._tags.forEach((tag) => {
      tag === input.value && this._tags.delete(tag);
    });
    this.components.taskTags._tags.forEach((tag) => {
      tag === input.value && this.components.taskTags._tags.delete(tag);
    });
    this.unbind();
    this._partialUpdate('taskTags');
    this.bind();
  }

  // Методы для обработки событий дочерних компонентов
  _onSetText(evt) {
    this._text = evt.target.value;
    this.components.taskTextarea.text = this._text;
    this.unbind();
    this._partialUpdate('taskTextarea');
    this.bind();
  }

  /**
   * Осуществляет перерисовку DOM элемента
   * @private
   */
  _partialUpdate(componentName) {
    if (componentName) {
      const component = this._components[componentName];
      component.unrender();
      component.render();
      this.renderComponents(componentName);
    } else {
      this._element.innerHTML = this.template;
      this.renderComponents();
    }
  }

  /**
   * Собирает данные из объекта формы и перегоняет их в объект для сохранения в модели
   * @param formData
   * @returns Object
   * @private
   */
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

    for (const pair of formData.entries()) {
      const [property, value] = pair;
      taskEditMapper[property] && taskEditMapper[property](value);
    }
    entry.dueDate = this._state.checkedDate;
    return entry;
  }

  // TODO Сеттеры методов

  set onEdit(fn) {
    this._onEdit = fn;
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

                <div class="card__textarea-wrap" data-container="taskTextarea">
                  
                </div>

                <div class="card__settings">
                  <div class="card__details">
                    <div class="card__dates">

                      <div data-container="taskDatapicker"></div>

                      <div data-container="taskRepeat"></div>
                    </div>
                    
                    <div class="card__hashtag" data-container="taskTags">
                    
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

                  <div class="card__colors-inner" data-container="taskColors">
                    <h3 class="card__colors-title">Color</h3>
                    
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
      .addEventListener(`click`, this._onEditButtonClick);

    this._element.querySelector(`.card__btn--favorites`)
      .addEventListener(`click`, this._onFavoriteButtonClick);

    this._element.querySelector(`.card__btn--archive`)
      .addEventListener(`click`, this._onArchiveButtonClick);

    this._element.querySelector(`.card__delete`)
      .addEventListener(`click`, this._onDeleteButtonClick);

    // Слушатели событий на дочерних компонентах
    this.components.taskDatapicker.element.querySelector(`.card__date-deadline-toggle`)
      .addEventListener(`click`, this._onChangeDate);

    this.components.taskDatapicker.element.querySelector(`.js-datepicker`)
      .addEventListener(`change-date`, this._onCheckedDate);

    this.components.taskRepeat.element.querySelector(`.card__repeat-toggle`)
      .addEventListener(`click`, this._onChangeRepeated);

    this.components.taskTags.element.querySelector(`.card__hashtag-input`)
      .addEventListener(`change`, this._onInputHashtag);

    this.components.taskTags.element.querySelectorAll(`.card__hashtag-delete`)
      .forEach((tag) => {
        tag.addEventListener(`click`, this._onDeleteHashtag)
      });

    this.components.taskTextarea.element.querySelector(`textarea`)
      .addEventListener(`blur`, this._onSetText);


    setTimeout(() => {
      const datepicker = $(`.js-datepicker`).datepicker({
        language: 'en',
        dateFormat: 'MM d',
        autoClose: true,
        altField: '.js-timepicker',
        timepicker: true,
        timeFormat: ' ',
        altFieldDateFormat: 'hh:ii AA',
        onSelect: function (formattedDate, date, inst) {
          const event = new CustomEvent('change-date', {'detail': date});
          datepicker[0].dispatchEvent(event);
        }
      });
      document.body.addEventListener('click', this._onClickWithoutTask);
    }, 50);
  }

  unbind() {
    this._element.querySelector(`.card__save`)
      .removeEventListener(`click`, this._onSubmitButtonClick);

    this._element.querySelector(`.card__btn--edit`)
      .removeEventListener(`click`, this._onEditButtonClick);

    this._element.querySelector(`.card__btn--favorites`)
      .removeEventListener(`click`, this._onFavoriteButtonClick);

    this._element.querySelector(`.card__btn--archive`)
      .removeEventListener(`click`, this._onArchiveButtonClick);

    this._element.querySelector(`.card__delete`)
      .removeEventListener(`click`, this._onDeleteButtonClick);

    // Слушатели событий на дочерних компонентах
    this.components.taskDatapicker.element.querySelector(`.card__date-deadline-toggle`)
      .removeEventListener(`click`, this._onChangeDate);

    this.components.taskDatapicker.element.querySelector(`.js-datepicker`)
      .removeEventListener(`change-date`, this._onCheckedDate);

    this.components.taskRepeat.element.querySelector(`.card__repeat-toggle`)
      .removeEventListener(`click`, this._onChangeRepeated);

    this.components.taskTags.element.querySelector(`.card__hashtag-input`)
      .removeEventListener(`change`, this._onInputHashtag);

    this.components.taskTags.element.querySelectorAll(`.card__hashtag-delete`)
      .forEach((tag) => {
        tag.removeEventListener(`click`, this._onDeleteHashtag)
      });

    this.components.taskTextarea.element.querySelector(`textarea`)
      .removeEventListener(`blur`, this._onSetText);


    this._element.querySelector(`.js-datepicker`)
      .removeEventListener(`change-date`, this._onCheckedDate);

    document.body.removeEventListener('click', this._onClickWithoutTask);
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

    for (let key in this._components) {
      this._components[key].resetData(data);
    }
  }

  updateState() {
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

  renderComponents(componentName) {
    const addComponent = (name, instance)=>{
      const DOMContainer = this._element.querySelector(`[data-container=${name}]`);
      const component = instance.render();

      DOMContainer.appendChild(component);
    };

    if (!!componentName) {
      const value = this._components[componentName];
      addComponent(componentName, value);
    } else {
      for (let key in this._components) {
        const value = this._components[key];
        addComponent(key, value);
      }
    }
  }

}
