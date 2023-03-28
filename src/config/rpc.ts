import { FetchMiddleware } from "@solana/web3.js";

interface ITokenStorage {
  setToken(token: string): void;
  getToken(): string | null;
  getTimeSinceLastSet(): number | null;
}

const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : require("localstorage-memory");

export class LocalTokenStorage implements ITokenStorage {
  setToken(token: string): void {
    storage.setItem("auth-token-2", token);
    storage.setItem("last-set", new Date().valueOf());
  }
  getTimeSinceLastSet(): number | null {
    if (storage.getItem("last-set")) {
      return new Date().valueOf() - Number(storage.getItem("last-set"));
    }
    return null;
  }
  getToken(): string | null {
    return storage.getItem("auth-token-2");
  }
}

export interface ITokenAuthFetchMiddlewareArgs {
  /**
   * An api endpoint to get a new token. Default /api/get-token
   */
  getTokenUrl?: string;
  /**
   * Optionally override the default storage mechanism of localStorage
   */
  tokenStorage?: ITokenStorage;
  /**
   * Number of milliseconds until token expiry. Default 5 minutes
   */
  tokenExpiry?: number;

  /**
   * Logic to get an authorization token
   */
  getToken: () => Promise<string>;
}

type tokenAuthFetch = (url: string, req: any) => void;

export function tokenAuthFetchMiddleware({
  tokenStorage = new LocalTokenStorage(),
  tokenExpiry = 50 * 60 * 1000, // 50 minutes
  getToken
}: ITokenAuthFetchMiddlewareArgs): FetchMiddleware {
  return (url: string, options: any, fetch: tokenAuthFetch) => {
    (async () => {
      try {
        const token = tokenStorage.getToken();
        const timeSinceLastSet = tokenStorage.getTimeSinceLastSet();
        const tokenIsValid =
          token && timeSinceLastSet && timeSinceLastSet < tokenExpiry;

        if (!tokenIsValid) {
          tokenStorage.setToken(await getToken());
        }
      } catch (e: any) {
        console.error(e);
      }
      fetch(url, {
        ...(options || {}),
        headers: {
          ...(options || {}).headers,
          "Authorization": "Bearer " + tokenStorage.getToken(),
        },
      });
    })();
  };
}

export const getGenesysGoToken = async () => {
  const URL = process.env.REACT_APP_CHART_API || 'https://dry-ravine-67635.herokuapp.com';
  const req = await fetch(`${URL}/login`);
  const { access_token }: { access_token: string } = await req.json();
  return access_token;
};
