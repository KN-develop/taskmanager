import Component from '../Component';

export default class TaskTags extends Component{
  constructor(data) {
    super();
    this.__copyData = {
      tags: new Set(Array.from(data.tags)),
    };
    this._tags = data.tags;

    this._element = null;
    this._state = {
      // isEdit: false
    };
  }

  get initData() {
    return this.__copyData;
  }

  set tags(tag) {
    this._tags.add(tag);
  }


  get template() {
    return `<div class="card__hashtag-container">
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
            </div>`.trim();
  }

  update(data) {
    this._tags = new Set(Array.from(data.tags));

    this.__copyData.tags = new Set(Array.from(data.tags));
  }

}
