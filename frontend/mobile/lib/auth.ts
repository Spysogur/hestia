import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "./api";
import { User } from "./types";

const USER_KEY = "hestia_user";

// SecureStore doesn't work on web — fallback to localStorage
async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await deleteItem(TOKEN_KEY);
}

export async function saveUser(user: User): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function removeUser(): Promise<void> {
  await deleteItem(USER_KEY);
}

export async function clearAuth(): Promise<void> {
  await Promise.all([removeToken(), removeUser()]);
}
