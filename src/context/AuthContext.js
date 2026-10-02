import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { registrarHandlerNoAutorizado } from '../api/apiConfig';
import { STORAGE_KEYS } from '../constants/config';
import { borrar, guardar, leer } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const guardarSesion = useCallback(async (respuesta) => {
    const { token, ...datosUsuario } = respuesta;
    await guardar(STORAGE_KEYS.token, token);
    await guardar(STORAGE_KEYS.usuario, JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }, []);

  const logout = useCallback(async () => {
    await borrar(STORAGE_KEYS.token);
    await borrar(STORAGE_KEYS.usuario);
    setUsuario(null);
  }, []);

  // Restaura la sesión guardada al abrir la app
  useEffect(() => {
    (async () => {
      try {
        const token = await leer(STORAGE_KEYS.token);
        const guardado = await leer(STORAGE_KEYS.usuario);
        if (token && guardado) {
          setUsuario(JSON.parse(guardado));
          // Refresca el perfil por si cambió (foto, admin, bloqueo)
          try {
            const perfil = await authApi.obtenerPerfil();
            setUsuario(perfil);
            await guardar(STORAGE_KEYS.usuario, JSON.stringify(perfil));
          } catch {
            // Si el token venció, el interceptor dispara logout
          }
        }
      } finally {
        setCargandoSesion(false);
      }
    })();
  }, []);

  useEffect(() => {
    registrarHandlerNoAutorizado(logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    await guardarSesion(res);
    return res;
  }, [guardarSesion]);

  const registro = useCallback(async (datos) => {
    const res = await authApi.registro(datos);
    await guardarSesion(res);
    return res;
  }, [guardarSesion]);

  const actualizarUsuario = useCallback(async (parcial) => {
    setUsuario((prev) => {
      const nuevo = { ...prev, ...parcial };
      guardar(STORAGE_KEYS.usuario, JSON.stringify(nuevo));
      return nuevo;
    });
  }, []);

  const value = useMemo(() => ({
    usuario,
    esAdmin: !!usuario?.esAdmin,
    esSuperAdmin: !!usuario?.esSuperAdmin,
    autenticado: !!usuario,
    cargandoSesion,
    login,
    registro,
    logout,
    actualizarUsuario,
  }), [usuario, cargandoSesion, login, registro, logout, actualizarUsuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
