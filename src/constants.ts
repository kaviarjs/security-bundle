import { Token } from "@kaviar/core";

export const USER_PERSISTANCE_LAYER = new Token<any>();
export const SESSION_PERSISTANCE_LAYER = new Token();
export const PERMISSION_PERSISTANCE_LAYER = new Token();
export const PERMISSION_GRAPH = new Token();

export const PERMISSION_DEFAULT_DOMAIN = "app";
