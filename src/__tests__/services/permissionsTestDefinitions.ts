import { Permissions, PermissionTree } from "./mocks/permissionTree.mock";
import { assert } from "chai";
import { PermissionService, PermissionGraph, IPermissionService } from "../..";
import { PermissionsPersistanceService } from "./mocks/PermissionsPersistanceService.mock";
import { EventManager } from "@kaviar/core";

const permission = new PermissionGraph(PermissionTree);
const PERMISSION_DEFAULT_DOMAIN = "app";

export function permissionServiceCreator(): PermissionService {
  const permissionPersistanceLayer = new PermissionsPersistanceService();
  const eventManager = new EventManager();

  return new PermissionService(
    permissionPersistanceLayer,
    permission,
    eventManager
  );
}

export const permissionServiceTestDefinitions = [
  {
    message: "Should work with no domains",
    async test(service: PermissionService) {
      await service.add({
        userId: "U1",
        permission: Permissions.ADMIN,
        domain: PERMISSION_DEFAULT_DOMAIN,
      });

      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.ADMIN,
        })
      );

      await service.remove({
        userId: "U1",
        permission: Permissions.ADMIN,
      });

      assert.isFalse(
        await service.has({
          userId: "U1",
          permission: Permissions.ADMIN,
        })
      );
    },
  },
  {
    message: "Should work with nested role",
    async test(service: PermissionService) {
      await service.add({
        userId: "U1",
        permission: Permissions.ADMIN,
        domain: PERMISSION_DEFAULT_DOMAIN,
      });

      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.INVOICE_MANAGEMENT,
        })
      );

      await service.remove({
        userId: "U1",
        permission: Permissions.ADMIN,
      });

      assert.isFalse(
        await service.has({
          userId: "U1",
          permission: Permissions.INVOICE_MANAGEMENT,
        })
      );
    },
  },
  {
    message: "Should work with domains",
    async test(service: PermissionService) {
      await service.add({
        userId: "U1",
        permission: Permissions.ADMIN,
        domain: "Legal",
      });

      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.ADMIN,
        })
      );
      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.INVOICE_MANAGEMENT,
        })
      );
      assert.isFalse(
        await service.has({
          userId: "U1",
          permission: Permissions.ADMIN,
          domain: "Health",
        })
      );
      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.ADMIN,
          domain: "Legal",
        })
      );
      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.INVOICE_MANAGEMENT,
          domain: "Legal",
        })
      );
    },
  },
  {
    message: "Should work with domains and their ids",
    async test(service: PermissionService) {
      await service.add({
        userId: "U1",
        permission: Permissions.ADMIN,
        domain: "Legal",
        domainIdentifier: "BLOCK6",
      });

      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.INVOICE_MANAGEMENT,
          domain: "Legal",
        })
      );

      assert.isFalse(
        await service.has({
          userId: "U1",
          permission: Permissions.INVOICE_MANAGEMENT,
          domain: "Legal",
          domainIdentifier: "C4",
        })
      );

      assert.isTrue(
        await service.has({
          userId: "U1",
          permission: Permissions.INVOICE_MANAGEMENT,
          domain: "Legal",
          domainIdentifier: "BLOCK6",
        })
      );
    },
  },
  {
    message: "Should work finding all permissions and all domains",
    async test(service: IPermissionService) {
      await service.add({
        userId: "U1",
        permission: Permissions.ADMIN,
        domain: "Legal",
        domainIdentifier: "BLOCK6",
      });
      await service.add({
        userId: "U1",
        permission: Permissions.ADMIN,
        domain: "Health",
        domainIdentifier: "BLOCK6",
      });

      let permissions, domains;

      permissions = await service.findPermissions({
        userId: "U1",
      });
      assert.lengthOf(permissions, 2);

      permissions = await service.findPermissions({
        userId: "U1",
        domain: "Legal",
      });
      assert.lengthOf(permissions, 1);

      permissions = await service.findPermissions({
        userId: "U1",
        domainIdentifier: "BLOCK6",
      });
      assert.lengthOf(permissions, 2);

      domains = await service.findDomains("U1");
      assert.lengthOf(domains, 2);
      assert.include(domains, "Legal");
      assert.include(domains, "Health");
    },
  },
];
