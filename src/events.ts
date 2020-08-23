import { Event } from "@kaviar/core";
import {
  IUser,
  IPermission,
  ISession,
  ICreateSessionOptions,
  IPermissionSearchFilter,
} from "./defs";

export class UserBeforeCreateEvent extends Event<{ user: Partial<IUser> }> {}
export class UserAfterCreateEvent extends Event<{ userId: any }> {}

export class UserBeforeUpdateEvent extends Event<{
  userId: any;
  data: object;
}> {}
export class UserAfterUpdateEvent extends Event<{
  userId: any;
  data: object;
}> {}

export class UserBeforeDeleteEvent extends Event<{
  userId: any;
}> {}
export class UserAfterDeleteEvent extends Event<{
  userId: any;
}> {}

export class UserBeforeLoginEvent extends Event<{
  userId: any;
  authenticationStrategy?: string;
}> {}
export class UserAfterLoginEvent extends Event<{
  userId: any;
  authenticationStrategy?: string;
}> {}

export class UserBeforeLogoutEvent extends Event<{
  userId: any;
  authenticationStrategy?: string;
}> {}
export class UserAfterLogoutEvent extends Event<{
  userId: any;
  authenticationStrategy?: string;
}> {}

export class UserDisabledEvent extends Event<{
  userId: any;
}> {}

export class UserEnabledEvent extends Event<{
  userId: any;
}> {}

export class UserBeforeAddPermissionEvent extends Event<{
  permission: IPermission;
}> {}
export class UserAfterAddPermissionEvent extends Event<{
  permission: IPermission;
}> {}

export class UserBeforeRemovePermissionEvent extends Event<{
  filters: IPermissionSearchFilter;
}> {}
export class UserAfterRemovePermissionEvent extends Event<{
  filters: IPermissionSearchFilter;
}> {}

export class SessionRetrievedEvent extends Event<{
  session: ISession;
}> {}

export class SessionBeforeCreateEvent extends Event<{
  userId: any;
  options: ICreateSessionOptions;
}> {}

export class SessionAfterCreateEvent extends Event<{
  userId: any;
  token: any;
  options: ICreateSessionOptions;
}> {}
