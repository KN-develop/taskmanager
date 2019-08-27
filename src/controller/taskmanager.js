import makeFilter from '../view/make-filter';
import {TasksModel} from '../model/tasks-data';
import filterData from '../model/filter-data';
import Task from '../view/Task';
import TaskEdit from '../view/TaskEdit';
import Filter from "../view/Filter";



export default function taskmanager() {



  const taskmanager = document.querySelector('.js-taskmanager');
  if (taskmanager) {
    // tasks Model Init
    // tasksModel.getData();

    // TODO Копия объекта с задачами
    // const tasks = Object.assign([], tasksData);

    //TODO Фильтр

    const filterContainer = taskmanager.querySelector(`.main__filter`);
    const filterComponent = new Filter(filterData);
    filterContainer.appendChild(filterComponent.render());
    const filterParameters = {
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
    filterComponent.onSelect = (filterName) => {
      let filteredTasks = [];
      filteredTasks = tasksData.filter(task=>filterParameters[filterName](task));
      destroyTasks(createdTasksComponents);
      createdTasksComponents = createTasks(filteredTasks);
    };

    //TODO Задачи

    const tasksContainer = taskmanager.querySelector(`.board__tasks`);
    let tasksData = [];

    // const updateTask = (task, modelId, newTask) => {
    //   tasksData[i] = Object.assign({}, task, newTask);
    //   tasksModel.changeDataItem()
    //   return tasksData[i];
    // };

    const createTasks = function(tasks) {
      const createdTasks = [];
      tasks.forEach((task, i)=>{
          const taskComponent = new Task(task);
          const taskEditComponent = new TaskEdit(task);
          createdTasks.push([taskComponent, taskEditComponent]);

          tasksContainer.appendChild(taskComponent.render());

        // Диспетчеризация обновлений задачи в режиме просморта
          taskComponent.onEdit = () => {
            taskEditComponent.render();
            tasksContainer.replaceChild(taskEditComponent.element, taskComponent.element);
            taskComponent.unrender();
          };
          taskComponent.onArchive = (newObject) => {
            taskEditComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
            filterComponent.calculateFilter(tasksData);
          };
          taskComponent.onFavorites = (newObject) => {
            taskEditComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
            filterComponent.calculateFilter(tasksData);
          };

          // Диспетчеризация обновлений задачи в режиме редактирования
          taskEditComponent.onEdit = () => {
            taskComponent.render();
            tasksContainer.replaceChild(taskComponent.element, taskEditComponent.element);
            taskEditComponent.unrender();
          };

          taskEditComponent.onReject = () => {
            taskComponent.render();
            tasksContainer.replaceChild(taskComponent.element, taskEditComponent.element);
            taskEditComponent.unrender();
          };

          taskEditComponent.onSubmit = (newObject) => {
            console.log(tasksModel);
            taskComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
            taskComponent.render();
            tasksContainer.replaceChild(taskComponent.element, taskEditComponent.element);
            taskEditComponent.unrender();
            filterComponent.calculateFilter(tasksData);
          };

          taskEditComponent.onDelete = (modelId) => {
            tasksContainer.removeChild(taskEditComponent.element);
            taskEditComponent.unrender();
            tasksModel.deleteDataItem(modelId);
            filterComponent.calculateFilter(tasksData);
          };

          taskEditComponent.onArchive = (newObject) => {
            taskComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
            filterComponent.calculateFilter(tasksData);
          };

          taskEditComponent.onFavorites = (newObject) => {
            taskComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
            filterComponent.calculateFilter(tasksData);
          };
      });
      return createdTasks;
    };

    const destroyTasks = function(createdTasks) {
      createdTasks.forEach((tasksComponents)=>tasksComponents.forEach((task)=>task.unrender()));
    };

    let createdTasksComponents = {};

    const onResponseTask = function(data) {
      tasksData = data;
      createdTasksComponents = createTasks(tasksData.filter(task=>!task.archive));
      filterComponent.calculateFilter(tasksData);
    };

    const tasksModel = new TasksModel();
    const initTasks = function() {
      tasksModel.getData(onResponseTask, tasksModel);
    };

    initTasks();


  }
};
