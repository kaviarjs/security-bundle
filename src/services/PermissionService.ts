import { Inject, Service, EventManager } from "@kaviar/core";
import { PermissionGraph } from "./PermissionGraph";
import {
  UserBeforeRemovePermissionEvent,
  UserAfterRemovePermissionEvent,
} from "../events";
import {
  UserBeforeAddPermissionEvent,
  UserAfterAddPermissionEvent,
} from "../events";
import {
  IPermissionPersistance,
  IPermissionService,
  IPermission,
  IPermissionSearchFilter,
  IPermissionSearchFilters,
} from "../defs";
import { PERMISSION_PERSISTANCE_LAYER } from "../constants";

@Service()
export class PermissionService implements IPermissionService {
  constructor(
    @Inject(PERMISSION_PERSISTANCE_LAYER)
    public readonly persistance: IPermissionPersistance,
    public readonly permissionGraph: PermissionGraph,
    protected readonly eventManager: EventManager
  ) {}

  async has(filter: IPermissionSearchFilter): Promise<boolean> {
    if (filter.userId === null || filter.userId === undefined) {
      throw new Error(`UserId is required.`);
    }

    const filters = this.transformToFilters(filter);

    const permissions = filters.permission;
    if (filters.permission) {
      const parentPermissions = this.permissionGraph.getParentRolesOf(
        filters.permission
      );

      permissions.push(...parentPermissions);
    }

    const result = await this.persistance.countPermissions({
      userId: filters.userId,
      permission: permissions,
      domain: filters.domain,
      domainIdentifier: filters.domainIdentifier,
    });

    return result > 0;
  }

  async add(permission: IPermission) {
    await this.eventManager.emit(
      new UserBeforeAddPermissionEvent({
        permission,
      })
    );

    await this.persistance.insertPermission(permission);

    await this.eventManager.emit(
      new UserAfterAddPermissionEvent({
        permission,
      })
    );
  }

  async remove(filter: IPermissionSearchFilter) {
    const filters = this.transformToFilters(filter);

    await this.eventManager.emit(
      new UserBeforeRemovePermissionEvent({
        filters,
      })
    );

    await this.persistance.removePermission(filters);

    await this.eventManager.emit(
      new UserAfterRemovePermissionEvent({
        filters,
      })
    );
  }

  /**
   * Search permissions
   */
  async findPermissions(
    search: IPermissionSearchFilter = {}
  ): Promise<IPermission[]> {
    const newSearch = this.transformToFilters(search);

    return this.persistance.findPermissions(newSearch);
  }

  /**
   * Finds a single permission
   */
  async findPermission(
    search: IPermissionSearchFilter = {}
  ): Promise<IPermission> {
    const newSearch = this.transformToFilters(search);

    return this.persistance.findPermission(newSearch);
  }

  /**
   * Prepares your easy search and transforms it so it reaches persistance layers properly
   * @param object
   */
  protected transformToFilters(
    object,
    adaptToDefaultDomain: boolean = true
  ): IPermissionSearchFilters {
    const newObject = {};
    ["userId", "permission", "domain", "domainIdentifier"].forEach((key) => {
      if (object[key]) {
        newObject[key] = Array.isArray(object[key])
          ? object[key]
          : [object[key]];
      }
    });

    return newObject;
  }

  /**
   * Returns all the domains the user belongs to
   * This is useful for when performing search and viewing all the roles of the user
   *
   * @param userId
   */
  async findDomains(userId) {
    return this.persistance.findDomains(userId);
  }
}
