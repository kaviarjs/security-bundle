import { PermissionGraph } from "../../services/PermissionGraph";
import { IPermissionTree } from "../../defs";
import { assert } from "chai";
import { Permissions, PermissionTree } from "./mocks/permissionTree.mock";

describe("PermissionGraph", () => {
  it("Should instantiate", () => {
    const permission = new PermissionGraph(PermissionTree);

    const result1 = permission.getParentRolesOf(Permissions.INVOICE_MANAGEMENT);
    assert.deepEqual(result1, [Permissions.ADMIN]);

    const result2 = permission.getParentRolesOf(Permissions.INVOICE_READ);
    assert.deepEqual(result2, [
      Permissions.ADMIN,
      Permissions.INVOICE_MANAGEMENT,
    ]);

    const result3 = permission.getSubRolesOf(Permissions.ADMIN);
    assert.deepEqual(result3, [
      Permissions.INVOICE_READ,
      Permissions.INVOICE_CREATE,
      Permissions.INVOICE_MARK_AS_PAID,
      Permissions.INVOICE_MANAGEMENT,
    ]);

    assert.isTrue(true);
  });
});
