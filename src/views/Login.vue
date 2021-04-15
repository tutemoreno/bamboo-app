<template>
  <v-container fluid fill-height>
    <v-row justify="center">
      <v-col class="secondary" cols="12" sm="6" md="4">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="E-mail"
            outlined
            required
            @change="
              (e) => {
                signUpMode ? checkIfAlreadyExists(e.target.value) : null;
              }
            "
          ></v-text-field>

          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="Contraseña"
            outlined
            required
          ></v-text-field>

          <v-expand-transition>
            <v-text-field
              v-show="signUpMode"
              v-model="confirmPassword"
              :rules="confirmPasswordRules"
              label="Confirmar contraseña"
              outlined
              required
            ></v-text-field>
          </v-expand-transition>

          <v-row class="mb-2" justify="space-around" align="center">
            <v-checkbox v-model="rememberMe" label="Recordar"></v-checkbox>

            <v-btn :disabled="!valid" @click="startSession">
              iniciar sesión
            </v-btn>
          </v-row>

          <v-expand-transition>
            <div v-show="!signUpMode">
              <v-btn block class="mb-2">google</v-btn>

              <v-btn block class="mb-2">facebook</v-btn>
            </div>
          </v-expand-transition>
          <v-btn block class="mb-2" @click="signUpMode = true">
            registrarme
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from 'vuex';
import axios from 'axios';

export default {
  name: 'Login',
  components: {},
  data() {
    return {
      valid: false,
      emailRules: [
        (v) => !!v || 'El E-mail es requerido',
        (v) => /.+@.+\..+/.test(v) || 'Debe ser un E-mail válido',
      ],
      passwordRules: [(v) => !!v || 'La contraseña es requerida'],
      confirmPasswordRules: [
        (v) => !!v || 'La contraseña es requerida',
        (v) => v == this.password || 'Las contraseñas no coinciden',
      ],
      email: null,
      password: null,
      confirmPassword: null,
      rememberMe: false,
      signUpMode: false,
    };
  },
  methods: {
    ...mapActions('accounts', ['signIn', 'checkIfAlreadyExists']),
    startSession() {},
    newUser() {},
    async signUpWithServer() {
      const { username, password, confirmPassword } = this;

      if (password != confirmPassword)
        return this.setLoginNotification('Password fo not match!');

      this.setLoginNotification(null);

      const response = await axios({
        method: 'post',
        url: '/accounts/server/signUp',
        data: { username, password },
      });

      if (response.status == 200) {
        this.password = null;
        this.confirmPassword = null;

        this.setSignUpMode(false);
      } else this.setLoginNotification(response.data.message);
    },
    async signInWithServer() {
      const { username, password, rememberMe } = this;

      this.signIn({
        data: { username, password },
        mode: 'server',
        rememberMe,
        didLoggedIn: this.didLoggedIn,
      });
    },
    signInWithGoogle() {
      this.$gAuth
        .signIn()
        .then((GoogleUser) => {
          this.signIn({
            data: {
              token: GoogleUser.getAuthResponse().access_token,
              userId: GoogleUser.getId(),
            },
            mode: 'google',
            rememberMe: this.rememberMe,
            didLoggedIn: this.didLoggedIn,
          });
        })
        .catch((error) => {
          console.log('error', error);
        });
    },
    signInWithFacebook() {
      window.FB.login((response) => {
        const {
          authResponse: { accessToken, userID },
        } = response;

        this.signIn({
          data: { token: accessToken, userId: userID },
          mode: 'facebook',
          rememberMe: this.rememberMe,
          didLoggedIn: this.didLoggedIn,
        });
      }, this.params);
    },
  },
};
</script>
