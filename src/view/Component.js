import createElement from "../service/create-element";

export default class Component {
  constructor() {
    if (new.target === Component) {
      throw new Error('Can\'t instantiate the base component, only concrete one.');
    }

    this._element = null;
    this._state = {};
  }

  get element() {
    return this._element;
  }

  get template() {
    throw new Error('You have to define template');
  }

  updateState() {}

  render() {
    this._element = createElement(this.template);

    this.renderComponents();
    this.bind();
    return this._element;
  }
  renderComponents() {}

  resetData() {}

  bind() {}

  unbind() {}

  unrender() {
    if (this._element) {
      this.unbind();
      this._element.remove();
      this._element = null;
    }
  }
}
