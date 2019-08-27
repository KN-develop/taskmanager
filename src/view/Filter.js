import Component from './Component';

export default class Filter extends Component{
  constructor(data) {
    super();
    this._properties = data.properties;

    this._element = null;
    this._onSelect = null;

    this._filteredFunctions = {
      all: task=>!task.archive,
      overdue: task=>task.dueDate && task.dueDate < Date.now(),
      today: (task)=>{
        const today = new Date();
        const askDate = task.dueDate ? new Date(task.dueDate) : false;
        if (!askDate) {return false;}
        if (today.getDate() === askDate.getDate() && today.getMonth() === askDate.getMonth() && today.getFullYear() === askDate.getFullYear()) {
          return true;
        } else {
          return false;
        }
      },
      favorites: task=>task.isFavorites,
      repeating: (task)=>{for (let key in task.repeat) {if (!!task.repeat[key]) {return true;}}},
      tags: task=>task.tags.length,
      archive: task=>task.archive
    };

    this._onCheckedFilter = this._onCheckedFilter.bind(this);
  }


  _onCheckedFilter(evt) {
    evt.preventDefault();
    const name = evt.target.id.split('__')[1];
    this._onSelect(name);
    // console.log(evt.target);
  }

  _partialUpdate() {
    this._element.innerHTML = this.template;
  }

  calculateFilter(data) {
    for (let key in this._filteredFunctions) {
      const thisFilter = this._properties.filter(prop=>prop.name === key)[0];
      thisFilter.count = 0;
      data.forEach(task=>this._filteredFunctions[key](task) && thisFilter.count++);
    }
    this.unbind();
    this._partialUpdate();
    this.bind();
  }

  onSelect() {
    /*const filterName = data.filterName;
    const createdTasksComponents = data.createdTasksComponents;
    const tasksData = data.tasksData;
    const filteredTasks = data.filteredTasks;
    const destroyTasks = data.destroyTasks;
    const ctx = data.ctx;*/
  }

  get template() {
    return `<div class="main__filter-inner">
              ${(this._properties.map( (property) => (`
                <input type="radio"
                       id="filter__${property.name}"
                       class="filter__input visually-hidden"
                       name="filter"
                       data-name: "${property.name}"
                       ${property.checked && `checked`}/>
                <label for="filter__${property.name}" class="filter__label">
                  ${property.name} <span class="filter__all-count">${property.count}</span>
                </label>`.trim()))).join(``)}
            </div>`.trim();
  }

  set onSelect(fn) {
    this._onSelect = fn;
  }

  bind() {
    this._element.querySelectorAll('.filter__input').forEach((elem)=>{
      elem.addEventListener('change', this._onCheckedFilter);
    });
  }

  unbind() {
    this._element.querySelectorAll('.filter__input').forEach((elem)=>{
      elem.removeEventListener('change', this._onCheckedFilter);
    });
  }

  unrender() {
    this.unbind();
    this._element = null;
  }

}
