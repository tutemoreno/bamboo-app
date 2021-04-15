import router from '../router';
import axios from 'axios';

import { getStore, setStore } from '@/config/utils';

export default {
  namespaced: true,
  state: {
    loginNotification: null,
    signUpMode: false,
  },
  mutations: {
    setSignUpMode(state, mode) {
      state.signUpMode = mode;
    },
    setLoginNotification(state, notification) {
      state.loginNotification = notification;
    },
  },
  actions: {
    async checkIfAlreadyExists({ commit }, username) {
      const { data } = await axios({
        method: 'post',
        url: '/accounts/server/checkIfAlreadyExists',
        data: { username },
      });

      commit('setLoginNotification', data.exists ? data.message : null);
    },
    async signIn({ commit }, options) {
      const { data, mode, rememberMe } = options;

      const response = await axios({
        method: 'post',
        url: `/accounts/${mode}/signIn`,
        data,
      });

      if (response.status == 200) {
        options.didLoggedIn();
        setStore('mmoreno-app-user', response.data, rememberMe);
        router.push('/');
      } else commit('setLoginNotification', response.data.message);
    },
  },
  getters: {
    getUserInfo() {
      return getStore('mmoreno-app-user');
    },
    getLoginNotification(state) {
      return state.loginNotification;
    },
    getSignUpMode(state) {
      return state.signUpMode;
    },
  },
};
