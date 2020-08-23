import { SecurityService } from "../..";
import { assert } from "chai";
import { UserPersistanceService } from "./mocks/UserPersistanceService.mock";
import { EventManager } from "@kaviar/core";
import { SessionPersistanceService } from "./mocks/SessionPersistanceService.mock";

export const securityTestDefinitions = [
  {
    message: "Standard user creation and manipulation",
    async test(securityService: SecurityService) {
      let userId, user;
      userId = await securityService.createUser({});

      await securityService.updateUser(userId, {
        name: "Hello",
      });

      user = await securityService.findUserById(userId);
      assert.equal(user.name, "Hello");
    },
  },
  {
    message: "Should allow authentication",
    async test(securityService: SecurityService) {
      let userId, user;
      userId = await securityService.createUser({});

      const token = await securityService.createSession(userId, {
        data: {
          a: "TEST",
        },
      });

      const tokenData = await securityService.getSession(token);

      assert.equal(tokenData.userId.toString(), userId.toString());
      assert.equal(tokenData.data?.a, "TEST");
    },
  },
  {
    message: "Should allow logging out",
    async test(securityService: SecurityService) {
      let userId, token;
      userId = await securityService.createUser({});

      token = await securityService.createSession(userId);
      const tokenData = await securityService.getSession(token);

      await securityService.logout(token);

      return expect(securityService.getSession(token)).resolves.toBe(null);
    },
  },
];

export function securityServiceCreator(): SecurityService {
  const userPersistance = new UserPersistanceService();
  const sessionPersistance = new SessionPersistanceService();
  const eventManager = new EventManager();

  return new SecurityService(userPersistance, sessionPersistance, eventManager);
}
