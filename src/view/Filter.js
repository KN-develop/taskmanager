import Component from './Component';

export default class Filter extends Component{
  constructor(data) {
    super();
    this._properties = data.properties;

    this._element = null;
    this._onSelect = null;

    this._onCheckedFilter = this._onCheckedFilter.bind(this);
  }


  _onCheckedFilter(evt) {
    evt.preventDefault();
    const name = evt.target.id.split('__')[1];
    this._onSelect(name);
  }

  get template() {
    return `<div class="main__filter">
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
