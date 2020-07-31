import { IPermissionTree } from "../defs";
import { DepGraph } from "dependency-graph";
import { Service } from "@kaviar/core";

@Service()
export class PermissionGraph {
  public readonly graph: DepGraph<any>;

  constructor(public readonly tree: IPermissionTree) {
    this.tree = tree;
    this.graph = new DepGraph({ circular: true });

    this.processGraph(this.tree);
  }

  /**
   * Transforms our tree into a graph
   *
   * @param tree
   * @param parent
   */
  protected processGraph(tree, parent?: string) {
    for (let key in tree) {
      const value = tree[key];
      if (!this.graph.hasNode(key)) {
        this.graph.addNode(key);
      }

      if (this.isLeaf(value)) {
        if (parent) {
          this.graph.addDependency(parent, key);
        }
      } else {
        this.processGraph(value, key);
      }
    }
  }

  protected isLeaf(value) {
    return value === 1;
  }

  public getSubRolesOf(role: string) {
    return this.graph.dependenciesOf(role);
  }

  public getParentRolesOf(role: string | string[]) {
    if (Array.isArray(role)) {
      const roles = [];
      role.forEach((r) => {
        roles.push(...this.getParentRolesOf(r));
      });

      return roles;
    } else {
      return this.graph.dependantsOf(role);
    }
  }
}
