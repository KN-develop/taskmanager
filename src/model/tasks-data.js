const inputTasks = [
  {
    archive: false,
    id: `001`,
    image: `http://picsum.photos/100/100?r=${Math.random()}`,
    text: `Here is a card with filled data`,
    dueDate: Date.now(),
    repeat: {
      'mo': false,
      'tu': false,
      'we': true,
      'th': false,
      'fr': true,
      'sa': true,
      'su': false
    },
    tags: new Set([`repeat`, `cinema`, `entertainment`]),
    colors: {
      'black': false,
      'yellow': true,
      'blue': false,
      'green': false,
      'pink': false
    },
    isFavorites: false,
  },
  {
    archive: false,
    id: `002`,
    image: `//picsum.photos/100/100?r=${Math.random()}`,
    text: `Here is a card with filled data`,
    dueDate: Date.now(),
    repeat: {
      'mo': false,
      'tu': false,
      'we': false,
      'th': false,
      'fr': false,
      'sa': false,
      'su': false
    },
    tags: new Set([`cinema`, `serials`, `cinema`, `entertainment`]),
    colors: {
      'black': false,
      'yellow': false,
      'blue': false,
      'green': true,
      'pink': false
    },
    isFavorites: true,
  },
  {
    archive: false,
    id: `003`,
    image: `//picsum.photos/100/100?r=${Math.random()}`,
    text: `Here is a card with filled data`,
    dueDate: '',
    repeat: {
      'mo': false,
      'tu': false,
      'we': false,
      'th': false,
      'fr': false,
      'sa': false,
      'su': false
    },
    tags: new Set([`cinema`, `entertainment`]),
    colors: {
      'black': false,
      'yellow': false,
      'blue': true,
      'green': false,
      'pink': false
    },
    isFavorites: false,
  },
];

export class TasksModel {
  constructor() {
    this._data = [];
    this._idCounter = Date.now();
  }

  get data() {
    return this._data;
  }

  addDataItems(inputData) {
    inputData.map((item) => {
      const copyItem = Object.assign({}, item);
      copyItem.modelId = this._idCounter;
      this._data.push(copyItem);
      this._idCounter++;
    });
  }

  updateDataItem(modelId, newData) {
    const findIndex = this._data.findIndex((element) => element.modelId === modelId);
    const thisModelId = this._data[findIndex].modelId;
    const newDataResult = Object.assign({}, this._data[findIndex], newData);
    newDataResult.modelId = thisModelId;
    this._data[findIndex] = newDataResult;

    return this._data[findIndex];
  }

  /**
   * Удаляет объект задачи. Фактически зануляет значение, для сопоставления индексов
   * @param modelId
   */
  deleteDataItem(modelId) {
    const index = this._data.findIndex((element) => element.modelId === modelId);
    if (index !== undefined) {
      this._data[index] = null;
    }
  }

  getData() {
    // будет получать данные с сервера, пока втупую берет из переменной
    /*try {
      const request = new Request('https://taskmanager-91d17.firebaseio.com/tasks.json', {
        method: 'get',
      });
      const response = await fetch(request);
      this.addDataItems(await response.json());
      // return await response.json();
    } catch (e) {
      console.error(e);
    }*/
    this.addDataItems(inputTasks);
  }

  saveData() {
    // будет отправлять данные на сервер (сохранять короче)
    // Сервер должен понимать, что если объект == null то нужно этот объект из базы удалить
  }
}