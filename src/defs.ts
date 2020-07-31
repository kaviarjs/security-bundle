export interface ISecurityBundleConfig {
  userPersistance?: { new (...args: any[]): IUserPersistance };
  sessionPersistance?: { new (...args: any[]): ISessionPersistance };
  permissionPersistance?: { new (...args: any[]): IPermissionPersistance };
  permissionTree?: IPermissionTree;
  session?: {
    expiresIn?: string;
    cleanup?: boolean;
    cleanupInterval?: string;
  };
}

export interface Constructor<T> {
  new (...args: any[]): T;
}

export interface IUser {
  _id?: any;
  isEnabled: boolean;
  createdAt: Date;
  lastLoginAt?: Date;

  // And others
  [key: string]: any;
}

export interface IFieldMap {
  [key: string]: number;
}

export interface IPermissioning {
  addPermission(userPermission: IPermission): any;
  hasPermission(
    userId: any,
    permission: string,
    domain?: string,
    domainIdentifier?: string
  );

  findPermission(
    userId: any,
    permission: string,
    domain?: string,
    domainIdentifier?: string
  );

  findPermissions(
    userId: any,
    permission?: string,
    domain?: string,
    domainIdentifier?: string
  );
  removePermission(
    userId: any,
    permission: string,
    domain?: string,
    domainIdentifier?: string
  );
  removePermissions(
    userId: any,
    permission?: string,
    domain?: string,
    domainIdentifier?: string
  );
}

export interface IUserPersistance {
  insertUser(data): Promise<any>; // returns UserID
  updateUser(userId, data): Promise<void>; // $set, returns void
  deleteUser(userId): Promise<void>;

  findUser(filters, fields?: IFieldMap): Promise<IUser>;
  findUserById(userId: any, fields?: IFieldMap): Promise<IUser>;

  findThroughAuthenticationStrategy<T = any>(
    strategyName: string,
    filters,
    fields?: IFieldMap
  ): Promise<null | FindAuthenticationStrategyResponse<T>>;
  removeAuthenticationStrategyData(
    userId,
    authenticationStrategyName: string
  ): Promise<void>;
  updateAuthenticationStrategyData<T = any>(
    userId: any,
    authenticationStrategyName: string,
    data: Partial<T>
  ): Promise<void>;
  getAuthenticationStrategyData<T = any>(
    userId: any,
    authenticationStrategyName: string,
    fields?: IFieldMap
  ): Promise<Partial<T>>;
}

export interface ISession {
  token: string;
  userId: any;
  expiresAt: Date;
  [key: string]: any;
}

export interface ISessionPersistance {
  /**
   * Returns the token newly generated
   * @param sessionData
   */
  newSession(userId, expiresAt: Date, data?: any): Promise<string>;
  getSession(token: string): Promise<ISession>;
  deleteSession(token: string): Promise<void>;
  deleteAllSessionsForUser(userId: any): Promise<void>;
  /**
   * Cleanup old, no longer available, expired tokens
   */
  cleanExpiredTokens(): Promise<void>;
}

export interface IPermissionPersistance {
  insertPermission(permission: IPermission): Promise<any>;
  removePermission(filters: IPermissionSearchFilters): Promise<void>;
  countPermissions(filters: IPermissionSearchFilters): Promise<number>;
  findPermissions(search: IPermissionSearchFilters): Promise<IPermission[]>;
  findPermission(search: IPermissionSearchFilters): Promise<IPermission>;
  findDomains(userId: any): Promise<string[]>;
}

export interface IPermissionSearchFilter {
  userId?: any | any[];
  permission?: string | string[];
  domain?: string | string[];
  domainIdentifier?: string | string[];
}

export interface IPermissionSearchFilters {
  userId?: any[];
  permission?: string[];
  domain?: string[];
  domainIdentifier?: string[];
}

export interface IPermissionSearch {
  userId?: any;
  permission?: string;
  domain?: string;
  domainIdentifier?: string;
}

export interface IPermissionManipulation {
  userId: any;
  permission: string;
  domain: string;
  domainIdentifier?: string;
}

export interface IPermission {
  userId: any;
  permission: string;
  domain?: string;
  domainIdentifier?: string;
}

export interface IPermissionTree {
  [key: string]: number | IPermissionTree;
}

export interface IPermissionService {
  add(permission: IPermissionManipulation): Promise<void>;
  remove(permission: IPermissionManipulation): Promise<void>;
  has(permission: IPermissionManipulation): Promise<boolean>;
  findPermissions(search: IPermissionSearchFilter): Promise<IPermission[]>;
  findPermission(search: IPermissionSearchFilter): Promise<IPermission>;
  findDomains(userId: any): Promise<string[]>;
}

export interface ISecurityService {
  /**
   * Returns userId
   */
  createUser(data): Promise<any>;
  updateUser(userId, data: object): Promise<void>;
  deleteUser(userId): Promise<void>;

  findUser(filters, fields?: IFieldMap): Promise<Partial<IUser>>;
  findUserById(userId: any, fields?: IFieldMap): Promise<Partial<IUser>>;

  login(userId, options: ICreateSessionOptions): Promise<string>;
  logout(userId: any): Promise<void>;

  createSession(userId, options?: ICreateSessionOptions): Promise<string>;
  getSession(token): Promise<ISession>;

  updateAuthenticationStrategyData<T = any>(
    userId: any,
    strategyName: string,
    data: Partial<T>
  ): Promise<void>;
  findThroughAuthenticationStrategy<T = any>(
    strategyName: string,
    filters,
    fields?: IFieldMap
  ): Promise<null | FindAuthenticationStrategyResponse<T>>;
  getAuthenticationStrategyData<T = any>(
    userId: any,
    strategyName: string,
    fields?: IFieldMap
  ): Promise<Partial<T>>;
  removeAuthenticationStrategyData(
    userId: any,
    strategyName: string
  ): Promise<any>;
  isUserEnabled(userId: any): Promise<boolean>;
  enableUser(userId: any): Promise<void>;
  disableUser(userId: any): Promise<void>;
}

export interface FindAuthenticationStrategyResponse<T = any> {
  userId: any;
  strategy: T;
}

export interface ICreateSessionOptions {
  authenticationStrategy?: string;
  /**
   * This is for storing additional data inside the token that we may need later
   */
  data?: any;
  /**
   * npm package zeit/ms format
   */
  expiresIn?: string;
}
