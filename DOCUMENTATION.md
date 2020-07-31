This bundle does not have any preference for your database, as the persistance layers (for Permissions and Users) are completely decoupled. You can make it work with any database/api later down the road.

## Install

```bash
npm install @kaviar/security-bundle
```

```typescript
import { SecurityBundle } from "@kaviar/security-bundle";

kernel.addBundle(new SecurityBundle({}));
```

## Persistance Layers

So, in our current bundle we refer to persistence layers, as the services which lets us find, insert, update and remove different aspects of our models `User`, `Permission`, `Session`.

Currently, our recommended implementation for MongoDB here:

```js
import { MongoBundle } from "@kaviar/mongo-bundle";
import { SecurityMongoBundle } from "@kaviar/security-mongo-bundle";

kernel.addBundles([
  // order does not matter
  new SecurityBundle(options),
  new MongoBundle({
    uri: "mongodb://localhost:27017/app",
  }),

  // This bundle works together with MongoBundle
  // And it creates the collections "users", "permissions", and "sessions"
  new SecurityMongoBundle(),
]);
```

If you later, for example, want to move sessions to redis, or something faster, you can easily override the bundle. One big advantage using this is that you are never locked-in, you can always swap things, we try as much as possible to depend on abstractions rather than implementations, but at the same time want to make it plug-in to just start playing with this.

```typescript
new SecurityMongoBundle({
  sessionsCollection: null;
})
```

And then you inject on the SecurityBundle, setSessionsPersistance() your own adapter which implements ISessionPersistance

## Creating and Authenticating Users

The user interface looks something like this:

```typescript
export interface IUser {
  _id?: any;
  isEnabled: boolean;
  createdAt: Date;
  lastLoginAt?: Date;

  // And others
  [key: string]: any;
}
```

```js
const securityService = container.get(SecurityService);

const userId = await securityService.createUser({
  name: "Name",
});

await securityService.updateUser(userId, {
  name: "New Name",
});

await securityService.deleteUser(userId);
```

Now, let's authenticate the user, shall we?

```js
const sessionToken = await securityService.login(userId, {
  expiresIn: '14d' // zeit/ms kind
  data: {
    // Other data you would like to store in the session
  }
});

const session: ISession = await securityService.getSession(sessionToken);

// And session looks something like this, you can easily get the user

export interface ISession {
  token: string;
  userId: any;
  expiresAt: Date;
  [key: string]: any;
}

// And simply remove the token
await securityService.logout(sessionToken);
```

There are other helpful methods that you can use with `SecurityService`, and you can also do things like:

Log out all the users, not a specific token:

```typescript
const { sessionPersistanceLayer } = securityService;
await sessionPersistanceLayer.deleteAllSessionsForUser(userId);
```

Clean expired tokens. You may want to introduce this in your cronjob bundle.

```typescript
await sessionPersistanceLayer.cleanExpiredTokens();
```

## Authentication Strategies

Alright we do authentication, but based on what? Well, we have passwords, biometric data, github, google. There are many ways to authenticate users. Let's see how the security service comes in our aid.

Firstly, we expose methods of searching and manipulating authentication strategy data:

```typescript
  // Update is also considered "creation"
  updateAuthenticationStrategyData(
    userId: any,
    strategyName: string,
    data: object
  ): Promise<void>;

  // Searches by the data stored in authentication method's object
  findThroughAuthenticationStrategy<T = any>(
    strategyName: string,
    filters,
    fields?: IFieldMap
  ): Promise<FindAuthenticationStrategyResponse<T>>; // Returns userId and method with the data

  getAuthenticationStrategyData(userId: any, strategyName: string): Promise<any>;
  removeAuthenticationStrategyData(userId: any, strategyName: string): Promise<any>;
```

So, we attach to user an authentication method, and it's up to the persistance layer how to store it, we just need a way to find the user by some fields in that data, and update that data.

Based on this you can have an authentication method called "password", and inside this method you store things such as `passwordHash` and others. And when an authentication is tried, you can fetch let's say the user by username which you also store in that method (via `findThroughAuthenticationStrategy("password", { username })`). And you can access the user's password hash, if it matches, you create a session and attach it to that user.

The concept is pretty simple, and what is beautiful is that:

1. It's completely flexible. We don't say how you should structure your methods or force you into our abstractions.
2. If, in time, we have 50 authentication methods open-sourced that use this bundle, you basically can switch to any database without reinventing the wheel.

## Permissioning

We dealth with authentication now let's deal with authorization. We had to solve some interesting problems, first we needed a permission "graph" that would allow us to easily to authorise persons.

For example, let's say we have "Posts" collection, and we have `POST_ADMINISTRATOR` permission, and we have a `ADMINISTRATOR` permission. In theory, the `ADMINISTRATOR` can do anything so you will be tempted to check the condition like this:

```typescript
if (hasAdministratorRole() || hasPostAdministratorRole()) {
  // NOT GOOD
}
```

So we need an hierarchy, let's construct it, make it a bit more complex so we better illustrate the idea.

```typescript
// Ensure that all are unique
const Permissions = {
  Administrator: "ADMINISTRATOR",
  PostAdministrator: "POST_ADMINISTRATOR",
  PostListView: "POST_LIST_VIEW",
  PostEdit: "POST_EDIT",
};

// You can also use enum, but we also prefer you use strings instead of numeric values
// As your application will grow and you really don't want that hassle
enum Permissions {
  Administrator = "ADMINISTRATOR",
}
```

Now that we defined our permissions, let's define the tree:

```typescript
// Shorthand
const $ = Permissions;

const PermissionGraph = {
  [$.Administrator]: {
    [$.PostAdministrator]: 1,
  },
  [$.PostAdministrator]: {
    [$.PostListView]: 1,
    [$.PostEdit]: 1,
  },
};
```

Now what would be really cool, is that no matter what role you have either `Administrator`, `PostAdministrator`, if now you want to check `PostEdit` it should work. This is the beautiful thing. It acts as a graph, but think of it as a tree, but you may find yourself in strange situations so it supports recursive dependencies and many more.

Let's introduce our friend the `PermissionService`:

```typescript
add(permission: IPermission): Promise<void>;
remove(filter: PermissionSearchFilter): Promise<void>;
has(permission: IPermission): Promise<boolean>;
findPermissions(filter: PermissionSearchFilter): Promise<IPermission[]>;
findPermission(filter: PermissionSearchFilter): Promise<IPermission[]>;
findDomains(userId: any): Promise<string[]>;

// And the permission looks like this:
export interface IPermission {
  userId: any;
  permission: string;
  domain: string;
  domainIdentifier?: string;
}
```

It seems pretty straight-forward. You add permissions, remove them, and test if it has them.

```typescript
import { PermissionService } from "@kaviar/security-bundle";

const permissionService = container.get(PermissionService);
const APP_DOMAIN = "app";

await permissionService.add({
  userId: "xxx",
  permission: $.PostAdministrator,
  domain: APP_DOMAIN,
});

await permissionService.has({
  userId: "xxx",
  permission: $.PostListView,
  domain: APP_DOMAIN,
}); // true, the graph is constructed

await permissionService.remove({
  userId: "xxx",
  permission: $.PostListView,
  domain: APP_DOMAIN,
});
```

Another level of abstraction that we are going to introduce is `domainIdentifier`. We currently kinda force the developer to specify the domain even if in most cases you are talking about an application-level role, like "ADMIN" or "MANAGER". We'd use different domain names for various reasons:

- Give rights differently to different sections of the app:
  - `ADMIN` role on `ProjectManagement` domain
  - `MODERATOR` role on `BlogPost` domain
- Give rights to certain objects in your database
  - `ADMIN` role on `Post` domain with `postId` as domain identifier.

```typescript
// tree
{
  $.Admin: {
    $.Viewer: 1,
  }
}

await permissionService.add({
  userId,
  permission: $.Admin,
  domain: Domains.Finance,
});

await permissionService.add({
  userId,
  permission: $.Viewer,
  domain: Domains.Marketing,
});

// True
await permissionService.has({
  userId,
  permission: $.Viewer,
  domain: Domains.Finance
})


// False
await permissionService.has(userId, {
  permission: $.Admin,
  domain: Domains.Marketing
})
```

And for the domain identifier the logic is very similar. Let's say we have "Groups":

```typescript
await permissionService.add(userId, {
  permission: $.Viewer,
  domain: Domains.Groups,
  domainIdentifier: groupId,
});

await permissionService.add(userId, {
  permission: $.Viewer,
  domain: Domains.Groups,
  domainIdentifier: groupId,
});
```

You may want to see all users who are viewers of Domain.Groups with that specific `groupId`:

```typescript
permissionService.findPermissions({
  domain: Domains.Groups,
  domainIdentifier: groupId,
});
```

When searching/removing/using has, you can filter by 4 dimensions:

- userId
- permission
- domain
- domainIdentifier

If you specify an array then it'll find all the elements matching that array:

```js
{
  userId: [user1Id, user2Id];
}
// Will return all permissions belonging to user1Id and user2Id
// The others aren't specified so they can be anything
```
