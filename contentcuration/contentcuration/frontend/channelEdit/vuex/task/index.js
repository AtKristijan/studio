import Vue from 'vue';
import sortBy from 'lodash/sortBy';
import { Task } from 'shared/data/resources';
import { TABLE_NAMES, CHANGE_TYPES } from 'shared/data';
import urls from 'shared/urls';

const DEFAULT_CHECK_INTERVAL = 5000;
const RUNNING_TASK_INTERVAL = 2000;

let taskUpdateTimer;

export default {
  namespaced: true,
  state: {
    asyncTasksMap: {},
  },
  getters: {
    activeTasks(state, getters) {
      return getters.asyncTasks.filter(t => t.status !== 'SUCCESS' || t.status !== 'FAILED');
    },
    asyncTasks(state) {
      // ensure most recent tasks are first
      return sortBy(Object.values(state.asyncTasksMap), 'created').reverse();
    },
    getAsyncTask(state) {
      return function(taskId) {
        return state.asyncTasksMap[taskId];
      };
    },
    currentTasksForChannel(state, getters) {
      return function(id) {
        return getters.asyncTasks.filter(task => task.channel === id);
      };
    },
  },
  actions: {
    activateTaskUpdateTimer(store) {
      const interval = store.getters.activeTasks.length
        ? RUNNING_TASK_INTERVAL
        : DEFAULT_CHECK_INTERVAL;
      taskUpdateTimer = setTimeout(() => {
        store.dispatch('updateTaskList');
      }, interval);
    },
    deleteTask(store, task) {
      clearTimeout(taskUpdateTimer);
      store.commit('REMOVE_ASYNC_TASK', task);
      return Task.deleteModel(task.task_id).then(() => store.dispatch('activateTaskUpdateTimer'));
    },
    updateTaskList(store) {
      if (store.rootGetters.loggedIn) {
        return Task.where({ channel: store.rootState.currentChannel.currentChannelId })
          .then(tasks => {
            store.commit('SET_ASYNC_TASKS', tasks);
            store.dispatch('activateTaskUpdateTimer');
          })
          .catch(e => {
            // if not authorized, redirect to login screen
            if (e.response.status === 403) {
              window.location.href = urls.login();
              return;
            }
            store.dispatch('activateTaskUpdateTimer');
          });
      } else {
        //  for cases where this.$router doesn't exist when user is signed out,
        // use window.Urls to redirect to login
        window.location.href = urls.login();
      }
    },
  },
  mutations: {
    ADD_ASYNC_TASK(state, task) {
      Vue.set(state.asyncTasksMap, task.task_id, task);
    },
    SET_ASYNC_TASKS(state, asyncTasks) {
      for (let task of asyncTasks) {
        Vue.set(state.asyncTasksMap, task.task_id, task);
      }
    },
    REMOVE_ASYNC_TASK(state, asyncTask) {
      Vue.delete(state.asyncTasksMap, asyncTask.task_id);
    },
  },
  listeners: {
    [TABLE_NAMES.TASK]: {
      [CHANGE_TYPES.CREATED]: 'ADD_ASYNC_TASK',
      [CHANGE_TYPES.UPDATED]: 'ADD_ASYNC_TASK',
      [CHANGE_TYPES.DELETED]: 'REMOVE_ASYNC_TASK',
    },
  },
};
