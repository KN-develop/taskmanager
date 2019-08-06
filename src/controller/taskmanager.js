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
    const tasksModel = new TasksModel();
    tasksModel.getData();

    // TODO Копия объекта с задачами
    // const tasks = Object.assign([], tasksData);

    //TODO Фильтр

    const filterContainer = taskmanager.querySelector(`.main__filter`);
    const filterComponent = new Filter(filterData);
    filterContainer.appendChild(filterComponent.render());
    filterComponent.onSelect = (filterName) => {
      destroyTasks(createdTasksComponents);
      console.log(filterName);
    };

    //TODO Задачи


    const tasksContainer = taskmanager.querySelector(`.board__tasks`);

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
          };
          taskComponent.onFavorites = (newObject) => {
            taskEditComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
          };

          // Диспетчеризация обновлений задачи в режиме редактирования
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
          };

          taskEditComponent.onDelete = (modelId) => {
            tasksContainer.removeChild(taskEditComponent.element);
            taskEditComponent.unrender();
            tasksModel.deleteDataItem(modelId);
          };

          taskEditComponent.onArchive = (newObject) => {
            taskComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
          };

          taskEditComponent.onFavorites = (newObject) => {
            taskComponent.update(tasksModel.updateDataItem(task.modelId, newObject));
            taskEditComponent.updateState();
          };
      });
      return createdTasks;
    };

    const destroyTasks = function(createdTasks) {
      createdTasks.forEach((tasksComponents)=>tasksComponents.forEach((task)=>task.unrender()));
    };


    const createdTasksComponents = createTasks(tasksModel.data);

  }
};
