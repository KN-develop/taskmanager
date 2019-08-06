export default (caption, count, checked = false) => `
        <input
          type="radio"
          id="filter__all"
          class="filter__input visually-hidden"
          name="filter"
          ${checked ? `checked` : ``}
        />
        <label for="filter__all" class="filter__label">
          ${caption} <span class="filter__all-count">${count}</span></label>
  `;
